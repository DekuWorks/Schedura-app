import { useState } from "react";
import { Calendar, Download, Sparkles, LayoutGrid, LayoutList } from "lucide-react";
import { CalendarView, CalendarEvent } from "@/components/CalendarView";
import { TaskInput, Task } from "@/components/TaskInput";
import { TaskList } from "@/components/TaskList";
import { FileUpload } from "@/components/FileUpload";
import { CalendarIntegration } from "@/components/CalendarIntegration";
import { EventDialog } from "@/components/EventDialog";
import { GoogleOAuthHandler } from "@/components/GoogleOAuthHandler";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { scheduleTasks, downloadICS } from "@/lib/scheduler";
import { toast } from "sonner";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<CalendarEvent[]>([]);
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const handleTasksAdd = (newTasks: Task[]) => {
    setTasks([...tasks, ...newTasks]);
  };

  const handleTaskRemove = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    setScheduledEvents(scheduledEvents.filter(event => event.id !== id));
  };

  const handleAutoSchedule = () => {
    if (tasks.length === 0) {
      toast.error("Add some tasks first!");
      return;
    }

    const newEvents = scheduleTasks(tasks, []);
    setScheduledEvents(newEvents);
    toast.success(`Scheduled ${newEvents.length} tasks!`);
  };

  const handleExport = () => {
    if (scheduledEvents.length === 0) {
      toast.error("Schedule some tasks first!");
      return;
    }

    downloadICS(scheduledEvents);
    toast.success("Calendar file downloaded! Import it to your calendar app.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <GoogleOAuthHandler />
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-primary">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  Schedura
                </h1>
                <p className="text-xs text-muted-foreground">Smart Task Scheduling</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAutoSchedule} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Auto Schedule
              </Button>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export .ics
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="sync">Sync</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
                <TaskInput onTasksAdd={handleTasksAdd} />
              </TabsContent>
              
              <TabsContent value="upload">
                <FileUpload onTasksExtracted={handleTasksAdd} />
              </TabsContent>
              
              <TabsContent value="sync">
                <CalendarIntegration scheduledEvents={scheduledEvents} />
              </TabsContent>
            </Tabs>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Tasks ({tasks.length})</h3>
              </div>
              <TaskList tasks={tasks} onTaskRemove={handleTaskRemove} />
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-medium)] min-h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Calendar</h2>
              <div className="flex gap-2">
                <Button
                  variant={calendarView === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarView("week")}
                  className="gap-2"
                >
                  <LayoutList className="h-4 w-4" />
                  Week
                </Button>
                <Button
                  variant={calendarView === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarView("month")}
                  className="gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Month
                </Button>
              </div>
            </div>
            
            <CalendarView
              events={scheduledEvents}
              view={calendarView}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setEventDialogOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      <EventDialog 
        event={selectedEvent}
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
      />
    </div>
  );
};

export default Index;
