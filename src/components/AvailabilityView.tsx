import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useTimezone } from "@/hooks/useTimezone";

interface AvailableSlot {
  start: string;
  end: string;
  durationMinutes: number;
}

interface Suggestion {
  start: string;
  end: string;
  reason: string;
  score: number;
}

interface AvailabilityData {
  busyBlocks: Array<{
    type: string;
    title: string;
    start: string;
    end: string;
  }>;
  availableSlots: AvailableSlot[];
  suggestions: Suggestion[];
  timezone: string;
}

export function AvailabilityView() {
  const { toast } = useToast();
  const timezone = useTimezone();
  const [duration, setDuration] = useState("30");
  const [daysAhead, setDaysAhead] = useState("7");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);

  const analyzeAvailability = async () => {
    setIsAnalyzing(true);
    try {
      const startDate = new Date().toISOString();
      const endDate = addDays(new Date(), parseInt(daysAhead)).toISOString();

      const { data, error } = await supabase.functions.invoke('analyze-availability', {
        body: {
          startDate,
          endDate,
          duration: parseInt(duration),
          timezone: timezone || 'UTC'
        }
      });

      if (error) throw error;

      setAvailabilityData(data);
      toast({
        title: "Analysis complete",
        description: `Found ${data.availableSlots.length} available time slots`,
      });
    } catch (error: any) {
      console.error('Error analyzing availability:', error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message || "Failed to analyze availability",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (isoString: string) => {
    return formatInTimeZone(parseISO(isoString), timezone, 'MMM d, h:mm a');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Smart Availability Analysis
          </CardTitle>
          <CardDescription>
            Find the best times for meetings based on your calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Meeting Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Look Ahead</Label>
              <Select value={daysAhead} onValueChange={setDaysAhead}>
                <SelectTrigger id="days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Next 24 hours</SelectItem>
                  <SelectItem value="3">Next 3 days</SelectItem>
                  <SelectItem value="7">Next week</SelectItem>
                  <SelectItem value="14">Next 2 weeks</SelectItem>
                  <SelectItem value="30">Next month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={analyzeAvailability} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Find Times
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {availabilityData && (
        <>
          {/* Top Suggestions */}
          {availabilityData.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Best Meeting Times
                </CardTitle>
                <CardDescription>
                  AI-recommended time slots based on your schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availabilityData.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">
                          {formatTime(suggestion.start)} - {formatTime(suggestion.end)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {suggestion.reason}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Quality</div>
                          <div className="text-lg font-bold text-primary">
                            {suggestion.score}/10
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Available Slots */}
          <Card>
            <CardHeader>
              <CardTitle>All Available Time Slots</CardTitle>
              <CardDescription>
                {availabilityData.availableSlots.length} slots found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                {availabilityData.availableSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {slot.durationMinutes} min
                    </div>
                  </div>
                ))}
                {availabilityData.availableSlots.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No available time slots found in this period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
