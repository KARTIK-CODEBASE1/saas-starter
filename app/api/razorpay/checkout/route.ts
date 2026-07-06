import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payments/razorpay';
import { getTeamForUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const planId = body?.planId as string | undefined;
    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    const team = await getTeamForUser();

    const session = await createCheckoutSession({ team, planId });

    return NextResponse.json(session);
  } catch (err) {
    console.error('Failed to create Razorpay session', err);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
