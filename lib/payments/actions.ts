'use server';

import { createCheckoutSession } from './razorpay';
import { withTeam } from '@/lib/auth/middleware';
import { redirect } from 'next/navigation';

export const checkoutAction = withTeam(async (formData, team) => {
  const planId = (formData.get('planId') as string) || process.env.RAZORPAY_PLAN_ID!;
  const session = await createCheckoutSession({ team, planId });
  return session; // { subscriptionId, keyId } — frontend uses this to open Razorpay popup
});

export const customerPortalAction = withTeam(async (_formData, team) => {
  // Razorpay doesn't provide a hosted customer portal like Stripe's Billing Portal.
  // Redirect users to an internal billing/manage page. If no subscription found,
  // redirect to pricing so they can subscribe.
  if (!team?.razorpaySubscriptionId) {
    redirect('/pricing');
  }

  redirect('/dashboard/billing');
});