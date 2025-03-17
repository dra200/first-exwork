import React from 'react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  skills?: string[];
  proposalCount?: number;
  buyerName?: string;
  createdAt: string;
  onClick?: () => void;
  buttonText?: string;
  isDetailed?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  budget,
  deadline,
  status,
  skills = [],
  proposalCount,
  buyerName,
  createdAt,
  onClick,
  buttonText = "View Details",
  isDetailed = false,
}) => {
  // Format status for display
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      open: { color: "bg-blue-100 text-blue-700", label: "Open" },
      pending: { color: "bg-blue-100 text-blue-700", label: "Pending" },
      in_progress: { color: "bg-green-100 text-green-700", label: "In Progress" },
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

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Truncate description if it's too long
  const truncatedDescription = isDetailed 
    ? description 
    : description.length > 150 
      ? `${description.substring(0, 150)}...` 
      : description;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 border-b">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">{title}</h2>
          <span className="text-sm font-medium text-primary">${budget}</span>
        </div>
        
        <div className="flex items-center text-sm text-neutral-500 mb-4">
          <span className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Posted {formatDate(createdAt)}
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Deadline: {formatDate(deadline)}
          </span>
        </div>
        
        <p className="text-sm mb-4">{truncatedDescription}</p>
        
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-neutral-100 rounded">{skill}</span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {buyerName && (
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center font-medium text-xs mr-2">
                {buyerName.charAt(0)}
              </div>
              <span className="text-sm">{buyerName}</span>
            </div>
          )}
          
          <div className="flex items-center">
            {getStatusBadge(status)}
            {proposalCount !== undefined && (
              <span className="text-sm text-neutral-500 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
                {proposalCount} proposal{proposalCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-3 bg-neutral-50 flex justify-end">
        {onClick ? (
          <Button
            onClick={onClick}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {buttonText}
          </Button>
        ) : (
          <Link href={`/dashboard/projects/${id}`}>
            <Button className="bg-primary hover:bg-primary-dark text-white">
              {buttonText}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
