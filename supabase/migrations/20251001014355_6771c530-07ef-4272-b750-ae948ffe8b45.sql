-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan_name TEXT NOT NULL DEFAULT 'free',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create function to get user's subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription_plan()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT plan_name FROM public.subscriptions WHERE user_id = auth.uid() AND status = 'active'),
    'free'
  );
$$;