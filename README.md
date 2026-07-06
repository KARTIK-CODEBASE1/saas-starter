# Next.js SaaS Starter (Razorpay Edition)

This is a starter template for building a SaaS application using **Next.js** with support for authentication, Razorpay integration for payments, and a dashboard for logged-in users.

## Features

- Marketing landing page (`/`) with animated Terminal element
- Pricing page (`/pricing`) which connects to Razorpay Checkout
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Subscription management via Razorpay Subscriptions API
- Email/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system for any user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/))
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Razorpay](https://razorpay.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/saas-starter
cd saas-starter
npm install
```

## Running Locally

Create your `.env` file with the following variables:
POSTGRES_URL=your_neon_connection_string
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
RAZORPAY_PLAN_ID=your_razorpay_plan_id
BASE_URL=http://localhost:3000
AUTH_SECRET=your_generated_secret

Generate `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Push the database schema to your Neon database:

```bash
npx drizzle-kit push
```

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

You can create new users through the `/sign-up` route.

## Testing Payments

Razorpay test mode lets you simulate payments without real transactions. Use Razorpay's [test card/UPI details](https://razorpay.com/docs/payments/payments/test-card-upi-details/) to test the checkout flow in Test Mode from your Razorpay Dashboard.

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Set up a production Razorpay webhook

1. Go to the Razorpay Dashboard → Settings → Webhooks and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/razorpay/webhook`).
3. Select the events you want to listen for (e.g., `subscription.activated`, `subscription.charged`, `subscription.cancelled`).

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `RAZORPAY_KEY_ID`: Use your Razorpay live key ID for production.
3. `RAZORPAY_KEY_SECRET`: Use your Razorpay live key secret for production.
4. `RAZORPAY_PLAN_ID`: Your live Razorpay plan ID.
5. `POSTGRES_URL`: Set this to your production database URL.
6. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

## Credits

Originally based on the official [Next.js SaaS Starter](https://github.com/nextjs/saas-starter) by Vercel, adapted to use Razorpay instead of Stripe for India-based payment support.