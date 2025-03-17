import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSellerEarnings } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Earning {
  id: number;
  amount: number;
  netAmount: number;
  status: string;
  projectId: number;
  project: {
    id: number;
    title: string;
  };
  buyer: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface EarningsByMonth {
  name: string;
  amount: number;
}

const Earnings = () => {
  // Fetch seller earnings
  const { data: earnings = [], isLoading } = useQuery<Earning[]>({
    queryKey: ['/api/seller/earnings'],
  });

  // Calculate total earnings
  const totalEarnings = earnings
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + e.netAmount, 0);

  // Calculate pending earnings
  const pendingEarnings = earnings
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.netAmount, 0);

  // Calculate this month's earnings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthEarnings = earnings
    .filter(e => {
      const date = new Date(e.createdAt);
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear &&
             e.status === 'completed';
    })
    .reduce((sum, e) => sum + e.netAmount, 0);

  // Prepare chart data - last 6 months
  const getMonthlyEarningsData = (): EarningsByMonth[] => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: month.toLocaleString('default', { month: 'short' }),
        amount: 0
      });
    }
    
    // Populate with actual earnings
    earnings
      .filter(e => e.status === 'completed')
      .forEach(earning => {
        const date = new Date(earning.createdAt);
        const monthDiff = (now.getMonth() - date.getMonth()) + (12 * (now.getFullYear() - date.getFullYear()));
        
        if (monthDiff >= 0 && monthDiff < 6) {
          months[5 - monthDiff].amount += earning.netAmount;
        }
      });
    
    return months;
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
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Earnings</h1>
        
        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Total Earnings</h3>
              <span className="text-2xl font-bold">{formatCurrency(totalEarnings)}</span>
            </div>
            <p className="text-sm text-neutral-500">Lifetime earnings from all projects</p>
          </Card>
          
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Pending Payments</h3>
              <span className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingEarnings)}</span>
            </div>
            <p className="text-sm text-neutral-500">Payments being processed</p>
          </Card>
          
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">This Month</h3>
              <span className="text-2xl font-bold text-primary">{formatCurrency(thisMonthEarnings)}</span>
            </div>
            <p className="text-sm text-neutral-500">Earnings in {new Date().toLocaleString('default', { month: 'long' })}</p>
          </Card>
        </div>
        
        {/* Earnings Chart */}
        <Card className="bg-white overflow-hidden">
          <CardContent className="p-6 border-b">
            <CardTitle>Monthly Earnings</CardTitle>
          </CardContent>
          
          <CardContent className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getMonthlyEarningsData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value}`, 'Earnings']}
                  />
                  <Bar dataKey="amount" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Earnings History */}
        <Card className="bg-white overflow-hidden">
          <CardContent className="p-6 border-b">
            <CardTitle>Payment History</CardTitle>
          </CardContent>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-neutral-500">Loading earnings history...</p>
              </div>
            ) : earnings.length > 0 ? (
              <table className="w-full">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Platform Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Net Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {earnings.map((earning) => {
                    const platformFee = earning.amount - earning.netAmount;
                    
                    return (
                      <tr key={earning.id}>
                        <td className="px-6 py-4">{formatDate(earning.createdAt)}</td>
                        <td className="px-6 py-4">{earning.project.title}</td>
                        <td className="px-6 py-4">{earning.buyer.name}</td>
                        <td className="px-6 py-4">{formatCurrency(earning.amount)}</td>
                        <td className="px-6 py-4">{formatCurrency(platformFee)}</td>
                        <td className="px-6 py-4 font-medium">{formatCurrency(earning.netAmount)}</td>
                        <td className="px-6 py-4">
                          {getStatusBadge(earning.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-500">No earnings history yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Earnings;
