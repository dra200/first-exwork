import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getBuyerPayments, createPaymentIntent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CheckoutForm from '@/components/stripe/CheckoutForm';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_key');

interface Payment {
  id: number;
  amount: number;
  status: string;
  projectId: number;
  project: {
    id: number;
    title: string;
  };
  seller: {
    id: number;
    name: string;
  };
  createdAt: string;
}

const Payments = () => {
  const { toast } = useToast();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [clientSecret, setClientSecret] = useState('');

  // Fetch buyer payments
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['/api/buyer/payments'],
  });

  // Calculate total spent, pending, and upcoming payments
  const totalSpent = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const upcomingPayments = 8300; // Mock data for upcoming payments

  // Initialize payment
  const handleInitiatePayment = async (proposalId: number, amount: number) => {
    try {
      const response = await createPaymentIntent(proposalId);
      setClientSecret(response.clientSecret);
      setSelectedProposalId(proposalId);
      setPaymentAmount(amount);
      setPaymentModalOpen(true);
    } catch (error) {
      toast({
        title: "Failed to initialize payment",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Payment success handler
  const handlePaymentSuccess = () => {
    toast({
      title: "Payment successful",
      description: "Thank you for your payment!",
    });
    setPaymentModalOpen(false);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const { bgColor, textColor } = getStatusColor(status);
    
    return (
      <Badge className={`${bgColor} ${textColor} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        
        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Total Spent</h3>
              <span className="text-2xl font-bold">{formatCurrency(totalSpent)}</span>
            </div>
            <p className="text-sm text-neutral-500">Lifetime payments for all projects</p>
          </Card>
          
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Pending Payments</h3>
              <span className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingPayments)}</span>
            </div>
            <p className="text-sm text-neutral-500">Payments awaiting processing</p>
          </Card>
          
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Upcoming Payments</h3>
              <span className="text-2xl font-bold text-primary">{formatCurrency(upcomingPayments)}</span>
            </div>
            <p className="text-sm text-neutral-500">Due in the next 30 days</p>
          </Card>
        </div>
        
        {/* Payment Methods */}
        <Card className="bg-white overflow-hidden">
          <CardContent className="p-6 border-b flex justify-between items-center">
            <CardTitle>Payment Methods</CardTitle>
            <Button variant="link" className="text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add New Card
            </Button>
          </CardContent>
          
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 p-4 border rounded-md bg-neutral-50">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-800 mr-3">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
                <div>
                  <div className="font-medium">Visa ending in 4242</div>
                  <div className="text-sm text-neutral-500">Expires 05/2025</div>
                </div>
              </div>
              
              <div>
                <Badge className="bg-green-100 text-green-700 border-0 mr-2">
                  Default
                </Badge>
                <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 mr-3">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <circle cx="6" cy="12" r="2"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                <div>
                  <div className="font-medium">Mastercard ending in 8888</div>
                  <div className="text-sm text-neutral-500">Expires 11/2024</div>
                </div>
              </div>
              
              <div>
                <Button variant="link" className="text-primary">
                  Set as default
                </Button>
                <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment History */}
        <Card className="bg-white overflow-hidden">
          <CardContent className="p-6 border-b">
            <CardTitle>Payment History</CardTitle>
          </CardContent>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-neutral-500">Loading payment history...</p>
              </div>
            ) : payments.length > 0 ? (
              <table className="w-full">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4">{formatDate(payment.createdAt)}</td>
                      <td className="px-6 py-4">{payment.project.title}</td>
                      <td className="px-6 py-4">{payment.seller.name}</td>
                      <td className="px-6 py-4">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4">
                        {payment.status === 'completed' ? (
                          <Button variant="link" className="text-primary p-0 h-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            PDF
                          </Button>
                        ) : payment.status === 'pending' ? (
                          <Button 
                            variant="link" 
                            className="text-primary p-0 h-auto"
                            onClick={() => handleInitiatePayment(1, parseFloat(payment.amount.toString()))}
                          >
                            Pay Now
                          </Button>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-500">No payment history yet.</p>
              </div>
            )}
          </div>
        </Card>
        
        {/* Payment Modal */}
        <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
              <DialogDescription>
                Complete your payment securely with Stripe.
              </DialogDescription>
            </DialogHeader>
            
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  amount={paymentAmount} 
                  onSuccess={handlePaymentSuccess} 
                />
              </Elements>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
