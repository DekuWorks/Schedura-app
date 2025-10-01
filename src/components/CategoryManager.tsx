import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  color: string;
  workspace_id: string;
}

interface CategoryManagerProps {
  selectedCategoryId?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
}

export const CategoryManager = ({ selectedCategoryId, onCategorySelect }: CategoryManagerProps = {}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [workspaceId, setWorkspaceId] = useState<string>('');

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const fetchWorkspace = async () => {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .limit(1)
      .single();
    
    if (workspace) {
      setWorkspaceId(workspace.id);
      fetchCategories(workspace.id);
    }
    setLoading(false);
  };

  const fetchCategories = async (wsId: string) => {
    const { data, error } = await supabase
      .from('task_categories')
      .select('*')
      .eq('workspace_id', wsId)
      .order('name');

    if (error) {
      toast.error('Failed to load categories');
      return;
    }
    setCategories(data || []);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('task_categories')
        .update({ name, color })
        .eq('id', editingCategory.id);

      if (error) {
        toast.error('Failed to update category');
        return;
      }
      toast.success('Category updated!');
    } else {
      const { error } = await supabase
        .from('task_categories')
        .insert({ name, color, workspace_id: workspaceId });

      if (error) {
        toast.error('Failed to create category');
        return;
      }
      toast.success('Category created!');
    }

    fetchCategories(workspaceId);
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('task_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete category');
      return;
    }
    toast.success('Category deleted!');
    fetchCategories(workspaceId);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setColor('#6366f1');
  };

  if (loading) {
    return <div className="animate-pulse">Loading categories...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categories
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Work, Personal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {onCategorySelect && (
            <div
              onClick={() => onCategorySelect(null)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${!selectedCategoryId ? 'bg-accent/30 border-primary' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-muted" />
                <span className="font-medium">All Tasks</span>
              </div>
            </div>
          )}
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No categories yet. Create one to organize your tasks!
            </p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                onClick={() => onCategorySelect?.(category.id)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  onCategorySelect ? 'cursor-pointer hover:bg-accent/50' : ''
                } ${selectedCategoryId === category.id ? 'bg-accent/30 border-primary' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
