import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface CheckoutFormProps {
  amount: number;
  onSuccess?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Get payment intent client secret from URL query parameter
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    // Check payment intent status on load in case user comes back from a redirect
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;
      
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          onSuccess && onSuccess();
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Please provide your payment details to continue.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to redirect to the right place after payment success
        return_url: `${window.location.origin}/dashboard/payments?success=true`,
      },
    });

    // This will only be reached if there's an immediate error when
    // confirming the payment. Otherwise, the customer is redirected.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.");
      toast({
        title: "Payment failed",
        description: error.message || "Please check your card details and try again.",
        variant: "destructive",
      });
    } else {
      setMessage("An unexpected error occurred.");
      toast({
        title: "Payment failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md mb-4">
        <p className="text-sm font-medium text-center">
          You're about to make a payment of <span className="font-bold text-primary">${amount.toFixed(2)}</span>
        </p>
      </div>
      
      <PaymentElement id="payment-element" />
      
      {message && <div className="text-sm text-center text-neutral-600">{message}</div>}
      
      <Button
        className="w-full bg-primary hover:bg-primary-dark"
        disabled={isLoading || !stripe || !elements}
        type="submit"
      >
        {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
      
      <p className="text-xs text-center text-neutral-500 mt-4">
        Your payment is processed securely through Stripe. 
        TechConnect never stores your full card details.
      </p>
    </form>
  );
};

export default CheckoutForm;
