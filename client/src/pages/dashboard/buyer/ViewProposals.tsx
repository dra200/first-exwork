import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getBuyerProjects, getProjectProposals, updateProposalStatus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProposalCard from '@/components/dashboard/ProposalCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  createdAt: string;
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
    email: string;
  };
}

const ViewProposals = () => {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // Fetch buyer's projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/buyer/projects'],
  });

  // Fetch proposals for selected project
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: [`/api/projects/${selectedProject}/proposals`],
    enabled: !!selectedProject,
  });

  // Update proposal status mutation
  const acceptProposalMutation = useMutation({
    mutationFn: (proposalId: number) => updateProposalStatus(proposalId, 'accepted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/proposals`] });
      queryClient.invalidateQueries({ queryKey: ['/api/buyer/projects'] });
      toast({
        title: "Proposal accepted",
        description: "The project status has been updated and other proposals have been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to accept proposal",
        variant: "destructive",
      });
    },
  });

  // Filter projects with pending proposals
  const projectsWithProposals = projects.filter(p => p.status === 'open');

  // Handle project selection
  const handleSelectProject = (projectId: number) => {
    setSelectedProject(projectId);
  };

  // Handle proposal acceptance
  const handleAcceptProposal = (proposalId: number) => {
    acceptProposalMutation.mutate(proposalId);
  };

  // Handle messaging with a seller
  const handleMessageSeller = (projectId: number, sellerId: number) => {
    navigate(`/dashboard/messages?projectId=${projectId}&sellerId=${sellerId}`);
  };

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Project Proposals</h1>
        
        {projectsLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-500">Loading your projects...</p>
          </div>
        ) : projectsWithProposals.length > 0 ? (
          <Tabs defaultValue={projectsWithProposals[0].id.toString()} onValueChange={(value) => handleSelectProject(parseInt(value))}>
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-4">
              {projectsWithProposals.map((project) => (
                <TabsTrigger key={project.id} value={project.id.toString()}>
                  {project.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {projectsWithProposals.map((project) => (
              <TabsContent key={project.id} value={project.id.toString()}>
                <Card className="bg-white overflow-hidden mb-6">
                  <CardContent className="p-6 border-b">
                    <div className="flex justify-between items-center">
                      <h2 className="font-bold">{project.title}</h2>
                      <div className="text-sm">
                        <span className="text-neutral-500">Budget:</span> {formatCurrency(project.budget)} • 
                        <span className="text-neutral-500"> Posted:</span> {formatDate(project.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {proposalsLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-neutral-500">Loading proposals...</p>
                  </div>
                ) : proposals.length > 0 ? (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id}
                        id={proposal.id}
                        serviceDetails={proposal.serviceDetails}
                        price={proposal.price}
                        deliveryTime={proposal.deliveryTime}
                        status={proposal.status}
                        seller={{
                          id: proposal.seller.id,
                          name: proposal.seller.name,
                        }}
                        onAccept={() => handleAcceptProposal(proposal.id)}
                        onMessage={() => handleMessageSeller(project.id, proposal.seller.id)}
                        showActions={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-neutral-500">No proposals received yet for this project.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-10">
            <p className="text-neutral-500">You don't have any projects with proposals yet.</p>
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

export default ViewProposals;
