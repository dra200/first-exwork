import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import axios from "axios";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertProposalSchema, 
  insertPaymentSchema, 
  insertMessageSchema 
} from "@shared/schema";
import { 
  isAuthenticated, 
  checkRole, 
  loginSchema, 
  registerSchema, 
  hashPassword, 
  checkPassword, 
  getCurrentUser,
  sessionMiddleware 
} from "./auth";
import { 
  sendProjectPostedEmail, 
  sendProposalReceivedEmail, 
  sendPaymentProcessedEmail, 
  sendMessageNotificationEmail, 
  initEmailTransport 
} from "./email";
import Stripe from "stripe";

// Use any type to bypass API version compatibility check
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_your_key", {
  apiVersion: "2023-08-16" as any,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize email transport
  await initEmailTransport();

  // Set up session middleware
  app.use(sessionMiddleware);

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { confirmPassword, ...userData } = validatedData;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = hashPassword(userData.password);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Set user session
      req.session.userId = user.id;
      req.session.userRole = user.role as 'buyer' | 'seller';

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Check password
      const passwordMatch = checkPassword(validatedData.password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Set user session
      req.session.userId = user.id;
      req.session.userRole = user.role as 'buyer' | 'seller';

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(user);
  });

  // Project routes
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", isAuthenticated, checkRole('buyer'), async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertProjectSchema.parse({
        ...req.body,
        buyerId: user.id,
      });

      const project = await storage.createProject(validatedData);
      
      // In a production environment, we'd get all sellers and notify them
      // This is disabled for now to prevent LSP errors
      // const allUsers = await storage.getAllUsers();
      // const sellers = allUsers.filter(u => u.role === 'seller');
      
      // Send email notifications to sellers (in production)
      // for (const seller of sellers) {
      //   await sendProjectPostedEmail(seller.email, project.title);
      // }

      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id/status", isAuthenticated, checkRole('buyer'), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { status } = req.body;
      
      const statusSchema = z.enum(["open", "pending", "in_progress", "completed", "cancelled"]);
      const validatedStatus = statusSchema.parse(status);

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const user = await getCurrentUser(req);
      if (!user || user.id !== project.buyerId) {
        return res.status(403).json({ message: "You don't have permission to update this project" });
      }

      const updatedProject = await storage.updateProjectStatus(projectId, validatedStatus);
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update project status" });
    }
  });

  app.get("/api/buyer/projects", isAuthenticated, checkRole('buyer'), async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projects = await storage.getProjectsByBuyer(user.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Proposal routes
  app.get("/api/projects/:id/proposals", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Only allow buyer who posted the project or seller who submitted proposals to view
      if (user.id !== project.buyerId && user.role !== 'seller') {
        return res.status(403).json({ message: "You don't have permission to view these proposals" });
      }

      const proposals = await storage.getProposalsByProject(projectId);
      
      // For each proposal, get the seller info
      const proposalsWithSellerInfo = await Promise.all(
        proposals.map(async (proposal) => {
          const seller = await storage.getUser(proposal.sellerId);
          return {
            ...proposal,
            seller: seller ? { 
              id: seller.id, 
              name: seller.name, 
              email: seller.email 
            } : null,
          };
        })
      );
      
      res.json(proposalsWithSellerInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.post("/api/projects/:id/proposals", isAuthenticated, checkRole('seller'), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.status !== 'open') {
        return res.status(400).json({ message: "This project is not accepting proposals" });
      }

      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertProposalSchema.parse({
        ...req.body,
        projectId,
        sellerId: user.id,
      });

      // Check if seller already submitted a proposal
      const existingProposals = await storage.getProposalsByProject(projectId);
      const alreadySubmitted = existingProposals.some(p => p.sellerId === user.id);
      
      if (alreadySubmitted) {
        return res.status(400).json({ message: "You already submitted a proposal for this project" });
      }

      const proposal = await storage.createProposal(validatedData);
      
      // Send email notification to buyer
      const buyer = await storage.getUser(project.buyerId);
      if (buyer) {
        await sendProposalReceivedEmail(buyer.email, project.title, user.name);
      }

      res.status(201).json(proposal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  app.patch("/api/proposals/:id/status", isAuthenticated, checkRole('buyer'), async (req, res) => {
    try {
      const proposalId = parseInt(req.params.id);
      const { status } = req.body;
      
      const statusSchema = z.enum(["pending", "accepted", "rejected", "completed", "cancelled"]);
      const validatedStatus = statusSchema.parse(status);

      const proposal = await storage.getProposal(proposalId);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const project = await storage.getProject(proposal.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const user = await getCurrentUser(req);
      if (!user || user.id !== project.buyerId) {
        return res.status(403).json({ message: "You don't have permission to update this proposal" });
      }

      const updatedProposal = await storage.updateProposalStatus(proposalId, validatedStatus);
      
      // If proposal is accepted, update project status and reject other proposals
      if (validatedStatus === 'accepted') {
        await storage.updateProjectStatus(project.id, 'in_progress');
        
        // Get all other proposals and reject them
        const otherProposals = await storage.getProposalsByProject(project.id);
        for (const otherProposal of otherProposals) {
          if (otherProposal.id !== proposalId && otherProposal.status === 'pending') {
            await storage.updateProposalStatus(otherProposal.id, 'rejected');
          }
        }
      }

      res.json(updatedProposal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update proposal status" });
    }
  });

  app.get("/api/seller/proposals", isAuthenticated, checkRole('seller'), async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const proposals = await storage.getProposalsBySeller(user.id);
      
      // For each proposal, get the project info
      const proposalsWithProjectInfo = await Promise.all(
        proposals.map(async (proposal) => {
          const project = await storage.getProject(proposal.projectId);
          return {
            ...proposal,
            project: project || null,
          };
        })
      );
      
      res.json(proposalsWithProjectInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", isAuthenticated, checkRole('buyer'), async (req, res) => {
    try {
      const { proposalId } = req.body;
      
      if (!proposalId) {
        return res.status(400).json({ message: "Proposal ID is required" });
      }

      const proposal = await storage.getProposal(parseInt(proposalId));
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const project = await storage.getProject(proposal.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const user = await getCurrentUser(req);
      if (!user || user.id !== project.buyerId) {
        return res.status(403).json({ message: "You don't have permission to make this payment" });
      }

      // Calculate 15% commission
      const amount = parseFloat(proposal.price.toString());
      const commission = amount * 0.15;
      const amountInCents = Math.round(amount * 100);

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        // In production, you would include metadata about the payment
        metadata: {
          proposalId: proposal.id.toString(),
          projectId: project.id.toString(),
          buyerId: user.id.toString(),
          sellerId: proposal.sellerId.toString(),
        },
      });

      // Create payment record
      await storage.createPayment({
        amount: amount.toString(),
        commission: commission.toString(),
        projectId: project.id,
        buyerId: user.id,
        sellerId: proposal.sellerId,
        stripePaymentIntentId: paymentIntent.id,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  // This would be a webhook in production to handle successful payments
  app.post("/api/payments/confirm", isAuthenticated, checkRole('buyer'), async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }

      // In production, verify this with Stripe's API
      
      // Update payment status
      const payments = Array.from(await storage.getPaymentsByBuyer(req.session.userId!));
      const payment = payments.find(p => p.stripePaymentIntentId === paymentIntentId);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const updatedPayment = await storage.updatePaymentStatus(payment.id, 'completed');
      
      // Send email notifications
      const buyer = await storage.getUser(payment.buyerId);
      const seller = await storage.getUser(payment.sellerId);
      const project = await storage.getProject(payment.projectId);
      
      if (buyer && seller && project) {
        await sendPaymentProcessedEmail(buyer.email, project.title, parseFloat(payment.amount.toString()));
        await sendPaymentProcessedEmail(seller.email, project.title, parseFloat(payment.amount.toString()) - parseFloat(payment.commission.toString()));
      }

      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  app.get("/api/buyer/payments", isAuthenticated, checkRole('buyer'), async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const payments = await storage.getPaymentsByBuyer(user.id);
      
      // For each payment, get the project and seller info
      const paymentsWithInfo = await Promise.all(
        payments.map(async (payment) => {
          const project = await storage.getProject(payment.projectId);
          const seller = await storage.getUser(payment.sellerId);
          return {
            ...payment,
            project: project ? { id: project.id, title: project.title } : null,
            seller: seller ? { id: seller.id, name: seller.name } : null,
          };
        })
      );
      
      res.json(paymentsWithInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/seller/earnings", isAuthenticated, checkRole('seller'), async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const payments = await storage.getPaymentsBySeller(user.id);
      
      // For each payment, get the project and buyer info
      const earningsWithInfo = await Promise.all(
        payments.map(async (payment) => {
          const project = await storage.getProject(payment.projectId);
          const buyer = await storage.getUser(payment.buyerId);
          // Calculate net amount (after commission)
          const amount = parseFloat(payment.amount.toString());
          const commission = parseFloat(payment.commission.toString());
          const netAmount = amount - commission;
          
          return {
            ...payment,
            netAmount,
            project: project ? { id: project.id, title: project.title } : null,
            buyer: buyer ? { id: buyer.id, name: buyer.name } : null,
          };
        })
      );
      
      res.json(earningsWithInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  // Message routes
  app.get("/api/projects/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Verify user is part of this project
      if (user.id !== project.buyerId) {
        // Check if user is a seller with an accepted proposal
        const proposals = await storage.getProposalsByProject(projectId);
        const userProposal = proposals.find(p => p.sellerId === user.id && p.status === 'accepted');
        
        if (!userProposal) {
          return res.status(403).json({ message: "You don't have permission to view these messages" });
        }
      }

      const messages = await storage.getMessagesByProject(projectId);
      
      // For each message, get the sender info and mark as read if current user is receiver
      const messagesWithInfo = await Promise.all(
        messages.map(async (message) => {
          const sender = await storage.getUser(message.senderId);
          
          // Mark as read if current user is receiver
          if (!message.read && message.receiverId === user.id) {
            await storage.markMessageAsRead(message.id);
          }
          
          return {
            ...message,
            sender: sender ? { id: sender.id, name: sender.name } : null,
          };
        })
      );
      
      res.json(messagesWithInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/projects/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { content, receiverId } = req.body;
      
      if (!content || !receiverId) {
        return res.status(400).json({ message: "Content and receiver ID are required" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Verify user is part of this project
      if (user.id !== project.buyerId) {
        // Check if user is a seller with an accepted proposal
        const proposals = await storage.getProposalsByProject(projectId);
        const userProposal = proposals.find(p => p.sellerId === user.id && p.status === 'accepted');
        
        if (!userProposal) {
          return res.status(403).json({ message: "You don't have permission to send messages in this project" });
        }
      }

      // Verify receiver is part of this project
      const receiver = await storage.getUser(parseInt(receiverId));
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }

      if (receiver.id !== project.buyerId) {
        // Check if receiver is a seller with an accepted proposal
        const proposals = await storage.getProposalsByProject(projectId);
        const receiverProposal = proposals.find(p => p.sellerId === receiver.id && p.status === 'accepted');
        
        if (!receiverProposal) {
          return res.status(403).json({ message: "Receiver is not part of this project" });
        }
      }

      const validatedData = insertMessageSchema.parse({
        content,
        senderId: user.id,
        receiverId: parseInt(receiverId),
        projectId,
      });

      const message = await storage.createMessage(validatedData);
      
      // Send email notification
      await sendMessageNotificationEmail(receiver.email, user.name, project.title);

      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages/unread-count", isAuthenticated, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const count = await storage.getUnreadMessageCount(user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread message count" });
    }
  });

  // ML API proxy routes
  const ML_API_BASE_URL = "http://localhost:5001"; // ML API URL

  // Project recommendations for sellers
  app.get("/api/ml/recommendations/projects/:sellerId", isAuthenticated, checkRole('seller'), async (req, res) => {
    try {
      const sellerId = req.params.sellerId;
      const response = await axios.get(`${ML_API_BASE_URL}/api/recommend/projects/${sellerId}`);
      res.json(response.data);
    } catch (error: any) {
      console.error("ML API recommendation error:", error.message);
      res.status(500).json({ message: "Failed to get project recommendations" });
    }
  });

  // Seller recommendations for projects
  app.get("/api/ml/recommendations/sellers/:projectId", isAuthenticated, checkRole('buyer'), async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const response = await axios.get(`${ML_API_BASE_URL}/api/recommend/sellers/${projectId}`);
      res.json(response.data);
    } catch (error: any) {
      console.error("ML API recommendation error:", error.message);
      res.status(500).json({ message: "Failed to get seller recommendations" });
    }
  });

  // Price prediction for projects
  app.post("/api/ml/price-prediction", isAuthenticated, async (req, res) => {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/api/predict/price`, req.body);
      res.json(response.data);
    } catch (error: any) {
      console.error("ML API price prediction error:", error.message);
      res.status(500).json({ message: "Failed to predict price" });
    }
  });

  // Proposal price evaluation
  app.post("/api/ml/evaluate-proposal", isAuthenticated, async (req, res) => {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/api/evaluate/proposal`, req.body);
      res.json(response.data);
    } catch (error: any) {
      console.error("ML API proposal evaluation error:", error.message);
      res.status(500).json({ message: "Failed to evaluate proposal" });
    }
  });

  // Market analytics
  app.get("/api/ml/analytics/market", isAuthenticated, async (req, res) => {
    try {
      const response = await axios.get(`${ML_API_BASE_URL}/api/analytics/market`);
      res.json(response.data);
    } catch (error: any) {
      console.error("ML API market analytics error:", error.message);
      res.status(500).json({ message: "Failed to get market analytics" });
    }
  });

  // Buyer analytics
  app.get("/api/ml/analytics/buyer/:buyerId", isAuthenticated, checkRole('buyer'), async (req, res) => {
    try {
      const buyerId = req.params.buyerId;
      const user = await getCurrentUser(req);
      if (!user || user.id !== parseInt(buyerId)) {
        return res.status(403).json({ message: "You don't have permission to access these analytics" });
      }
      
      const response = await axios.get(`${ML_API_BASE_URL}/api/analytics/buyer/${buyerId}`);
      res.json(response.data);
    } catch (error: any) {
      console.error("ML API buyer analytics error:", error.message);
      res.status(500).json({ message: "Failed to get buyer analytics" });
    }
  });

  // Seller analytics
  app.get("/api/ml/analytics/seller/:sellerId", isAuthenticated, checkRole('seller'), async (req, res) => {
    try {
      const sellerId = req.params.sellerId;
      const user = await getCurrentUser(req);
      if (!user || user.id !== parseInt(sellerId)) {
        return res.status(403).json({ message: "You don't have permission to access these analytics" });
      }
      
      const response = await axios.get(`${ML_API_BASE_URL}/api/analytics/seller/${sellerId}`);
      res.json(response.data);
    } catch (error: any) {
      console.error("ML API seller analytics error:", error.message);
      res.status(500).json({ message: "Failed to get seller analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
