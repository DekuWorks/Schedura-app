import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const GoogleOAuthHandler = () => {
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check for OAuth callback
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in');

      if (accessToken) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Store the Google Calendar tokens
          const expiryDate = new Date();
          expiryDate.setSeconds(expiryDate.getSeconds() + parseInt(expiresIn || '3600'));

          const { error } = await supabase
            .from('calendar_connections')
            .upsert({
              user_id: user.id,
              provider: 'google',
              access_token: accessToken,
              refresh_token: refreshToken,
              token_expiry: expiryDate.toISOString(),
              is_active: true,
            }, {
              onConflict: 'user_id,provider'
            });

          if (error) throw error;

          toast.success('Successfully connected to Google Calendar!');
          
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error storing OAuth tokens:', error);
          toast.error('Failed to save Google Calendar connection');
        }
      }
    };

    handleOAuthCallback();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.provider_token) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Calculate token expiry (typically 1 hour for Google)
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 1);

          const { error } = await supabase
            .from('calendar_connections')
            .upsert({
              user_id: user.id,
              provider: 'google',
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token,
              token_expiry: expiryDate.toISOString(),
              is_active: true,
            }, {
              onConflict: 'user_id,provider'
            });

          if (error) throw error;

          toast.success('Successfully connected to Google Calendar!');
        } catch (error) {
          console.error('Error storing OAuth tokens:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
};
