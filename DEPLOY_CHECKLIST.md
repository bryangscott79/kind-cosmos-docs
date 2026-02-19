# VIGYL Deployment Checklist

## Supabase Migrations
Run in Supabase Dashboard → SQL Editor (or `supabase db push`):

```sql
-- 1. Stripe subscription columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end timestamptz;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
```

## Edge Function Deploys

### 1. Stripe Webhook
```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

Required secrets:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
# STRIPE_SECRET_KEY should already be set
# POSTHOG_API_KEY optional for server-side analytics
```

Stripe Dashboard setup:
- Go to Developers → Webhooks → Add endpoint
- URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Copy the signing secret → set as STRIPE_WEBHOOK_SECRET

### 2. Team Invite (if not deployed yet)
```bash
supabase functions deploy invite-team-member
```

Required secrets:
```bash
supabase secrets set RESEND_API_KEY=re_...
```

### 3. Expand Prospects (if not deployed yet)
```bash
supabase functions deploy expand-prospects
```

## Verification
After deploying, test:
1. **Stripe**: Create a test subscription → check profiles table for tier update
2. **Team invite**: Send invite from Settings → Team → verify email arrives
3. **Expand prospects**: Click "Load More" on Prospects page → verify new prospects appear
