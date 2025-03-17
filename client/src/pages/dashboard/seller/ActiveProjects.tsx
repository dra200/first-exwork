import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getSellerProposals } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, formatCurrency, formatDate } from '@/lib/utils';

interface Proposal {
  id: number;
  serviceDetails: string;
  price: number;
  deliveryTime: number;
  status: string;
  projectId: number;
  sellerId: number;
  createdAt: string;
  project: {
    id: number;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    status: string;
  };
}

const ActiveProjects = () => {
  const [, navigate] = useLocation();

  // Fetch seller's proposals
  const { data: proposals = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/seller/proposals'],
  });

  // Filter for accepted proposals with active projects
  const activeProjects = proposals.filter(
    p => p.status === 'accepted' && p.project.status === 'in_progress'
  );

  // Calculate progress (mock data - would come from backend in a real app)
  const getProjectProgress = (proposal: Proposal): number => {
    // In a real app, this would be based on milestones or actual progress
    const totalDays = proposal.deliveryTime;
    const elapsedDays = Math.floor((Date.now() - new Date(proposal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(Math.round((elapsedDays / totalDays) * 100), 100);
    return progress || 30; // Default to 30% if calculation fails
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const { bgColor, textColor } = getStatusColor(status);
    
    return (
      <Badge className={`${bgColor} ${textColor} border-0`}>
        {status === 'in_progress' ? 'In Progress' : 
         status === 'pending' ? 'Pending' : 
         status === 'completed' ? 'Completed' : 
         status === 'cancelled' ? 'Cancelled' : 
         'Open'}
      </Badge>
    );
  };

  // Handle view project details
  const handleViewDetails = (projectId: number) => {
    navigate(`/dashboard/projects/${projectId}`);
  };

  // Handle message client
  const handleMessageClient = (projectId: number) => {
    navigate(`/dashboard/messages?projectId=${projectId}`);
  };

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Active Projects</h1>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-500">Loading your active projects...</p>
          </div>
        ) : activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeProjects.map((proposal) => (
              <Card key={proposal.id} className="bg-white overflow-hidden">
                <CardContent className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold">{proposal.project.title}</h2>
                    {getStatusBadge(proposal.project.status)}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    Started: {formatDate(proposal.createdAt)} • Due: {formatDate(proposal.project.deadline)}
                  </div>
                </CardContent>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Progress</div>
                      <div className="text-sm">{getProjectProgress(proposal)}%</div>
                    </div>
                    <Progress value={getProjectProgress(proposal)} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-neutral-500">Your Bid</div>
                      <div className="font-medium">{formatCurrency(proposal.price)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500">Payment Status</div>
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        50% Received
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-neutral-500">Time Remaining</div>
                    <div className="font-medium">
                      {Math.max(0, Math.floor((new Date(proposal.project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="px-6 py-4 bg-neutral-50 flex justify-between">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-blue-50"
                    onClick={() => handleMessageClient(proposal.project.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Message Client
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-blue-50"
                    onClick={() => handleViewDetails(proposal.project.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-neutral-500">You don't have any active projects.</p>
            <Button 
              className="mt-4 bg-primary text-white hover:bg-primary-dark"
              onClick={() => navigate('/dashboard/browse-projects')}
            >
              Browse Projects
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActiveProjects;
