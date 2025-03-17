import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  type: 'login' | 'register';
  onToggle: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  type, 
  onToggle 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
      <Card className="w-full max-w-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 font-medium ${type === 'login' ? 'bg-white border-t-2 border-primary' : 'bg-neutral-100'}`}
            onClick={type === 'register' ? onToggle : undefined}
          >
            Log In
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${type === 'register' ? 'bg-white border-t-2 border-primary' : 'bg-neutral-100'}`}
            onClick={type === 'login' ? onToggle : undefined}
          >
            Register
          </button>
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
          {children}
        </div>
      </Card>
    </div>
  );
}

export default AuthLayout;
