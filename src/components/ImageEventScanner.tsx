import { useState } from "react";
import { Camera, Upload, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ExtractedEvent {
  title: string;
  description?: string;
  date: string;
  time?: string;
  duration: number;
  location?: string;
  priority: "low" | "medium" | "high";
}

interface ImageEventScannerProps {
  onEventsExtracted: (events: any[]) => void;
  userPlan: string;
}

export function ImageEventScanner({ onEventsExtracted, userPlan }: ImageEventScannerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isPremium = userPlan === 'premium';

  const handleImageUpload = async (file: File) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "AI image scanning is only available for Premium subscribers.",
        action: (
          <Button size="sm" onClick={() => navigate('/pricing')}>
            Upgrade
          </Button>
        ),
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setExtractedEvents([]);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        setPreviewImage(base64Data);

        try {
          const { data, error } = await supabase.functions.invoke('analyze-image', {
            body: { imageData: base64Data }
          });

          if (error) throw error;

          const events = data?.events || [];
          
          if (events.length === 0) {
            toast({
              title: "No events found",
              description: "No calendar events were detected in this image",
            });
          } else {
            setExtractedEvents(events);
            toast({
              title: "Events extracted!",
              description: `Found ${events.length} event${events.length > 1 ? 's' : ''} in the image`,
            });
          }
        } catch (err: any) {
          console.error('Error analyzing image:', err);
          if (err.message?.includes('Premium subscription required')) {
            toast({
              title: "Premium Required",
              description: "This feature requires a Premium subscription",
              variant: "destructive",
            });
          } else if (err.message?.includes('Rate limit')) {
            toast({
              title: "Rate limit exceeded",
              description: "Please try again in a few moments",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Analysis failed",
              description: "Could not analyze the image. Please try again.",
              variant: "destructive",
            });
          }
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: "Failed to read the image file",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAddEvent = (event: ExtractedEvent) => {
    const newEvent = {
      id: Date.now().toString(),
      title: event.title,
      priority: event.priority,
      duration: event.duration || 60,
    };
    onEventsExtracted([newEvent]);
    toast({
      title: "Event added",
      description: `"${event.title}" has been added to your tasks`,
    });
  };

  const handleClear = () => {
    setPreviewImage(null);
    setExtractedEvents([]);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Image Scanner</h3>
          {isPremium && <Badge variant="secondary">Premium</Badge>}
        </div>
        {previewImage && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!isPremium && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Upgrade to Premium to scan images and automatically extract calendar events!
          </p>
          <Button size="sm" onClick={() => navigate('/pricing')}>
            Upgrade to Premium
          </Button>
        </div>
      )}

      {!previewImage ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload an image containing events, appointments, or notes to automatically extract calendar entries.
          </p>
          
          <label className={`block ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={!isPremium || isAnalyzing}
              className="hidden"
            />
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Click to upload image</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP up to 20MB
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img 
              src={previewImage} 
              alt="Uploaded" 
              className="w-full h-48 object-contain bg-muted"
            />
          </div>

          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Sparkles className="h-5 w-5 animate-pulse text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing image...</p>
            </div>
          )}

          {extractedEvents.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Extracted Events:</p>
              {extractedEvents.map((event, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {event.date} {event.time && `at ${event.time}`}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {event.duration} min
                        </Badge>
                        {event.location && (
                          <Badge variant="secondary" className="text-xs">
                            📍 {event.location}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddEvent(event)}
                      className="shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
