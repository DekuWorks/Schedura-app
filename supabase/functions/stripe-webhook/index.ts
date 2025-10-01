import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(
      JSON.stringify({ error: 'Webhook signature verification failed' }),
      { status: 400, headers: corsHeaders }
    );
  }

  console.log('Processing webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const planName = getPlanName(subscription.items.data[0].price.id);

          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: session.customer as string,
              stripe_price_id: subscription.items.data[0].price.id,
              status: subscription.status,
              plan_name: planName,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });

          console.log('Subscription created for user:', userId);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (existingSub) {
          const planName = subscription.status === 'active' 
            ? getPlanName(subscription.items.data[0].price.id)
            : 'free';

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: subscription.status,
              plan_name: planName,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_subscription_id', subscription.id);

          console.log('Subscription updated:', subscription.id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getPlanName(priceId: string): string {
  // Map price IDs to plan names
  // You'll need to update these with your actual Stripe price IDs
  const priceMap: Record<string, string> = {
    // Add your Stripe price IDs here
    'price_pro_monthly': 'pro',
    'price_pro_yearly': 'pro',
    'price_premium_monthly': 'premium',
    'price_premium_yearly': 'premium',
  };

  return priceMap[priceId] || 'free';
}