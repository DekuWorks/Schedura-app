import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTimezone() {
  const [timezone, setTimezone] = useState<string>('UTC');

  useEffect(() => {
    fetchTimezone();
  }, []);

  const fetchTimezone = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('timezone')
      .maybeSingle();
    
    if (profile?.timezone) {
      setTimezone(profile.timezone);
    } else {
      // Try to detect user's timezone
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected || 'UTC');
    }
  };

  return timezone;
}
