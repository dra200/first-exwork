import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  proposals, type Proposal, type InsertProposal,
  payments, type Payment, type InsertPayment,
  messages, type Message, type InsertMessage
} from "@shared/schema";

// Storage interface for all database operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProjectsByBuyer(buyerId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProjectStatus(id: number, status: Project['status']): Promise<Project | undefined>;

  // Proposal operations
  getProposalsByProject(projectId: number): Promise<Proposal[]>;
  getProposalsBySeller(sellerId: number): Promise<Proposal[]>;
  getProposal(id: number): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposalStatus(id: number, status: Proposal['status']): Promise<Proposal | undefined>;

  // Payment operations
  getPaymentsByBuyer(buyerId: number): Promise<Payment[]>;
  getPaymentsBySeller(sellerId: number): Promise<Payment[]>;
  getPaymentsByProject(projectId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: Payment['status'], stripePaymentId?: string): Promise<Payment | undefined>;

  // Message operations
  getMessagesByProject(projectId: number): Promise<Message[]>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getUnreadMessageCount(userId: number): Promise<number>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private proposals: Map<number, Proposal>;
  private payments: Map<number, Payment>;
  private messages: Map<number, Message>;
  private userIdCounter: number;
  private projectIdCounter: number;
  private proposalIdCounter: number;
  private paymentIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.proposals = new Map();
    this.payments = new Map();
    this.messages = new Map();
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.proposalIdCounter = 1;
    this.paymentIdCounter = 1;
    this.messageIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProjectsByBuyer(buyerId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.buyerId === buyerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const createdAt = new Date();
    const status = "open" as const;
    const project: Project = { ...insertProject, id, status, createdAt };
    this.projects.set(id, project);
    return project;
  }

  async updateProjectStatus(id: number, status: Project['status']): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, status };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Proposal operations
  async getProposalsByProject(projectId: number): Promise<Proposal[]> {
    return Array.from(this.proposals.values())
      .filter(proposal => proposal.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProposalsBySeller(sellerId: number): Promise<Proposal[]> {
    return Array.from(this.proposals.values())
      .filter(proposal => proposal.sellerId === sellerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = this.proposalIdCounter++;
    const createdAt = new Date();
    const status = "pending" as const;
    const proposal: Proposal = { ...insertProposal, id, status, createdAt };
    this.proposals.set(id, proposal);
    return proposal;
  }

  async updateProposalStatus(id: number, status: Proposal['status']): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (!proposal) return undefined;
    
    const updatedProposal = { ...proposal, status };
    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }

  // Payment operations
  async getPaymentsByBuyer(buyerId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.buyerId === buyerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPaymentsBySeller(sellerId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.sellerId === sellerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPaymentsByProject(projectId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const createdAt = new Date();
    const status = "pending" as const;
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      status, 
      createdAt,
      stripePaymentIntentId: insertPayment.stripePaymentIntentId || null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(
    id: number, 
    status: Payment['status'],
    stripePaymentIntentId?: string
  ): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { 
      ...payment, 
      status,
      stripePaymentIntentId: stripePaymentIntentId || payment.stripePaymentIntentId
    };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Message operations
  async getMessagesByProject(projectId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messages.values())
      .filter(message => message.receiverId === userId && !message.read)
      .length;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    const read = false;
    const message: Message = { ...insertMessage, id, read, createdAt };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
