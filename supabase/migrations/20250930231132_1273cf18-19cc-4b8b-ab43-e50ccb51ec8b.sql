-- Create table to store calendar connections
CREATE TABLE public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple')),
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  calendar_id TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create table to store synced calendar events
CREATE TABLE public.synced_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.calendar_connections(id) ON DELETE CASCADE,
  external_event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(connection_id, external_event_id)
);

-- Enable RLS
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synced_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_connections
CREATE POLICY "Users can view their own calendar connections"
ON public.calendar_connections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar connections"
ON public.calendar_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar connections"
ON public.calendar_connections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar connections"
ON public.calendar_connections
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for synced_calendar_events
CREATE POLICY "Users can view their synced events"
ON public.synced_calendar_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_connections
    WHERE calendar_connections.id = synced_calendar_events.connection_id
    AND calendar_connections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their synced events"
ON public.synced_calendar_events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.calendar_connections
    WHERE calendar_connections.id = synced_calendar_events.connection_id
    AND calendar_connections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their synced events"
ON public.synced_calendar_events
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_connections
    WHERE calendar_connections.id = synced_calendar_events.connection_id
    AND calendar_connections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their synced events"
ON public.synced_calendar_events
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_connections
    WHERE calendar_connections.id = synced_calendar_events.connection_id
    AND calendar_connections.user_id = auth.uid()
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_calendar_connections_updated_at
  BEFORE UPDATE ON public.calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_synced_calendar_events_updated_at
  BEFORE UPDATE ON public.synced_calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();