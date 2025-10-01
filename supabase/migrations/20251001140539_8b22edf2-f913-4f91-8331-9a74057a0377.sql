-- Fix infinite recursion in RLS policies by simplifying them

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view workspaces they're members of" ON workspaces;
DROP POLICY IF EXISTS "Users can view categories in their workspaces" ON task_categories;
DROP POLICY IF EXISTS "Users can manage categories in their workspaces" ON task_categories;
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;

-- Recreate workspaces policies without recursion
CREATE POLICY "Users can view their own workspaces"
  ON workspaces FOR SELECT
  USING (owner_id = auth.uid());

-- Recreate workspace_members policies without recursion  
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Workspace owners can manage members"
  ON workspace_members FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- Recreate task_categories policies without recursion
CREATE POLICY "Users can view their categories"
  ON task_categories FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their categories"
  ON task_categories FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );