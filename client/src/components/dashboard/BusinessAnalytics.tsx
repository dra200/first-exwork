import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getBuyerAnalytics, getSellerAnalytics, getMarketAnalytics } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Loader2, TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

/**
 * Business Analytics component powered by ML
 */
export function BusinessAnalytics() {
  const { user } = useAuth();
  
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/ml/analytics/market'],
    queryFn: getMarketAnalytics,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/ml/analytics/user', user?.id, user?.role],
    queryFn: () => {
      if (!user?.id) return Promise.resolve({});
      return user.role === 'buyer' 
        ? getBuyerAnalytics(user.id) 
        : getSellerAnalytics(user.id);
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  const isLoading = marketLoading || userLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Analytics</CardTitle>
        <CardDescription>
          AI-powered insights to help you make better business decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="market">
          <TabsList className="mb-4">
            <TabsTrigger value="market" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Market Trends</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1">
              <PieChartIcon className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
            {user && (
              <TabsTrigger value="performance" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Performance</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="market" className="min-h-[300px]">
            {marketData?.market_trends && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marketData.market_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="project_count" stroke="#8884d8" name="Projects" />
                  <Line type="monotone" dataKey="avg_budget" stroke="#82ca9d" name="Avg Budget ($)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="categories" className="min-h-[300px]">
            {marketData?.category_distribution && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={marketData.category_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry: any) => entry.name}
                  >
                    {marketData.category_distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="performance" className="min-h-[300px]">
            {userData?.performance_metrics && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userData.performance_metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name={user?.role === 'buyer' ? 'Projects' : 'Earnings'} 
                    fill="#8884d8" 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}