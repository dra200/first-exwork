import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'buyer' | 'seller';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<any>({ 
    queryKey: ['/api/auth/me'],
    staleTime: 300000, // 5 minutes
  });

  const { data: messageCount } = useQuery<{ count: number }>({ 
    queryKey: ['/api/messages/unread-count'],
    staleTime: 60000, // 1 minute
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      navigate('/login');
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar
        role={role}
        userName={user?.name || ''}
        isOpen={sidebarOpen}
        messageCount={messageCount?.count || 0}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <button 
            className="md:hidden text-neutral-800"
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <div className="md:hidden font-bold text-primary">TechConnect</div>
          
          <div className="flex items-center space-x-4">
            <button className="text-neutral-600 hover:text-neutral-800">
              <Bell size={20} />
            </button>
            
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
              {user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 p-6 bg-neutral-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
