import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getProjects } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  buyerId: number;
  createdAt: string;
}

const BrowseProjects = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  // Fetch all projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Filter open projects
  const openProjects = projects.filter(p => p.status === 'open');

  // Handle search and filtering
  const filteredProjects = openProjects.filter(project => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter (mock categories based on title/description)
    if (categoryFilter !== 'all') {
      const hasCategory = project.title.toLowerCase().includes(categoryFilter.toLowerCase()) || 
                         project.description.toLowerCase().includes(categoryFilter.toLowerCase());
      return matchesSearch && hasCategory;
    }
    
    return matchesSearch;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'budget-high':
        return parseFloat(b.budget.toString()) - parseFloat(a.budget.toString());
      case 'budget-low':
        return parseFloat(a.budget.toString()) - parseFloat(b.budget.toString());
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      default:
        return 0;
    }
  });

  // Handle submit proposal
  const handleSubmitProposal = (projectId: number) => {
    navigate(`/dashboard/projects/${projectId}/submit-proposal`);
  };

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Browse Projects</h1>
          
          <div className="flex items-center space-x-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web">Web Development</SelectItem>
                <SelectItem value="mobile">Mobile Apps</SelectItem>
                <SelectItem value="design">UX/UI Design</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort: Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort: Newest</SelectItem>
                <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                <SelectItem value="deadline">Deadline: Soonest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="relative">
          <Input 
            type="text" 
            className="pl-10 pr-3 py-3" 
            placeholder="Search projects by keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
        </div>
        
        {/* Project Cards */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-500">Loading projects...</p>
          </div>
        ) : sortedProjects.length > 0 ? (
          <div className="space-y-6">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                budget={parseFloat(project.budget.toString())}
                deadline={project.deadline}
                status={project.status}
                createdAt={project.createdAt}
                skills={['Web Development', 'JavaScript', 'UI/UX Design']} // Mock skills
                proposalCount={Math.floor(Math.random() * 20)} // Mock proposal count
                buttonText="Submit Proposal"
                onClick={() => handleSubmitProposal(project.id)}
                isDetailed={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-neutral-500">No projects found matching your criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrowseProjects;
