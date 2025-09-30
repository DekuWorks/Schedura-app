import { Clock, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Task } from "./TaskInput";

interface TaskListProps {
  tasks: Task[];
  onTaskRemove: (id: string) => void;
}

export const TaskList = ({ tasks, onTaskRemove }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No tasks yet. Add your first task to get started!</p>
      </Card>
    );
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={cn(
            "p-4 flex items-center gap-3 hover:shadow-[var(--shadow-medium)] transition-shadow",
            "border-l-4",
            task.priority === "high" && "border-l-destructive",
            task.priority === "medium" && "border-l-accent",
            task.priority === "low" && "border-l-muted"
          )}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{task.title}</h4>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(task.duration)}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTaskRemove(task.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
};
