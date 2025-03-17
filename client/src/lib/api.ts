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
