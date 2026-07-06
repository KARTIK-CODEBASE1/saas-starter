import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { handleSubscriptionChange } from '@/lib/payments/razorpay';

const webhookSecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('x-razorpay-signature') as string | null;

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret for Razorpay webhook.');
    return NextResponse.json({ error: 'Missing signature or webhook secret.' }, { status: 400 });
  }

  const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

  if (expected !== signature) {
    console.error('Razorpay webhook signature mismatch.');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  let body: any;
  try {
    body = JSON.parse(payload);
  } catch (err) {
    console.error('Failed to parse webhook payload', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    // Delegate handling to the payments helper
    await handleSubscriptionChange(body);
  } catch (err) {
    console.error('Error handling Razorpay webhook:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
