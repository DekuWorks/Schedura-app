-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create workspaces table (without policies that reference workspace_members yet)
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Create workspace members table
CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('admin', 'member')) DEFAULT 'member' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Now add workspace policies that reference workspace_members
CREATE POLICY "Users can view workspaces they're members of"
  ON public.workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their workspaces"
  ON public.workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Workspace members policies
CREATE POLICY "Users can view members of their workspaces"
  ON public.workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR user_id = auth.uid())
    )
  );

CREATE POLICY "Workspace owners can manage members"
  ON public.workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- Create task categories table
CREATE TABLE public.task_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories in their workspaces"
  ON public.task_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can manage categories in their workspaces"
  ON public.task_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

-- Create tasks table
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.task_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium' NOT NULL,
  duration_minutes integer,
  start_time timestamptz,
  end_time timestamptz,
  is_scheduled boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (
    user_id = auth.uid() OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    ))
  );

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (user_id = auth.uid());

-- Create recurring tasks table
CREATE TABLE public.recurring_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  recurrence_pattern text CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly')) NOT NULL,
  recurrence_interval integer DEFAULT 1 NOT NULL,
  days_of_week integer[],
  day_of_month integer,
  end_date timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.recurring_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their recurring tasks"
  ON public.recurring_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their recurring tasks"
  ON public.recurring_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_id AND tasks.user_id = auth.uid()
    )
  );

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT false,
  notification_time_before integer DEFAULT 15,
  daily_summary boolean DEFAULT false,
  daily_summary_time time DEFAULT '09:00:00',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO public.workspaces (name, owner_id)
  VALUES ('My Workspace', NEW.id);
  
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_workspaces
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_notification_preferences
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();