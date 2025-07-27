-- Add user subscriptions table for premium features
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (true); -- Allow system updates via webhook

CREATE POLICY "Users can delete their own subscription" ON public.user_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_tier ON public.user_subscriptions(tier);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add billing history table for invoice tracking
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT NOT NULL,
    amount_paid INTEGER NOT NULL, -- Amount in cents (AUD)
    currency TEXT NOT NULL DEFAULT 'aud',
    status TEXT NOT NULL CHECK (status IN ('paid', 'open', 'void', 'uncollectible')),
    invoice_pdf TEXT, -- URL to invoice PDF
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for billing history
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing history
CREATE POLICY "Users can view their own billing history" ON public.billing_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert billing history" ON public.billing_history
    FOR INSERT WITH CHECK (true); -- Allow system inserts via webhook

-- Add indexes for billing history
CREATE INDEX idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX idx_billing_history_stripe_invoice_id ON public.billing_history(stripe_invoice_id);
CREATE INDEX idx_billing_history_created_at ON public.billing_history(created_at DESC);

-- Feature usage tracking table
CREATE TABLE IF NOT EXISTS public.feature_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, feature_name)
);

-- Enable RLS for feature usage
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature usage
CREATE POLICY "Users can view their own feature usage" ON public.feature_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feature usage" ON public.feature_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature usage" ON public.feature_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Add indexes for feature usage
CREATE INDEX idx_feature_usage_user_id ON public.feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature_name ON public.feature_usage(feature_name);
CREATE INDEX idx_feature_usage_last_used_at ON public.feature_usage(last_used_at DESC);

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
    user_id_param UUID,
    feature_name_param TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.feature_usage (user_id, feature_name, usage_count, last_used_at)
    VALUES (user_id_param, feature_name_param, 1, timezone('utc'::text, now()))
    ON CONFLICT (user_id, feature_name)
    DO UPDATE SET
        usage_count = feature_usage.usage_count + 1,
        last_used_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add child count constraints for free users
-- This will be enforced at the application level, but we can add a trigger for safety
CREATE OR REPLACE FUNCTION check_child_limit()
RETURNS TRIGGER AS $$
DECLARE
    child_count INTEGER;
    user_tier TEXT;
BEGIN
    -- Get user's subscription tier
    SELECT tier INTO user_tier
    FROM public.user_subscriptions
    WHERE user_id = NEW.user_id;
    
    -- If no subscription found, assume free tier
    IF user_tier IS NULL THEN
        user_tier := 'free';
    END IF;
    
    -- Count existing children
    SELECT COUNT(*) INTO child_count
    FROM public.children
    WHERE user_id = NEW.user_id;
    
    -- Check limits for free tier
    IF user_tier = 'free' AND child_count >= 2 THEN
        RAISE EXCEPTION 'Free plan allows maximum 2 children. Upgrade to Premium for unlimited children.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to check child limits on insert
CREATE TRIGGER check_child_limit_trigger
    BEFORE INSERT ON public.children
    FOR EACH ROW
    EXECUTE FUNCTION check_child_limit();