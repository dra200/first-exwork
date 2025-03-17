import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProposalCardProps {
  id: number;
  serviceDetails: string;
  price: number;
  deliveryTime: number;
  status: string;
  seller?: {
    id: number;
    name: string;
    rating?: number;
    reviewCount?: number;
  };
  skills?: string[];
  onAccept?: () => void;
  onMessage?: () => void;
  showActions?: boolean;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  id,
  serviceDetails,
  price,
  deliveryTime,
  status,
  seller,
  skills = [],
  onAccept,
  onMessage,
  showActions = true,
}) => {
  // Format status for display
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-blue-100 text-blue-700", label: "Pending" },
      accepted: { color: "bg-green-100 text-green-700", label: "Accepted" },
      rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
      completed: { color: "bg-green-100 text-green-700", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
    };
    
    const { color, label } = statusMap[status] || { color: "bg-gray-100 text-gray-700", label: status };
    
    return (
      <Badge variant="outline" className={`${color} border-0`}>
        {label}
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            {seller && (
              <>
                <div className="h-10 w-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-medium mr-3">
                  {seller.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{seller.name}</div>
                  {seller.rating && (
                    <div className="text-sm text-neutral-500">
                      ⭐ {seller.rating} ({seller.reviewCount} reviews)
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold">${price}</div>
            <div className="text-sm text-neutral-500">{deliveryTime} days delivery</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm">
          {serviceDetails}
        </div>
        
        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-neutral-100 rounded">{skill}</span>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex items-center">
          <span className="mr-2">Status:</span> 
          {getStatusBadge(status)}
        </div>
        
        {showActions && (
          <div className="mt-4 flex justify-end space-x-3">
            {onMessage && (
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-blue-50"
                onClick={onMessage}
              >
                Message
              </Button>
            )}
            
            {onAccept && status === 'pending' && (
              <Button 
                className="bg-primary text-white hover:bg-primary-dark"
                onClick={onAccept}
              >
                Accept Proposal
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
