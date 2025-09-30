import { useState } from "react";
import { Plus, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  priority?: "low" | "medium" | "high";
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

interface TaskInputProps {
  onTasksAdd: (tasks: Task[]) => void;
}

export const TaskInput = ({ onTasksAdd }: TaskInputProps) => {
  const [taskList, setTaskList] = useState("");
  const [singleTask, setSingleTask] = useState("");
  const [duration, setDuration] = useState("30");
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const parseBulkTasks = (text: string): Task[] => {
    const lines = text.split("\n").filter(line => line.trim());
    return lines.map((line, index) => {
      // Try to parse duration from patterns like "30m", "1h", "2 hours"
      const durationMatch = line.match(/(\d+)\s*(m|min|minutes?|h|hr|hours?)/i);
      let taskDuration = 30; // default 30 minutes
      
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        if (unit.startsWith('h')) {
          taskDuration = value * 60;
        } else {
          taskDuration = value;
        }
      }

      // Remove duration from title
      const title = line.replace(/\s*-?\s*\d+\s*(m|min|minutes?|h|hr|hours?)/gi, "").trim();

      return {
        id: `task-${Date.now()}-${index}`,
        title: title || line,
        duration: taskDuration,
        priority: "medium",
      };
    });
  };

  const handleAddSingleTask = () => {
    if (!singleTask.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    let taskStartTime: Date | undefined;
    let taskEndTime: Date | undefined;

    if (startTime && endTime) {
      const now = new Date();
      taskStartTime = new Date(now.toDateString() + ' ' + startTime);
      taskEndTime = new Date(now.toDateString() + ' ' + endTime);
      
      if (taskEndTime <= taskStartTime) {
        toast.error("End time must be after start time");
        return;
      }
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      title: singleTask,
      duration: parseInt(duration),
      priority: "medium",
      startTime: taskStartTime,
      endTime: taskEndTime,
      notes: notes.trim() || undefined,
    };

    onTasksAdd([task]);
    setSingleTask("");
    setNotes("");
    setStartTime("");
    setEndTime("");
    toast.success("Task added!");
  };

  const handleAddBulkTasks = () => {
    if (!taskList.trim()) {
      toast.error("Please enter at least one task");
      return;
    }

    const tasks = parseBulkTasks(taskList);
    onTasksAdd(tasks);
    setTaskList("");
    toast.success(`${tasks.length} tasks added!`);
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === "single" ? "default" : "outline"}
          onClick={() => setMode("single")}
          className="flex-1"
        >
          Single Task
        </Button>
        <Button
          variant={mode === "bulk" ? "default" : "outline"}
          onClick={() => setMode("bulk")}
          className="flex-1"
        >
          Bulk Add
        </Button>
      </div>

      {mode === "single" ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              placeholder="e.g., Review project proposal"
              value={singleTask}
              onChange={(e) => setSingleTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSingleTask()}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-time">Start Time (optional)</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-time">End Time (optional)</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="5"
              step="5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used if no specific time is set
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any details or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleAddSingleTask} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="task-list">Task List</Label>
            <Textarea
              id="task-list"
              placeholder="Enter tasks (one per line):&#10;Team meeting - 1h&#10;Code review - 30m&#10;Write documentation - 45min"
              value={taskList}
              onChange={(e) => setTaskList(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tip: Add duration like "30m" or "1h" after each task
            </p>
          </div>
          <Button onClick={handleAddBulkTasks} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            Parse & Add Tasks
          </Button>
        </div>
      )}
    </Card>
  );
};
