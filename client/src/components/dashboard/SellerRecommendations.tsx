import { useQuery } from "@tanstack/react-query";
import { getSellerRecommendations } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { Loader2, Star } from "lucide-react";

interface SellerRecommendationsProps {
  projectId: number;
}

interface RecommendedSeller {
  id: number;
  name: string;
  score: number;
  match_reason: string;
  skills: string[];
  completion_rate?: number;
  avg_rating?: number;
}

/**
 * Component to display ML-powered seller recommendations for a project
 */
export function SellerRecommendations({ projectId }: SellerRecommendationsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/ml/recommendations/sellers', projectId],
    queryFn: () => getSellerRecommendations(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  if (error) {
    // Silent fail on recommendation errors to not disrupt the UX
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Sellers</CardTitle>
        <CardDescription>
          AI-powered service provider recommendations for your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data?.recommendations?.length ? (
          <div className="space-y-4">
            {data.recommendations.slice(0, 3).map((seller: RecommendedSeller) => (
              <div key={seller.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(seller.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{seller.name}</h4>
                    <Badge className="bg-primary hover:bg-primary/90">
                      {Math.round(seller.score * 100)}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{seller.match_reason}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {seller.skills.slice(0, 4).map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {seller.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{seller.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                  {seller.avg_rating && (
                    <div className="flex items-center text-sm text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current mr-1" />
                      <span>{seller.avg_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {data.recommendations.length > 3 && (
              <Button variant="outline" className="w-full mt-4">
                View All Recommendations
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No seller recommendations available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}