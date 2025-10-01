import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const popularTimezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'UTC', label: 'UTC' },
];

export function TimezoneSelector() {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimezone();
  }, []);

  const fetchTimezone = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('timezone')
      .single();
    
    if (profile?.timezone) {
      setTimezone(profile.timezone);
    } else {
      // Try to detect user's timezone
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected || 'UTC');
    }
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    setLoading(true);
    setTimezone(newTimezone);

    const { error } = await supabase
      .from('profiles')
      .update({ timezone: newTimezone })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast.error('Failed to update timezone');
      setLoading(false);
      return;
    }

    toast.success('Timezone updated!');
    setLoading(false);
    window.location.reload(); // Reload to apply timezone changes
  };

  const currentLabel = popularTimezones.find(tz => tz.value === timezone)?.label || timezone;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 md:h-10 md:w-10"
          disabled={loading}
        >
          <Globe className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background max-h-96 overflow-y-auto">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">Timezone</p>
            <p className="text-xs text-muted-foreground truncate">{currentLabel}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {popularTimezones.map((tz) => (
          <DropdownMenuItem
            key={tz.value}
            onClick={() => handleTimezoneChange(tz.value)}
            className={timezone === tz.value ? 'bg-accent' : ''}
          >
            {tz.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
