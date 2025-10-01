import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useTimezone } from "@/hooks/useTimezone";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Task {
  id: string;
  title: string;
  duration_minutes?: number;
  priority?: string;
  description?: string;
  is_scheduled?: boolean;
}

interface ScheduledTask {
  taskId: string;
  title: string;
  startTime: string;
  endTime: string;
  reason: string;
  confidence: number;
}

interface UnscheduledTask {
  taskId: string;
  title: string;
  reason: string;
}

interface ScheduleResult {
  scheduledTasks: ScheduledTask[];
  unscheduledTasks: UnscheduledTask[];
  timezone: string;
}

export function TaskScheduler() {
  const { toast } = useToast();
  const timezone = useTimezone();
  const queryClient = useQueryClient();
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null);

  // Fetch unscheduled tasks
  const { data: unscheduledTasks = [], isLoading } = useQuery({
    queryKey: ['unscheduled-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or('is_scheduled.is.null,is_scheduled.eq.false')
        .eq('is_completed', false)
        .order('priority', { ascending: false })
        .order('created_at');

      if (error) throw error;
      return data as Task[];
    }
  });

  // Mutation to save scheduled tasks
  const saveScheduleMutation = useMutation({
    mutationFn: async (tasks: ScheduledTask[]) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updates = tasks.map(task => {
        const originalTask = unscheduledTasks.find(t => t.id === task.taskId);
        return {
          id: task.taskId,
          title: originalTask?.title || task.title,
          user_id: user.id,
          start_time: task.startTime,
          end_time: task.endTime,
          is_scheduled: true
        };
      });

      const { error } = await supabase
        .from('tasks')
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unscheduled-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Tasks scheduled!",
        description: "Your tasks have been added to the calendar",
      });
      setScheduleResult(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to save schedule",
        description: error.message,
      });
    }
  });

  const scheduleAllTasks = async () => {
    if (unscheduledTasks.length === 0) {
      toast({
        title: "No tasks to schedule",
        description: "Add some tasks first",
      });
      return;
    }

    setIsScheduling(true);
    try {
      const startDate = new Date().toISOString();
      const endDate = addDays(new Date(), 14).toISOString(); // Schedule within next 2 weeks

      const { data, error } = await supabase.functions.invoke('schedule-tasks', {
        body: {
          tasks: unscheduledTasks.map(t => ({
            id: t.id,
            title: t.title,
            duration_minutes: t.duration_minutes || 30,
            priority: t.priority || 'medium',
            description: t.description
          })),
          startDate,
          endDate,
          timezone,
          workingHours: {
            start: '9:00',
            end: '17:00'
          }
        }
      });

      if (error) throw error;

      setScheduleResult(data);
      
      if (data.scheduledTasks.length > 0) {
        toast({
          title: "Schedule created!",
          description: `Successfully scheduled ${data.scheduledTasks.length} tasks`,
        });
      }

      if (data.unscheduledTasks.length > 0) {
        toast({
          variant: "destructive",
          title: "Some tasks couldn't be scheduled",
          description: `${data.unscheduledTasks.length} tasks need manual scheduling`,
        });
      }

    } catch (error: any) {
      console.error('Error scheduling tasks:', error);
      toast({
        variant: "destructive",
        title: "Scheduling failed",
        description: error.message || "Failed to schedule tasks",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const formatTime = (isoString: string) => {
    return formatInTimeZone(parseISO(isoString), timezone, 'MMM d, h:mm a');
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Task Scheduler
          </CardTitle>
          <CardDescription>
            Automatically find optimal time slots for your tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{unscheduledTasks.length} unscheduled tasks</div>
              <p className="text-sm text-muted-foreground">
                AI will find the best times based on your calendar
              </p>
            </div>
            <Button 
              onClick={scheduleAllTasks} 
              disabled={isScheduling || unscheduledTasks.length === 0}
            >
              {isScheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule All
                </>
              )}
            </Button>
          </div>

          {unscheduledTasks.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <div className="text-sm font-medium mb-2">Unscheduled Tasks:</div>
              {unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority || 'medium'}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {task.duration_minutes || 30}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {scheduleResult && (
        <>
          {/* Successfully Scheduled Tasks */}
          {scheduleResult.scheduledTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Proposed Schedule ({scheduleResult.scheduledTasks.length})
                </CardTitle>
                <CardDescription>
                  Review and confirm these time slots
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scheduleResult.scheduledTasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold">{task.title}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(task.startTime)} - {formatTime(task.endTime)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className="text-lg font-bold text-primary">
                          {task.confidence}/10
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.reason}</p>
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => saveScheduleMutation.mutate(scheduleResult.scheduledTasks)}
                    disabled={saveScheduleMutation.isPending}
                    className="flex-1"
                  >
                    {saveScheduleMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirm Schedule
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setScheduleResult(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unscheduled Tasks */}
          {scheduleResult.unscheduledTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Could Not Schedule ({scheduleResult.unscheduledTasks.length})
                </CardTitle>
                <CardDescription>
                  These tasks need manual scheduling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {scheduleResult.unscheduledTasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-3 border border-destructive/50 rounded-lg"
                  >
                    <div className="font-medium">{task.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{task.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
