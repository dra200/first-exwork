import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getPricePrediction } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Brain } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PredictionResult {
  min_price: number;
  max_price: number;
  recommended_price: number;
  confidence: number;
}

/**
 * Component for AI-powered price prediction
 */
export function PricePrediction() {
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [deadline, setDeadline] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      return getPricePrediction({
        description,
        skills: skills.split(',').map(s => s.trim()),
        deadline_days: parseInt(deadline) || 30
      });
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handlePredict = () => {
    if (description) {
      mutate();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <span>AI Price Prediction</span>
        </CardTitle>
        <CardDescription>
          Get an estimated price range for your project based on AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills (comma separated)</Label>
            <Input
              id="skills"
              placeholder="e.g. React, Node.js, TypeScript"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (days)</Label>
            <Input
              id="deadline"
              type="number"
              placeholder="30"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
            <h4 className="font-medium text-lg mb-2">Prediction Results</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price Range</p>
                <p className="font-medium">
                  {formatCurrency(result.min_price)} - {formatCurrency(result.max_price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommended Price</p>
                <p className="font-medium text-primary">
                  {formatCurrency(result.recommended_price)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <div className="w-full bg-secondary h-2 rounded-full mt-1">
                  <div 
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1">{result.confidence}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handlePredict}
          disabled={isPending || !description}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Predict Price'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}