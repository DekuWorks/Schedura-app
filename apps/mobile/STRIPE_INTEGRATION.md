# Stripe Integration for Mobile App

This document outlines the Stripe integration implemented in the Schedura mobile app.

## Features Implemented

### 1. Subscription Management
- **Subscription Status Component**: Shows current plan, status, and billing information
- **Pricing Screen**: Displays available plans with Stripe checkout integration
- **Subscription Screen**: Manages billing portal access and support

### 2. Stripe Service
- **Checkout Sessions**: Creates Stripe checkout sessions for new subscriptions
- **Billing Portal**: Opens Stripe billing portal for subscription management
- **Payment Handling**: Manages successful payments and cancellations

### 3. UI Components
- **SubscriptionStatus**: Displays current subscription with upgrade/manage options
- **PricingCard**: Shows plan details with subscription buttons
- **Navigation**: Integrated into app navigation with proper routing

## Implementation Details

### Environment Variables
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_APP_URL=schedura://
```

### Key Files
- `src/hooks/useSubscription.ts` - Subscription state management
- `src/services/StripeService.ts` - Stripe API integration
- `src/components/SubscriptionStatus.tsx` - Subscription display component
- `src/components/PricingCard.tsx` - Pricing plan component
- `app/pricing.tsx` - Pricing screen
- `app/subscription.tsx` - Subscription management screen

### Stripe Integration Flow

1. **User selects a plan** → `PricingCard` component
2. **Checkout session created** → `StripeService.createCheckoutSession()`
3. **User redirected to Stripe** → Browser opens with Stripe checkout
4. **Payment completed** → User returns to app with success/cancel handling
5. **Subscription updated** → Backend webhook updates user subscription

### Billing Portal Flow

1. **User clicks "Manage Billing"** → `SubscriptionStatus` or `Subscription` screen
2. **Billing portal session created** → `StripeService.createBillingPortalSession()`
3. **User redirected to Stripe** → Browser opens with Stripe billing portal
4. **Changes made** → User returns to app with updated subscription

## Backend Integration

The mobile app integrates with the same Supabase functions as the web app:

- `create-checkout-session` - Creates Stripe checkout sessions
- `create-billing-portal` - Creates Stripe billing portal sessions
- `stripe-webhook` - Handles Stripe webhooks for subscription updates

## Testing

### Mock Implementation
Currently uses mock implementations for development. To test with real Stripe:

1. Set up environment variables
2. Replace mock API calls with real Supabase function calls
3. Test checkout flow with Stripe test cards
4. Test billing portal access

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0000 0000 3220`

## Security Considerations

- Never store Stripe keys in the mobile app
- Use Supabase functions for all Stripe API calls
- Validate webhook signatures on the backend
- Implement proper error handling and user feedback

## Future Enhancements

- In-app purchases for iOS/Android
- WebView integration for seamless checkout
- Push notifications for subscription updates
- Offline subscription status caching
