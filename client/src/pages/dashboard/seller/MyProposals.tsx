import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getSellerProposals } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

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

const MyProposals = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch seller's proposals
  const { data: proposals = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/seller/proposals'],
  });

  // Filter proposals based on active tab
  const filteredProposals = activeTab === 'all' 
    ? proposals
    : proposals.filter(p => p.status === activeTab);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const { bgColor, textColor } = getStatusColor(status);
    
    return (
      <Badge className={`${bgColor} ${textColor} border-0`}>
        {status === 'pending' ? 'Pending' : 
         status === 'accepted' ? 'Accepted' : 
         status === 'rejected' ? 'Rejected' : 
         status === 'completed' ? 'Completed' : 
         'Cancelled'}
      </Badge>
    );
  };

  // Handle view project
  const handleViewProject = (projectId: number) => {
    navigate(`/dashboard/projects/${projectId}`);
  };

  // Handle message client
  const handleMessageClient = (projectId: number) => {
    navigate(`/dashboard/messages?projectId=${projectId}`);
  };

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Proposals</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Proposals</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-neutral-500">Loading your proposals...</p>
              </div>
            ) : filteredProposals.length > 0 ? (
              <div className="space-y-6">
                {filteredProposals.map((proposal) => (
                  <Card key={proposal.id} className="bg-white overflow-hidden">
                    <CardContent className="p-6 border-b">
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold">{proposal.project.title}</h2>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <div className="text-sm text-neutral-500 mb-4">
                        Submitted on {formatDate(proposal.createdAt)} • Project budget: {formatCurrency(proposal.project.budget)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-neutral-500">Your Price</div>
                          <div className="font-bold text-lg">{formatCurrency(proposal.price)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-500">Delivery Time</div>
                          <div className="font-medium">{proposal.deliveryTime} days</div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-500">Project Deadline</div>
                          <div className="font-medium">{formatDate(proposal.project.deadline)}</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-2">Your Proposal</div>
                        <p className="text-sm">{proposal.serviceDetails}</p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="px-6 py-4 bg-neutral-50 flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-blue-50"
                        onClick={() => handleViewProject(proposal.project.id)}
                      >
                        View Project
                      </Button>
                      
                      {proposal.status === 'accepted' && (
                        <Button
                          variant="outline"
                          className="border-primary text-primary hover:bg-blue-50"
                          onClick={() => handleMessageClient(proposal.project.id)}
                        >
                          Message Client
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-500">No proposals found in this category.</p>
                <Button 
                  className="mt-4 bg-primary text-white hover:bg-primary-dark"
                  onClick={() => navigate('/dashboard/browse-projects')}
                >
                  Browse Projects
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyProposals;
