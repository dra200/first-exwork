import { useMutation } from "@tanstack/react-query";
import { evaluateProposalPrice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface ProposalEvaluationProps {
  projectId: number;
  projectBudget: number;
}

interface EvaluationResult {
  evaluation: 'fair' | 'high' | 'low';
  fairness_score: number;
  recommended_adjustment?: number;
  reasoning: string;
}

/**
 * Component for AI-powered proposal price evaluation
 */
export function ProposalEvaluation({ projectId, projectBudget }: ProposalEvaluationProps) {
  const [price, setPrice] = useState(projectBudget.toString());
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      return evaluateProposalPrice(projectId, parseFloat(price));
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleEvaluate = () => {
    if (price && !isNaN(parseFloat(price))) {
      mutate();
    }
  };

  const getEvaluationBadge = () => {
    if (!result) return null;
    
    switch (result.evaluation) {
      case 'fair':
        return <Badge className="bg-green-600 hover:bg-green-700">Fair Price</Badge>;
      case 'high':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Price Too High</Badge>;
      case 'low':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Price Too Low</Badge>;
      default:
        return null;
    }
  };

  const getEvaluationIcon = () => {
    if (!result) return null;
    
    switch (result.evaluation) {
      case 'fair':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <XCircle className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Price Evaluation</CardTitle>
        <CardDescription>
          Evaluate if your proposal price is fair for this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price">Proposal Price ($)</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter your proposed price"
          />
        </div>

        {result && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getEvaluationIcon()}
                <span className="font-medium">Evaluation Result:</span>
              </div>
              {getEvaluationBadge()}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fairness Score</p>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className={`h-2 rounded-full ${
                    result.evaluation === 'fair' 
                      ? 'bg-green-600' 
                      : result.evaluation === 'high' 
                        ? 'bg-yellow-600' 
                        : 'bg-blue-600'
                  }`}
                  style={{ width: `${result.fairness_score}%` }}
                />
              </div>
              <p className="text-xs text-right mt-1">{result.fairness_score}%</p>
            </div>

            {result.recommended_adjustment && (
              <div className="pt-2">
                <p className="text-sm font-medium">Recommended Price:</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(parseFloat(price) + result.recommended_adjustment)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.recommended_adjustment > 0 
                    ? `Increase by ${formatCurrency(result.recommended_adjustment)}` 
                    : `Decrease by ${formatCurrency(Math.abs(result.recommended_adjustment))}`}
                </p>
              </div>
            )}

            <div className="pt-2">
              <p className="text-sm font-medium">Analysis:</p>
              <p className="text-sm text-muted-foreground">{result.reasoning}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleEvaluate}
          disabled={isPending || !price || isNaN(parseFloat(price))}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            'Evaluate Price'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}