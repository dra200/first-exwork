import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getProject, submitProposal } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';

// Schema for proposal form
const proposalSchema = z.object({
  serviceDetails: z.string().min(30, { message: "Service details must be at least 30 characters" }),
  price: z.coerce.number().min(1, { message: "Price must be greater than 0" }).max(1000000, { message: "Price cannot exceed $1,000,000" }),
  deliveryTime: z.coerce.number().min(1, { message: "Delivery time must be at least 1 day" }).max(365, { message: "Delivery time cannot exceed 365 days" }),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface SubmitProposalProps {
  projectId: string;
}

const SubmitProposal: React.FC<SubmitProposalProps> = ({ projectId }) => {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const parsedProjectId = parseInt(projectId);

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: [`/api/projects/${parsedProjectId}`],
    onError: () => {
      toast({
        title: "Error",
        description: "Could not load project details. Please try again.",
        variant: "destructive",
      });
      navigate('/dashboard/browse-projects');
    }
  });

  // React Hook Form
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      serviceDetails: '',
      price: undefined,
      deliveryTime: undefined,
    },
  });

  // Submit proposal mutation
  const submitProposalMutation = useMutation({
    mutationFn: (data: ProposalFormValues) => 
      submitProposal(parsedProjectId, data),
    onSuccess: () => {
      toast({
        title: "Proposal submitted successfully",
        description: "Your proposal has been sent to the client.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/proposals'] });
      navigate('/dashboard/my-proposals');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit proposal",
        description: error.message || "Please check your proposal and try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ProposalFormValues) => {
    submitProposalMutation.mutate(data);
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/dashboard/browse-projects');
  };

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Submit a Proposal</h1>
        
        {projectLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-500">Loading project details...</p>
          </div>
        ) : project ? (
          <>
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">{project.title}</h2>
                <p className="text-sm text-neutral-600 mb-4">{project.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-neutral-500">Budget</p>
                    <p className="font-semibold">{formatCurrency(project.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Deadline</p>
                    <p className="font-semibold">{formatDate(project.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Posted On</p>
                    <p className="font-semibold">{formatDate(project.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Separator />
            
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="font-bold mb-4">Your Proposal</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="serviceDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe how you can meet the client's requirements and why you're the best fit for this project..." 
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Price (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g. 5000" 
                                {...field} 
                              />
                            </FormControl>
                            <p className="text-xs text-neutral-500">
                              Client's budget: {formatCurrency(project.budget)}
                              {parseFloat(form.watch('price') || '0') > project.budget && (
                                <span className="text-yellow-600 ml-2">
                                  Your price exceeds the client's budget
                                </span>
                              )}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="deliveryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Time (days)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g. 21" 
                                {...field} 
                              />
                            </FormControl>
                            <p className="text-xs text-neutral-500">
                              Expected deadline: {formatDate(project.deadline)}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-4 bg-neutral-50 p-4 rounded-md">
                      <p className="text-sm font-medium mb-2">Important Notes</p>
                      <ul className="text-sm text-neutral-600 list-disc pl-5 space-y-1">
                        <li>TechConnect charges a 15% commission on all payments.</li>
                        <li>Your proposal will be visible to the client once submitted.</li>
                        <li>You can't edit your proposal after submission.</li>
                        <li>Direct contact information is not allowed in proposals.</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-dark text-white"
                        disabled={submitProposalMutation.isPending}
                      >
                        {submitProposalMutation.isPending ? "Submitting..." : "Submit Proposal"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-neutral-500">Project not found or has been removed.</p>
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

export default SubmitProposal;
