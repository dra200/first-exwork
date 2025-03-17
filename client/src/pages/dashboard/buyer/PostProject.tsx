import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { createProject } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
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
import { X } from 'lucide-react';

// Project form schema
const projectSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(30, { message: "Description must be at least 30 characters" }),
  budget: z.coerce.number().min(1, { message: "Budget must be greater than 0" }),
  deadline: z.string().refine(date => new Date(date) > new Date(), {
    message: "Deadline must be in the future"
  }),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const PostProject = () => {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  // React Hook Form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: undefined,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => createProject(data),
    onSuccess: () => {
      toast({
        title: "Project posted successfully",
        description: "Your project is now live and available for proposals.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/buyer/projects'] });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post project",
        description: error.message || "Please check the information and try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ProjectFormValues) => {
    // You can include skills and other data here if needed
    createProjectMutation.mutate(data);
  };

  // Handle adding skills
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(currentSkill.trim())) {
        setSkills([...skills, currentSkill.trim()]);
      }
      setCurrentSkill('');
    }
  };

  // Handle removing skills
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Post a New Project</h1>
        
        <Card className="bg-white p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. E-commerce Website Development" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your project requirements in detail..." 
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
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 5000" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormLabel>Required Skills</FormLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  {skills.map((skill, index) => (
                    <div key={index} className="px-3 py-1 bg-blue-100 text-primary rounded-full text-sm flex items-center">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1 text-primary-dark">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <Input 
                    type="text" 
                    className="border-b border-dashed border-primary outline-none text-sm min-w-[120px] max-w-[200px]" 
                    placeholder="Add skill..."
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                  />
                </div>
              </div>
              
              <div>
                <FormLabel>Attachments (optional)</FormLabel>
                <div className="border-2 border-dashed border-neutral-200 rounded-md p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-neutral-400">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p className="text-sm text-neutral-500 mb-2">Drag files here or click to upload</p>
                  <p className="text-xs text-neutral-500">Max file size: 10MB (PDF, DOC, JPG)</p>
                  <input type="file" className="hidden" multiple />
                  <Button type="button" variant="outline" className="mt-4">
                    Choose Files
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Posting..." : "Post Project"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PostProject;
