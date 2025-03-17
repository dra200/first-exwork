import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { getProject } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';
import { SellerRecommendations } from '@/components/dashboard/SellerRecommendations';
import { ProposalEvaluation } from '@/components/dashboard/ProposalEvaluation';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['/api/projects', parseInt(id)],
    queryFn: () => getProject(parseInt(id)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <DashboardLayout role="buyer">
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-neutral-500">Loading project details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout role="buyer">
        <div className="h-96 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-neutral-500 mb-4">The project you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const { bgColor, textColor } = getStatusColor(status);
    return (
      <Badge className={`${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {getStatusBadge(project.status)}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Budget</h3>
                <p className="text-lg font-semibold">{formatCurrency(project.budget)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Deadline</h3>
                <p className="text-lg font-semibold">{formatDate(project.deadline)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Posted On</h3>
                <p className="text-lg font-semibold">{formatDate(project.createdAt)}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-500 mb-2">Description</h3>
              <p className="text-neutral-700 whitespace-pre-line">{project.description}</p>
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={() => navigate('/dashboard/proposals/' + project.id)}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                View Proposals
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/messages')}
              >
                Messages
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">Seller Recommendations</TabsTrigger>
            <TabsTrigger value="proposal-evaluation">Proposal Evaluation</TabsTrigger>
          </TabsList>
          <TabsContent value="recommendations" className="mt-4">
            <SellerRecommendations projectId={parseInt(id)} />
          </TabsContent>
          <TabsContent value="proposal-evaluation" className="mt-4">
            <ProposalEvaluation projectId={parseInt(id)} projectBudget={project.budget} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;