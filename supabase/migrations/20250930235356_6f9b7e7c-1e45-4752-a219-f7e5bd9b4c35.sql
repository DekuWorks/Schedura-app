-- Fix workspace SELECT policy bug
DROP POLICY IF EXISTS "Users can view workspaces they're members of" ON public.workspaces;

CREATE POLICY "Users can view workspaces they're members of"
  ON public.workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspaces.id 
      AND workspace_members.user_id = auth.uid()
    )
  );