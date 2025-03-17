import { apiRequest } from '@/lib/queryClient';
import { Project, User, Proposal, Payment } from '@shared/schema';

// Auth API calls
export const login = async (email: string, password: string) => {
  const response = await apiRequest('POST', '/api/auth/login', { email, password });
  return response.json();
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'buyer' | 'seller';
}) => {
  const response = await apiRequest('POST', '/api/auth/register', userData);
  return response.json();
};

export const logout = async () => {
  const response = await apiRequest('POST', '/api/auth/logout');
  return response.json();
};

export const getCurrentUser = async () => {
  const response = await apiRequest('GET', '/api/auth/me');
  return response.json();
};

// Projects API calls
export const getProjects = async () => {
  const response = await apiRequest('GET', '/api/projects');
  return response.json();
};

export const getProject = async (id: number) => {
  const response = await apiRequest('GET', `/api/projects/${id}`);
  return response.json();
};

export const createProject = async (projectData: {
  title: string;
  description: string;
  budget: number;
  deadline: string;
}) => {
  const response = await apiRequest('POST', '/api/projects', projectData);
  return response.json();
};

export const updateProjectStatus = async (id: number, status: string) => {
  const response = await apiRequest('PATCH', `/api/projects/${id}/status`, { status });
  return response.json();
};

export const getBuyerProjects = async () => {
  const response = await apiRequest('GET', '/api/buyer/projects');
  return response.json();
};

// Proposals API calls
export const getProjectProposals = async (projectId: number) => {
  const response = await apiRequest('GET', `/api/projects/${projectId}/proposals`);
  return response.json();
};

export const submitProposal = async (projectId: number, proposalData: {
  serviceDetails: string;
  price: number;
  deliveryTime: number;
}) => {
  const response = await apiRequest('POST', `/api/projects/${projectId}/proposals`, proposalData);
  return response.json();
};

export const updateProposalStatus = async (id: number, status: string) => {
  const response = await apiRequest('PATCH', `/api/proposals/${id}/status`, { status });
  return response.json();
};

export const getSellerProposals = async () => {
  const response = await apiRequest('GET', '/api/seller/proposals');
  return response.json();
};

// Messages API calls
export const getProjectMessages = async (projectId: number) => {
  const response = await apiRequest('GET', `/api/projects/${projectId}/messages`);
  return response.json();
};

export const sendMessage = async (projectId: number, content: string, receiverId: number) => {
  const response = await apiRequest('POST', `/api/projects/${projectId}/messages`, {
    content,
    receiverId
  });
  return response.json();
};

export const getUnreadMessageCount = async () => {
  const response = await apiRequest('GET', '/api/messages/unread-count');
  return response.json();
};

// Payment API calls
export const createPaymentIntent = async (proposalId: number) => {
  const response = await apiRequest('POST', '/api/create-payment-intent', { proposalId });
  return response.json();
};

export const confirmPayment = async (paymentIntentId: string) => {
  const response = await apiRequest('POST', '/api/payments/confirm', { paymentIntentId });
  return response.json();
};

export const getBuyerPayments = async () => {
  const response = await apiRequest('GET', '/api/buyer/payments');
  return response.json();
};

export const getSellerEarnings = async () => {
  const response = await apiRequest('GET', '/api/seller/earnings');
  return response.json();
};

// ML API integration

/**
 * Get project recommendations for a seller
 */
export const getProjectRecommendations = async (sellerId: number) => {
  const response = await apiRequest('GET', `/api/ml/recommendations/projects/${sellerId}`);
  return response.json();
};

/**
 * Get seller recommendations for a project
 */
export const getSellerRecommendations = async (projectId: number) => {
  const response = await apiRequest('GET', `/api/ml/recommendations/sellers/${projectId}`);
  return response.json();
};

/**
 * Get price prediction for a project
 */
export const getPricePrediction = async (projectData: any) => {
  const response = await apiRequest('POST', '/api/ml/price-prediction', projectData);
  return response.json();
};

/**
 * Evaluate a proposal price
 */
export const evaluateProposalPrice = async (projectId: number, price: number) => {
  const response = await apiRequest('POST', '/api/ml/evaluate-proposal', { projectId, price });
  return response.json();
};

/**
 * Get market analytics
 */
export const getMarketAnalytics = async () => {
  const response = await apiRequest('GET', '/api/ml/analytics/market');
  return response.json();
};

/**
 * Get buyer analytics
 */
export const getBuyerAnalytics = async (buyerId: number) => {
  const response = await apiRequest('GET', `/api/ml/analytics/buyer/${buyerId}`);
  return response.json();
};

/**
 * Get seller analytics
 */
export const getSellerAnalytics = async (sellerId: number) => {
  const response = await apiRequest('GET', `/api/ml/analytics/seller/${sellerId}`);
  return response.json();
};
