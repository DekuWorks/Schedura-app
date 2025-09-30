import { useState, useEffect } from "react";
import { Calendar, ExternalLink, Settings, Check, Loader2, RefreshCw, Upload as UploadIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "./CalendarView";

interface CalendarIntegrationProps {
  scheduledEvents: CalendarEvent[];
}

export const CalendarIntegration = ({ scheduledEvents }: CalendarIntegrationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      setIsConnected(!!data);
      setLastSync(data?.last_sync || null);
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar',
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      toast.success('Redirecting to Google for authorization...');
    } catch (error) {
      console.error('Error connecting to Google:', error);
      toast.error('Failed to connect to Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('calendar_connections')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('provider', 'google');

      if (error) throw error;

      setIsConnected(false);
      toast.success('Disconnected from Google Calendar');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromGoogle = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'fetch' }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
        setLastSync(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error syncing from Google:', error);
      toast.error('Failed to sync from Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToGoogle = async () => {
    try {
      if (scheduledEvents.length === 0) {
        toast.error('No events to export. Schedule some tasks first!');
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { 
          action: 'export',
          events: scheduledEvents
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
      }
    } catch (error) {
      console.error('Error exporting to Google:', error);
      toast.error('Failed to export to Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-lg">Calendar Sync</h3>
      </div>

      <Tabs defaultValue="google" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="apple">Apple</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Google Calendar to sync events and export your scheduled tasks.
              </p>
              <Button 
                onClick={handleGoogleConnect} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Connect Google Calendar
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                You'll be redirected to Google to authorize access to your calendar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-success">
                <Check className="h-4 w-4" />
                <span>Connected to Google Calendar</span>
              </div>

              {lastSync && (
                <p className="text-xs text-muted-foreground">
                  Last synced: {new Date(lastSync).toLocaleString()}
                </p>
              )}

              <div className="grid gap-2">
                <Button 
                  onClick={handleSyncFromGoogle} 
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Import from Google Calendar
                </Button>

                <Button 
                  onClick={handleExportToGoogle} 
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UploadIcon className="mr-2 h-4 w-4" />
                  )}
                  Export to Google Calendar
                </Button>

                <Button 
                  onClick={handleDisconnect} 
                  variant="ghost" 
                  className="w-full text-destructive hover:text-destructive"
                  disabled={isLoading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="apple" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apple Calendar doesn't have a public API. Export your schedule as .ics file and import it to iCloud Calendar.
          </p>
          <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <strong>How to import to iCloud Calendar:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click "Export .ics" button in the main view</li>
              <li>Open iCloud Calendar on web or Mac</li>
              <li>Click File → Import</li>
              <li>Select the downloaded .ics file</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
