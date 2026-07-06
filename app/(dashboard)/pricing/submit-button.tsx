'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function SubmitButton({ planId }: { planId?: string | null }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!planId) {
      // No plan selected
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/razorpay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok || !data?.subscriptionId || !data?.keyId) {
        console.error('Failed to create Razorpay session', data);
        setLoading(false);
        return;
      }

      // Load Razorpay script if not already present
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load Razorpay script'));
          document.head.appendChild(s);
        });
      }

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: data.name || 'Your Company',
        description: data.description || 'Subscription',
        handler: function (response: any) {
          // Payment completed — you may want to notify your server or refresh
          console.log('Razorpay payment success', response);
          window.location.href = '/dashboard';
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      variant="outline"
      className="w-full rounded-full"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Loading...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
