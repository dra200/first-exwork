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

// Register form schema
const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'seller'], { message: "Please select a role" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Toggle between login and register
  const handleToggleForm = () => {
    navigate('/login');
  };

  // React Hook Form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'buyer',
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormValues) => {
      return apiRequest('POST', '/api/auth/register', data);
    },
    onSuccess: async (data) => {
      const userData = await data.json();
      toast({
        title: "Registration successful",
        description: `Welcome to TechConnect, ${userData.name}`,
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <AuthLayout title="Create Account" type="register" onToggle={handleToggleForm}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">I am a:</p>
            <div className="flex space-x-4">
              <button
                type="button"
                className={`flex-1 py-2 border border-primary rounded-md font-medium transition duration-200 ${
                  form.watch('role') === 'buyer' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-blue-50'
                }`}
                onClick={() => form.setValue('role', 'buyer')}
              >
                Buyer
              </button>
              <button
                type="button"
                className={`flex-1 py-2 border border-primary rounded-md font-medium transition duration-200 ${
                  form.watch('role') === 'seller' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-blue-50'
                }`}
                onClick={() => form.setValue('role', 'seller')}
              >
                Seller
              </button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Acme Corporation" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark text-white"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating Account..." : "Register"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default Register;
