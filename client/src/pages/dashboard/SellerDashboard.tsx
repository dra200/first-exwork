import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectRecommendations } from '@/components/dashboard/ProjectRecommendations';
import { BusinessAnalytics } from '@/components/dashboard/BusinessAnalytics';

interface DashboardStat {
  title: string;
  count: number | string;
  description: string;
  linkText: string;
  linkPath: string;
}

interface RecentActivity {
  type: 'project_accepted' | 'payment_received' | 'proposal_submitted';
  title: string;
  details: string;
  timestamp: string;
  icon: React.ReactNode;
}

const SellerDashboard = () => {
  const [, navigate] = useLocation();

  // Fetch active projects
  const { data: activeProjects } = useQuery<any[]>({ 
    queryKey: ['/api/seller/active-projects'],
  });

  // Fetch proposals sent
  const { data: proposals } = useQuery<any[]>({ 
    queryKey: ['/api/seller/proposals'],
  });

  // Fetch earnings
  const { data: earnings } = useQuery<any>({ 
    queryKey: ['/api/seller/earnings/summary'],
  });

  // Fetch unread message count
  const { data: messageData } = useQuery<{count: number}>({ 
    queryKey: ['/api/messages/unread-count'],
  });
  
  // Dashboard stats for the cards
  const dashboardStats: DashboardStat[] = [
    {
      title: 'Active Projects',
      count: activeProjects?.length || 0,
      description: 'Projects currently in progress',
      linkText: 'View projects',
      linkPath: '/dashboard/active-projects'
    },
    {
      title: 'Proposals Sent',
      count: proposals?.filter(p => p.status === 'pending').length || 0,
      description: 'Awaiting client response',
      linkText: 'Track proposals',
      linkPath: '/dashboard/my-proposals'
    },
    {
      title: 'Earnings',
      count: earnings?.currentMonth ? `$${earnings.currentMonth}` : '$0',
      description: 'Total earnings this month',
      linkText: 'View payment history',
      linkPath: '/dashboard/earnings'
    }
  ];

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Example recent activities
  const recentActivities: RecentActivity[] = [
    {
      type: 'project_accepted',
      title: 'Project Accepted',
      details: 'Your proposal for "E-commerce Website Redesign" was accepted',
      timestamp: new Date().toISOString(),
      icon: (
        <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
        </div>
      )
    },
    {
      type: 'payment_received',
      title: 'Payment Received',
      details: 'You received $2,400 for "CRM Integration"',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // yesterday
      icon: (
        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
      )
    },
    {
      type: 'proposal_submitted',
      title: 'Proposal Submitted',
      details: 'You submitted a proposal for "Mobile App Development"',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      icon: (
        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        
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
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="font-bold">Recent Activity</h2>
            </div>
            
            <div className="divide-y divide-neutral-100">
              {recentActivities.map((activity, index) => (
                <div key={index} className="p-4 flex items-start">
                  {activity.icon}
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-neutral-500 mb-1">{activity.details}</div>
                    <div className="text-xs text-neutral-500">{formatDate(activity.timestamp)}</div>
                  </div>
                </div>
              ))}

              {/* If no recent activities, show an empty state */}
              {recentActivities.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-neutral-500">No recent activities yet.</p>
                  <Button 
                    className="mt-4 bg-primary text-white hover:bg-primary-dark"
                    onClick={() => navigate('/dashboard/browse-projects')}
                  >
                    Browse Projects
                  </Button>
                </div>
              )}
            </div>
          </Card>
          
          {/* AI Project Recommendations */}
          <div className="space-y-6">
            <ProjectRecommendations />
          </div>
        </div>
        
        {/* Business Analytics from ML */}
        <BusinessAnalytics />
      </div>
    </DashboardLayout>
  );
};

export default SellerDashboard;
