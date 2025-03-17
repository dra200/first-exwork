import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Dashboard Pages - Buyer
import BuyerDashboard from "@/pages/dashboard/BuyerDashboard";
import PostProject from "@/pages/dashboard/buyer/PostProject";
import ViewProposals from "@/pages/dashboard/buyer/ViewProposals";
import OngoingProjects from "@/pages/dashboard/buyer/OngoingProjects";
import BuyerMessages from "@/pages/dashboard/buyer/Messages";
import Payments from "@/pages/dashboard/buyer/Payments";
import ProjectDetail from "@/pages/dashboard/buyer/ProjectDetail";

// Dashboard Pages - Seller
import SellerDashboard from "@/pages/dashboard/SellerDashboard";
import BrowseProjects from "@/pages/dashboard/seller/BrowseProjects";
import MyProposals from "@/pages/dashboard/seller/MyProposals";
import ActiveProjects from "@/pages/dashboard/seller/ActiveProjects";
import SellerMessages from "@/pages/dashboard/seller/SellerMessages";
import Earnings from "@/pages/dashboard/seller/Earnings";
import SubmitProposal from "@/pages/dashboard/seller/SubmitProposal";

// Other Pages
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/not-found";

// Private route component - only accessible when authenticated
const PrivateRoute = ({ children, role }: { children: JSX.Element, role?: string }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  // Check role if specified
  if (role && user?.role !== role) {
    return <Redirect to="/dashboard" />;
  }
  
  return children;
};

// Dashboard router - routes to correct dashboard based on user role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  return user?.role === 'buyer' ? <BuyerDashboard /> : <SellerDashboard />;
};

// Dynamic messages component based on user role
const DynamicMessagesComponent = () => {
  const { user } = useAuth();
  
  return user?.role === 'buyer' ? <BuyerMessages /> : <SellerMessages />;
};

function Router() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      <Route path="/register">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Register />}
      </Route>
      
      {/* Buyer Routes */}
      <Route path="/dashboard">
        <PrivateRoute>
          <DashboardRouter />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/post-project">
        <PrivateRoute role="buyer">
          <PostProject />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/proposals">
        <PrivateRoute role="buyer">
          <ViewProposals />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/ongoing">
        <PrivateRoute role="buyer">
          <OngoingProjects />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/messages">
        <PrivateRoute>
          <DynamicMessagesComponent />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/payments">
        <PrivateRoute role="buyer">
          <Payments />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/projects/:id">
        {params => (
          <PrivateRoute role="buyer">
            <ProjectDetail />
          </PrivateRoute>
        )}
      </Route>
      
      {/* Seller Routes */}
      <Route path="/dashboard/browse-projects">
        <PrivateRoute role="seller">
          <BrowseProjects />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/my-proposals">
        <PrivateRoute role="seller">
          <MyProposals />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/active-projects">
        <PrivateRoute role="seller">
          <ActiveProjects />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/earnings">
        <PrivateRoute role="seller">
          <Earnings />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard/projects/:id/submit-proposal">
        {params => (
          <PrivateRoute role="seller">
            <SubmitProposal projectId={params.id} />
          </PrivateRoute>
        )}
      </Route>
      
      {/* Landing page */}
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <LandingPage />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
