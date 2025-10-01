import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 10 tasks per month",
      "Basic task scheduling",
      "Calendar view",
      "Manual task input",
    ],
    priceId: null,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "For productive individuals",
    features: [
      "Unlimited tasks",
      "AI-powered suggestions",
      "File upload & parsing",
      "Google Calendar sync",
      "Priority support",
    ],
    priceId: "price_1SDPSRJd5wbPvQ1IjHVI6PO0",
    popular: true,
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "per month",
    description: "For teams and power users",
    features: [
      "Everything in Pro",
      "Team workspaces",
      "Advanced analytics",
      "Custom integrations",
      "White-label option",
      "24/7 dedicated support",
    ],
    priceId: "price_1SDPX7Jd5wbPvQ1I7kGQYsxS",
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!priceId) {
      toast({
        title: "Already on Free plan",
        description: "You're currently using the free plan",
      });
      return;
    }

    setLoading(planName);

    try {
      console.log("Starting checkout for priceId:", priceId);
      
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            priceId,
            successUrl: `${window.location.origin}/?success=true`,
            cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          },
        }
      );

      console.log("Checkout response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (data?.url) {
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        console.error("No URL in response:", data);
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Select the perfect plan for your productivity needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
                plan.popular ? "border-primary border-2 shadow-lg" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading === plan.name}
              >
                {loading === plan.name
                  ? "Loading..."
                  : plan.priceId
                  ? "Subscribe Now"
                  : "Current Plan"}
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>All plans include a 14-day money-back guarantee</p>
          <p className="mt-2">
            Need a custom plan?{" "}
            <a href="mailto:support@schedura.com" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}