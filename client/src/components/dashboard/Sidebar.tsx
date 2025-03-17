import React from 'react';
import { Link, useLocation } from 'wouter';

// Define navigation item types
type NavItem = {
  path: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
};

type SidebarProps = {
  role: 'buyer' | 'seller';
  userName: string;
  isOpen: boolean;
  messageCount: number;
  onLogout: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ 
  role, 
  userName, 
  isOpen, 
  messageCount,
  onLogout 
}) => {
  const [location] = useLocation();
  
  // Buyer navigation items
  const buyerNavItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>,
      label: 'Dashboard'
    },
    {
      path: '/dashboard/post-project',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>,
      label: 'Post a Project'
    },
    {
      path: '/dashboard/proposals',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path><path d="M12 11v6"></path><path d="M9.5 14.5h5"></path></svg>,
      label: 'View Proposals'
    },
    {
      path: '/dashboard/ongoing',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M9 11.5 11 14l4-4.5"></path><path d="M21 12c0 1.2-.901 2.4-2.101 2.4-1.4 0-2.499-1.2-2.499-2.4 0-1.2 1.2-2.4 2.499-2.4S21 10.8 21 12Z"></path><path d="M4 12c0 1.2.9 2.4 2.1 2.4 1.4 0 2.499-1.2 2.499-2.4 0-1.2-1.2-2.4-2.499-2.4C4.9 9.6 4 10.8 4 12Z"></path><path d="M12 20c1.2 0 2.4-.901 2.4-2.101 0-1.4-1.2-2.499-2.4-2.499-1.2 0-2.4 1.2-2.4 2.499S10.8 20 12 20Z"></path><path d="M12 4c1.2 0 2.4.9 2.4 2.1 0 1.4-1.2 2.499-2.4 2.499-1.2 0-2.4-1.2-2.4-2.499C9.6 4.9 10.8 4 12 4Z"></path></svg>,
      label: 'Ongoing Projects'
    },
    {
      path: '/dashboard/messages',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
      label: 'Messages',
      badge: messageCount
    },
    {
      path: '/dashboard/payments',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>,
      label: 'Payments'
    }
  ];

  // Seller navigation items
  const sellerNavItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>,
      label: 'Dashboard'
    },
    {
      path: '/dashboard/browse-projects',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>,
      label: 'Browse Projects'
    },
    {
      path: '/dashboard/my-proposals',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path><path d="M12 11v6"></path><path d="M9.5 14.5h5"></path></svg>,
      label: 'My Proposals'
    },
    {
      path: '/dashboard/active-projects',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M9 11.5 11 14l4-4.5"></path><path d="M21 12c0 1.2-.901 2.4-2.101 2.4-1.4 0-2.499-1.2-2.499-2.4 0-1.2 1.2-2.4 2.499-2.4S21 10.8 21 12Z"></path><path d="M4 12c0 1.2.9 2.4 2.1 2.4 1.4 0 2.499-1.2 2.499-2.4 0-1.2-1.2-2.4-2.499-2.4C4.9 9.6 4 10.8 4 12Z"></path><path d="M12 20c1.2 0 2.4-.901 2.4-2.101 0-1.4-1.2-2.499-2.4-2.499-1.2 0-2.4 1.2-2.4 2.499S10.8 20 12 20Z"></path><path d="M12 4c1.2 0 2.4.9 2.4 2.1 0 1.4-1.2 2.499-2.4 2.499-1.2 0-2.4-1.2-2.4-2.499C9.6 4.9 10.8 4 12 4Z"></path></svg>,
      label: 'Active Projects'
    },
    {
      path: '/dashboard/messages',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
      label: 'Messages',
      badge: messageCount
    },
    {
      path: '/dashboard/earnings',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
      label: 'Earnings'
    }
  ];

  // Choose navigation based on role
  const navItems = role === 'buyer' ? buyerNavItems : sellerNavItems;

  return (
    <div className={`${isOpen ? 'block' : 'hidden'} md:flex md:w-64 bg-white border-r flex-col z-10 fixed md:static inset-y-0 left-0`}>
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary">TechConnect</h1>
      </div>
      
      <div className="p-2 flex-1">
        <div className="py-4 px-3 mb-3 rounded-md bg-blue-50">
          <p className="text-sm text-neutral-500">Logged in as</p>
          <p className="font-medium">{userName}</p>
          <p className="text-sm text-primary capitalize">{role} Account</p>
        </div>
        
        <nav>
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={`flex items-center w-full px-3 py-2.5 mb-1 rounded-md hover:bg-neutral-100 font-medium ${location === item.path ? 'bg-primary text-white hover:bg-primary-dark' : ''}`}>
                {item.icon}
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-primary text-white text-xs py-0.5 px-2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <button 
          className="flex items-center w-full px-3 py-2 text-neutral-500 hover:text-neutral-800"
          onClick={onLogout}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
