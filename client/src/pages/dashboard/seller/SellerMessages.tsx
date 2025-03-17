import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getSellerProposals } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MessageChat from '@/components/dashboard/MessageChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, timeAgo } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface Proposal {
  id: number;
  projectId: number;
  project: {
    id: number;
    title: string;
    buyerId: number;
  };
}

interface Contact {
  id: number;
  name: string;
  projectId: number;
  projectTitle: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: boolean;
}

const SellerMessages = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Parse query params for project and buyer IDs
  const params = new URLSearchParams(location.split('?')[1]);
  const projectId = params.get('projectId');
  const buyerId = params.get('buyerId');

  // Fetch seller's proposals to get projects and clients
  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ['/api/seller/proposals'],
  });

  // Mock contacts data (in a real app, this would come from an API)
  const mockContacts: Contact[] = [
    {
      id: 1,
      name: "Acme Corporation",
      projectId: 1,
      projectTitle: "E-commerce Website Redesign",
      lastMessage: "I've just reviewed your updated designs, they look fantastic!",
      lastMessageTime: new Date().toISOString(),
      unread: true
    },
    {
      id: 2,
      name: "Global Consulting",
      projectId: 2,
      projectTitle: "CRM Integration",
      lastMessage: "Can you provide an update on the database integration progress?",
      lastMessageTime: new Date(Date.now() - 86400000).toISOString(), // yesterday
      unread: false
    }
  ];

  // Set initial selected contact based on URL params
  useEffect(() => {
    if (projectId && buyerId) {
      const contact = mockContacts.find(
        c => c.projectId === parseInt(projectId) && c.id === parseInt(buyerId)
      );
      if (contact) {
        setSelectedContact(contact);
      }
    } else if (mockContacts.length > 0) {
      setSelectedContact(mockContacts[0]);
    }
  }, [projectId, buyerId]);

  // Filter contacts by search term
  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-80 border-r">
              <div className="p-3 border-b">
                <Input 
                  type="text" 
                  placeholder="Search conversations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="overflow-y-auto h-[555px]">
                {filteredContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className={`p-3 hover:bg-neutral-100 cursor-pointer ${
                      selectedContact?.id === contact.id 
                        ? 'border-l-4 border-primary bg-blue-50' 
                        : ''
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-medium mr-3">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div className="font-medium truncate">{contact.name}</div>
                          <div className="text-xs text-neutral-500">
                            {contact.lastMessageTime && timeAgo(contact.lastMessageTime)}
                          </div>
                        </div>
                        <div className="text-sm text-neutral-500">{contact.projectTitle}</div>
                        <div className="text-sm truncate">
                          {contact.lastMessage || "No messages yet"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredContacts.length === 0 && (
                  <div className="p-4 text-center text-neutral-500">
                    No conversations found
                  </div>
                )}
              </div>
            </div>
            
            {/* Conversation Content */}
            {selectedContact ? (
              <div className="flex-1">
                <MessageChat 
                  projectId={selectedContact.projectId}
                  receiverId={selectedContact.id}
                  receiverName={selectedContact.name}
                  projectTitle={selectedContact.projectTitle}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <p className="text-neutral-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerMessages;
