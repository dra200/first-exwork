import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getBuyerProjects, getProjectProposals } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, formatCurrency, formatDate } from '@/lib/utils';

interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  createdAt: string;
  buyerId: number;
}

interface Proposal {
  id: number;
  serviceDetails: string;
  price: number;
  deliveryTime: number;
  status: string;
  projectId: number;
  sellerId: number;
  createdAt: string;
  seller: {
    id: number;
    name: string;
  };
}

const OngoingProjects = () => {
  const [, navigate] = useLocation();

  // Fetch buyer's projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/buyer/projects'],
  });

  // Filter for active projects (in_progress or pending)
  const activeProjects = projects.filter(
    p => p.status === 'in_progress' || p.status === 'pending'
  );

  // Calculate progress (mock data - would come from backend in a real app)
  const getProjectProgress = (project: Project): number => {
    switch (project.status) {
      case 'in_progress':
        // In a real app, this would be based on milestones or actual progress
        return 65;
      case 'pending':
        return 30;
      default:
        return 0;
    }
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

  // Handle message seller
  const handleMessageSeller = (projectId: number, sellerId: number) => {
    navigate(`/dashboard/messages?projectId=${projectId}&sellerId=${sellerId}`);
  };

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Ongoing Projects</h1>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-500">Loading your projects...</p>
          </div>
        ) : activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeProjects.map((project) => (
              <Card key={project.id} className="bg-white overflow-hidden">
                <CardContent className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold">{project.title}</h2>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    Started: {formatDate(project.createdAt)} • Due: {formatDate(project.deadline)}
                  </div>
                </CardContent>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Progress</div>
                      <div className="text-sm">{getProjectProgress(project)}%</div>
                    </div>
                    <Progress value={getProjectProgress(project)} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-neutral-500">Budget</div>
                      <div className="font-medium">{formatCurrency(project.budget)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500">Payment Status</div>
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        {project.status === 'in_progress' ? '50% Paid' : '25% Paid'}
                      </Badge>
                    </div>
                  </div>
                  
                  {project.status === 'pending' && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Milestone Approval</div>
                      <div className="p-3 bg-neutral-100 bg-opacity-50 rounded-md mb-3">
                        <p className="text-sm">Database integration completed. Please review and approve to proceed to the next phase.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="px-6 py-4 bg-neutral-50 flex justify-between">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-blue-50"
                    onClick={() => handleMessageSeller(project.id, 1)} // Mock seller ID
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Message
                  </Button>
                  
                  {project.status === 'pending' ? (
                    <Button 
                      className="bg-primary text-white hover:bg-primary-dark"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      Approve Milestone
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-blue-50"
                      onClick={() => handleViewDetails(project.id)}
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
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-neutral-500">You don't have any ongoing projects.</p>
            <Button 
              className="mt-4 bg-primary text-white hover:bg-primary-dark"
              onClick={() => navigate('/dashboard/post-project')}
            >
              Post a New Project
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OngoingProjects;
