import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PricePrediction } from '@/components/dashboard/PricePrediction';
import { BusinessAnalytics } from '@/components/dashboard/BusinessAnalytics';

interface DashboardStat {
  title: string;
  count: number;
  description: string;
  linkText: string;
  linkPath: string;
}

interface RecentProject {
  id: number;
  title: string;
  status: string;
  budget: number;
  deadline: string;
  proposalCount: number;
  createdAt: string;
}

const BuyerDashboard = () => {
  const [, navigate] = useLocation();

  // Fetch projects data
  const { data: projects, isLoading } = useQuery<RecentProject[]>({ 
    queryKey: ['/api/buyer/projects'],
  });

  // Fetch proposals data
  const { data: proposalCountData } = useQuery<{count: number}>({ 
    queryKey: ['/api/proposals/new-count'],
  });

  // Fetch unread message count
  const { data: messageData } = useQuery<{count: number}>({ 
    queryKey: ['/api/messages/unread-count'],
  });

  // Dashboard stats for the cards
  const dashboardStats: DashboardStat[] = [
    {
      title: 'Active Projects',
      count: projects?.filter(p => p.status === 'in_progress' || p.status === 'open').length || 0,
      description: 'You have projects in progress',
      linkText: 'View all projects',
      linkPath: '/dashboard/ongoing'
    },
    {
      title: 'New Proposals',
      count: proposalCountData?.count || 0,
      description: 'You have new proposals to review',
      linkText: 'Review proposals',
      linkPath: '/dashboard/proposals'
    },
    {
      title: 'Messages',
      count: messageData?.count || 0,
      description: 'You have unread messages',
      linkText: 'Check messages',
      linkPath: '/dashboard/messages'
    }
  ];

  // Status badge formatter
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      open: { color: "bg-blue-100 text-blue-700", label: "Open" },
      pending: { color: "bg-blue-100 text-blue-700", label: "Pending" },
      in_progress: { color: "bg-green-100 text-green-700", label: "In Progress" },
      reviewing: { color: "bg-yellow-100 text-yellow-700", label: "Reviewing" },
      completed: { color: "bg-green-100 text-green-700", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
    };
    
    const { color, label } = statusMap[status] || { color: "bg-gray-100 text-gray-700", label: status };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {label}
      </span>
    );
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{stat.title}</h3>
                <span className="text-2xl font-bold text-primary">{stat.count}</span>
              </div>
              <p className="text-sm text-neutral-500">{stat.description}</p>
              <Button 
                variant="link" 
                className="mt-4 text-sm text-primary p-0 h-auto" 
                onClick={() => navigate(stat.linkPath)}
              >
                {stat.linkText}
              </Button>
            </Card>
          ))}
        </div>
        
        {/* Recent Projects Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="font-bold">Recent Projects</h2>
            </div>
            
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center">Loading projects...</div>
              ) : projects && projects.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Proposals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {projects.slice(0, 5).map((project) => (
                      <tr key={project.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                        <td className="px-6 py-4">
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-neutral-500">Posted {formatDate(project.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(project.status)}
                        </td>
                        <td className="px-6 py-4">${project.budget}</td>
                        <td className="px-6 py-4">{project.proposalCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-neutral-500">You haven't posted any projects yet.</p>
                  <Button 
                    className="mt-4 bg-primary text-white hover:bg-primary-dark"
                    onClick={() => navigate('/dashboard/post-project')}
                  >
                    Post Your First Project
                  </Button>
                </div>
              )}
            </div>
          </Card>
          
          {/* AI Price Prediction */}
          <PricePrediction />
        </div>
        
        {/* Business Analytics from ML */}
        <BusinessAnalytics />
      </div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
