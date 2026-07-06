import { NextRequest, NextResponse } from 'next/server';

// For Razorpay flow we rely on webhooks to update subscription state.
// Keep this route simple: redirect to the dashboard after a checkout flow.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
