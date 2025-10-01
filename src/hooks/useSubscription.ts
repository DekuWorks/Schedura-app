import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSubscription() {
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan_name, status")
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        setPlan("free");
      } else {
        setPlan(data?.plan_name === "premium" && data?.status === "active" ? "premium" : 
               data?.plan_name === "pro" && data?.status === "active" ? "pro" : 
               "free");
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setPlan("free");
    } finally {
      setLoading(false);
    }
  };

  return { plan, loading, refetch: fetchSubscription };
}
