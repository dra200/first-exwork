import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getProjectRecommendations } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProjectCard } from "./ProjectCard";
import { Loader2 } from "lucide-react";

interface RecommendedProject {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  score: number;
  buyerId: number;
  createdAt: string;
}

/**
 * Component to display ML-powered project recommendations for sellers
 */
export function ProjectRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/ml/recommendations/projects', user?.id], 
    queryFn: () => {
      if (!user?.id) return Promise.resolve({ recommendations: [] });
      return getProjectRecommendations(user.id);
    },
    enabled: !!user?.id && user?.role === 'seller',
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
        <CardTitle>Recommended Projects</CardTitle>
        <CardDescription>
          AI-powered project recommendations based on your profile and past proposals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data?.recommendations?.length ? (
          <div className="space-y-4">
            {data.recommendations.slice(0, 3).map((project: RecommendedProject) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                budget={project.budget}
                deadline={project.deadline}
                status={project.status}
                createdAt={project.createdAt}
                isDetailed={false}
                buttonText="View Project"
              />
            ))}
            {data.recommendations.length > 3 && (
              <Button variant="outline" className="w-full mt-4">
                View All Recommendations
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No project recommendations available yet.
            <br />
            Submit proposals to improve your recommendations.
          </div>
        )}
      </CardContent>
    </Card>
  );
}