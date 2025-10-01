import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, Calendar, CreditCard } from "lucide-react";

interface Subscription {
  plan_name: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan_name, status, current_period_end, cancel_at_period_end")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      setSubscription(data || { plan_name: "free", status: "inactive", current_period_end: null, cancel_at_period_end: false });
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-billing-portal",
        {
          body: {
            returnUrl: window.location.origin,
          },
        }
      );

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  const isPaid = subscription?.plan_name !== "free" && subscription?.status === "active";

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Crown className={`h-6 w-6 ${isPaid ? "text-primary" : "text-muted-foreground"}`} />
          <div>
            <h3 className="text-lg font-semibold capitalize">
              {subscription?.plan_name || "Free"} Plan
            </h3>
            <Badge variant={subscription?.status === "active" ? "default" : "secondary"}>
              {subscription?.status || "inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {subscription?.current_period_end && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4" />
          <span>
            {subscription.cancel_at_period_end ? "Cancels" : "Renews"} on{" "}
            {new Date(subscription.current_period_end).toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {isPaid ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleManageBilling}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Billing
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => window.location.href = "/pricing"}
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        )}
      </div>
    </Card>
  );
}