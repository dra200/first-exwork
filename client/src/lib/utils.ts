import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names or class values into a single string.
 * Uses clsx for class names merging and twMerge for Tailwind CSS optimization.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats currency values for display
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
}

/**
 * Formats a date string into a more readable format
 */
export function formatDate(dateString: string, includeTime = false): string {
  try {
    const date = new Date(dateString);
    if (includeTime) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString; // Return original string if formatting fails
  }
}

/**
 * Returns a status badge color class based on status
 */
export function getStatusColor(status: string): { bgColor: string, textColor: string } {
  const statusMap: Record<string, { bgColor: string, textColor: string }> = {
    open: { bgColor: "bg-blue-100", textColor: "text-blue-700" },
    pending: { bgColor: "bg-blue-100", textColor: "text-blue-700" },
    in_progress: { bgColor: "bg-green-100", textColor: "text-green-700" },
    reviewing: { bgColor: "bg-yellow-100", textColor: "text-yellow-700" },
    completed: { bgColor: "bg-green-100", textColor: "text-green-700" },
    cancelled: { bgColor: "bg-red-100", textColor: "text-red-700" },
    accepted: { bgColor: "bg-green-100", textColor: "text-green-700" },
    rejected: { bgColor: "bg-red-100", textColor: "text-red-700" },
  };
  
  return statusMap[status] || { bgColor: "bg-gray-100", textColor: "text-gray-700" };
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Creates initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Calculates the time elapsed since a given date
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return 'Just now';
}
