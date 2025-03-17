import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/layout/AuthLayout';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Toggle between login and register
  const handleToggleForm = () => {
    navigate('/register');
  };

  // React Hook Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => {
      return apiRequest('POST', '/api/auth/login', data);
    },
    onSuccess: async (data) => {
      const userData = await data.json();
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}`,
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout title="Welcome Back" type="login" onToggle={handleToggleForm}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                <a href="#" className="text-sm text-primary hover:underline block mt-1">
                  Forgot password?
                </a>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark text-white"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default Login;
