import { Clock, Trash2, GripVertical, Calendar, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Task } from "./TaskInput";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useTimezone } from "@/hooks/useTimezone";

interface TaskListProps {
  tasks: Task[];
  onTaskRemove: (id: string) => void;
}

export const TaskList = ({ tasks, onTaskRemove }: TaskListProps) => {
  const timezone = useTimezone();

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

  const formatTime = (date: Date) => {
    try {
      return formatInTimeZone(date, timezone, "h:mm a");
    } catch {
      return format(date, "h:mm a");
    }
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
            <div className="flex items-center gap-2">
              {task.categoryColor && (
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: task.categoryColor }}
                />
              )}
              <h4 className="font-medium truncate">{task.title}</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {task.startTime && task.endTime ? (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatTime(task.startTime)} - {formatTime(task.endTime)}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(task.duration)}
                </Badge>
              )}
              {task.notes && (
                <Badge variant="outline" className="text-xs gap-1">
                  <StickyNote className="h-3 w-3" />
                  Has notes
                </Badge>
              )}
              {task.categoryName && (
                <Badge variant="outline" className="text-xs">
                  {task.categoryName}
                </Badge>
              )}
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
