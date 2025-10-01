import { useState } from "react";
import { Calendar, Download, Sparkles, LayoutGrid, LayoutList, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { CalendarView, CalendarEvent } from "@/components/CalendarView";
import { TaskInput, Task } from "@/components/TaskInput";
import { TaskList } from "@/components/TaskList";
import { FileUpload } from "@/components/FileUpload";
import { CalendarIntegration } from "@/components/CalendarIntegration";
import { EventDialog } from "@/components/EventDialog";
import { GoogleOAuthHandler } from "@/components/GoogleOAuthHandler";
import { CategoryManager } from "@/components/CategoryManager";
import { AISuggestions } from "@/components/AISuggestions";
import { SubscriptionStatus } from "@/components/SubscriptionStatus";
import { ImageEventScanner } from "@/components/ImageEventScanner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { scheduleTasks, downloadICS } from "@/lib/scheduler";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const Index = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { plan } = useSubscription();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<CalendarEvent[]>([]);
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

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
            
            <div className="flex items-center gap-2">
              <SubscriptionStatus />
              <Button onClick={toggleTheme} variant="ghost" size="icon">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button onClick={handleAutoSchedule} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Auto Schedule
              </Button>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export .ics
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">My Account</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <CategoryManager />
            
            <AISuggestions 
              onAddTask={(task) => {
                handleTasksAdd([{
                  id: Date.now().toString(),
                  title: task.title,
                  priority: task.priority as 'low' | 'medium' | 'high',
                  duration: 60
                }]);
              }}
            />
            
            <ImageEventScanner 
              onEventsExtracted={handleTasksAdd}
              userPlan={plan}
            />
            
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
