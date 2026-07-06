import Razorpay from 'razorpay';
import { Team } from '@/lib/db/schema';
import {
  getUser,
  updateTeamSubscription
} from '@/lib/db/queries';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

// Creates a Razorpay subscription and returns info needed for frontend checkout popup
export async function createCheckoutSession({
  team,
  planId
}: {
  team: Team | null;
  planId: string; // Razorpay Plan ID, created in Razorpay dashboard beforehand
}) {
  const user = await getUser();

  if (!team || !user) {
    throw new Error('User or team not found — redirect to sign-up on the frontend before calling this');
  }

  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: 12, // e.g. 12 billing cycles; adjust as needed
    notes: {
      userId: user.id.toString(),
      teamId: team.id.toString()
    }
  });

  // Return subscription id + key for frontend Razorpay Checkout popup
  return {
    subscriptionId: subscription.id,
    keyId: process.env.RAZORPAY_KEY_ID
  };
}

export async function handleSubscriptionChange(payload: any) {
  const subscriptionEntity = payload.subscription.entity;
  const subscriptionId = subscriptionEntity.id;
  const status = subscriptionEntity.status; // e.g. 'active', 'cancelled', 'completed'
  const notes = subscriptionEntity.notes;
  const teamId = notes?.teamId;

  if (!teamId) {
    console.error('No teamId found in subscription notes');
    return;
  }

  if (status === 'active' || status === 'authenticated') {
    await updateTeamSubscription(Number(teamId), {
      razorpaySubscriptionId: subscriptionId,
      planName: subscriptionEntity.plan_id,
      subscriptionStatus: status
    });
  } else if (status === 'cancelled' || status === 'completed' || status === 'expired') {
    await updateTeamSubscription(Number(teamId), {
      razorpaySubscriptionId: null,
      planName: null,
      subscriptionStatus: status
    });
  }
}

// Return plan/product data used by the frontend pricing page.
export async function getPlanData() {
  // Read plan IDs and amounts from env; fall back to sensible defaults
  const basePlanId = process.env.RAZORPAY_PLAN_BASE_ID || null;
  const plusPlanId = process.env.RAZORPAY_PLAN_PLUS_ID || null;

  const baseAmount = Number(process.env.RAZORPAY_PLAN_BASE_AMOUNT || 800);
  const plusAmount = Number(process.env.RAZORPAY_PLAN_PLUS_AMOUNT || 1200);

  const products = [
    { id: basePlanId || 'base', name: 'Base' },
    { id: plusPlanId || 'plus', name: 'Plus' },
  ];

  const prices = [
    {
      id: basePlanId || 'base-price',
      productId: basePlanId || 'base',
      unitAmount: baseAmount,
      interval: 'month',
      trialPeriodDays: 7,
    },
    {
      id: plusPlanId || 'plus-price',
      productId: plusPlanId || 'plus',
      unitAmount: plusAmount,
      interval: 'month',
      trialPeriodDays: 7,
    },
  ];

  return { prices, products };
}