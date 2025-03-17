import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectMessages, sendMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, PaperclipIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageChatProps {
  projectId: number;
  receiverId: number;
  receiverName: string;
  projectTitle: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  projectId: number;
  read: boolean;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
  };
}

const MessageChat: React.FC<MessageChatProps> = ({ 
  projectId, 
  receiverId,
  receiverName,
  projectTitle
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [`/api/projects/${projectId}/messages`],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      sendMessage(projectId, content, receiverId),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/messages`] });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach(message => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="flex flex-col h-[600px]">
      {/* Conversation Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-medium mr-3">
            {receiverName.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{receiverName}</div>
            <div className="text-xs text-neutral-500">{projectTitle}</div>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : Object.keys(groupedMessages).length > 0 ? (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="text-center text-xs text-neutral-500 my-4">
                {formatDate(new Date(date).toISOString())}
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex mb-4 ${message.senderId === user?.id ? 'justify-end' : ''}`}
                >
                  {message.senderId !== user?.id && (
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-medium mr-2 flex-shrink-0">
                      {message.sender?.name.charAt(0) || receiverName.charAt(0)}
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] ${message.senderId === user?.id ? 'text-right' : ''}`}>
                    <div className={`rounded-lg p-3 ${
                      message.senderId === user?.id 
                        ? 'bg-primary text-white' 
                        : 'bg-neutral-100'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 text-right">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-neutral-500">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation by sending a message.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-neutral-500 hover:text-neutral-700"
          >
            <PaperclipIcon size={20} />
          </Button>
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            className="flex-1 border-none focus:outline-none focus:ring-0" 
            placeholder="Type a message..." 
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="text-primary hover:text-primary-dark"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            <ArrowRight size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageChat;
