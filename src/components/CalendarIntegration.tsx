import { useState } from "react";
import { Calendar, ExternalLink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const CalendarIntegration = () => {
  const [googleClientId, setGoogleClientId] = useState("");
  const [appleClientId, setAppleClientId] = useState("");

  const handleGoogleConnect = () => {
    if (!googleClientId) {
      toast.error("Please enter your Google Client ID first");
      return;
    }
    toast.info("Google Calendar integration coming soon!");
  };

  const handleAppleConnect = () => {
    if (!appleClientId) {
      toast.error("Please enter your Apple Client ID first");
      return;
    }
    toast.info("Apple Calendar integration coming soon!");
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-lg">Calendar Integration</h3>
      </div>

      <Tabs defaultValue="google" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="apple">Apple</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-client-id">Google OAuth Client ID</Label>
            <Input
              id="google-client-id"
              placeholder="Your Google Client ID"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your Client ID from{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline inline-flex items-center gap-1"
              >
                Google Cloud Console
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
          <Button onClick={handleGoogleConnect} className="w-full" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure Google Calendar
          </Button>
        </TabsContent>

        <TabsContent value="apple" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apple-client-id">Apple OAuth Client ID</Label>
            <Input
              id="apple-client-id"
              placeholder="Your Apple Client ID"
              value={appleClientId}
              onChange={(e) => setAppleClientId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your Client ID from{" "}
              <a
                href="https://developer.apple.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline inline-flex items-center gap-1"
              >
                Apple Developer Portal
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
          <Button onClick={handleAppleConnect} className="w-full" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure Apple Calendar
          </Button>
        </TabsContent>
      </Tabs>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Calendar sync requires OAuth credentials. You'll need to create
          OAuth apps in Google Cloud Console or Apple Developer Portal. Full integration coming soon!
        </p>
      </div>
    </Card>
  );
};
