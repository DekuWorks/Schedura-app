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
import { TimezoneSelector } from "@/components/TimezoneSelector";
import { AvailabilityView } from "@/components/AvailabilityView";
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

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
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-accent to-primary">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  Schedura
                </h1>
                <p className="text-xs text-muted-foreground hidden md:block">Smart Task Scheduling</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2">
              <div className="hidden lg:block">
                <SubscriptionStatus />
              </div>
              <TimezoneSelector />
              <Button onClick={toggleTheme} variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                {theme === 'dark' ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
              </Button>
              <Button onClick={handleAutoSchedule} className="gap-1 md:gap-2 text-xs md:text-sm h-8 md:h-10 px-2 md:px-4">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Auto</span>
              </Button>
              <Button onClick={handleExport} variant="outline" className="gap-1 md:gap-2 text-xs md:text-sm h-8 md:h-10 px-2 md:px-4 hidden sm:flex">
                <Download className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Export</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10">
                    <Avatar className="h-7 w-7 md:h-8 md:w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background">
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
      <main className="container mx-auto px-2 sm:px-4 py-4 md:py-8">
        <div className="grid lg:grid-cols-[350px_1fr] gap-4 md:gap-6">
          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            <CategoryManager 
              selectedCategoryId={selectedCategoryFilter}
              onCategorySelect={setSelectedCategoryFilter}
            />
            
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
                <h3 className="font-semibold text-lg">
                  Tasks ({selectedCategoryFilter ? tasks.filter(t => t.categoryId === selectedCategoryFilter).length : tasks.length})
                </h3>
              </div>
              <TaskList 
                tasks={selectedCategoryFilter ? tasks.filter(t => t.categoryId === selectedCategoryFilter) : tasks} 
                onTaskRemove={handleTaskRemove} 
              />
            </div>
          </div>

          {/* Calendar & Availability */}
          <div className="bg-card rounded-lg p-3 md:p-6 shadow-[var(--shadow-medium)] min-h-[400px] md:min-h-[600px]">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold">Calendar</h2>
                  <div className="flex gap-1 md:gap-2">
                    <Button
                      variant={calendarView === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCalendarView("week")}
                      className="gap-1 md:gap-2 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
                    >
                      <LayoutList className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Week</span>
                    </Button>
                    <Button
                      variant={calendarView === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCalendarView("month")}
                      className="gap-1 md:gap-2 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
                    >
                      <LayoutGrid className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Month</span>
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
              </TabsContent>
              
              <TabsContent value="availability">
                <AvailabilityView />
              </TabsContent>
            </Tabs>
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
