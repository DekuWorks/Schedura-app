import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  view: "week" | "month";
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarView = ({ events, view, onEventClick }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPrevious = () => {
    if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    }
  };

  const goToNext = () => {
    if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (view === "week") {
    return <WeekView currentDate={currentDate} events={events} onEventClick={onEventClick} goToPrevious={goToPrevious} goToNext={goToNext} goToToday={goToToday} />;
  }

  return <MonthView currentDate={currentDate} events={events} onEventClick={onEventClick} goToPrevious={goToPrevious} goToNext={goToNext} goToToday={goToToday} />;
};

interface ViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
}

const WeekView = ({ currentDate, events, onEventClick, goToPrevious, goToNext, goToToday }: ViewProps) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold">
          {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-px bg-border">
          <div className="bg-card p-2"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className={cn(
              "bg-card p-3 text-center",
              isSameDay(day, new Date()) && "bg-accent/10"
            )}>
              <div className="text-sm font-medium text-muted-foreground">{format(day, "EEE")}</div>
              <div className={cn(
                "text-2xl font-semibold mt-1",
                isSameDay(day, new Date()) && "text-accent"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}

          {hours.map((hour) => (
            <>
              <div key={`hour-${hour}`} className="bg-card p-2 text-xs text-muted-foreground text-right pr-3">
                {format(new Date().setHours(hour, 0), "ha")}
              </div>
              {weekDays.map((day) => {
                const dayEvents = getEventsForDay(day).filter(
                  event => event.start.getHours() === hour
                );
                return (
                  <div key={`${day.toISOString()}-${hour}`} className="bg-card p-2 min-h-[60px] relative">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className="absolute inset-x-1 bg-accent text-accent-foreground p-2 rounded-md text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          background: event.color || 'hsl(var(--accent))',
                          top: '0.25rem',
                        }}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="opacity-90">{format(event.start, "h:mm a")}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

const MonthView = ({ currentDate, events, onEventClick, goToPrevious, goToNext, goToToday }: ViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6 * 7 - 1);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-px bg-border mb-px">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="bg-card p-3 text-center font-semibold text-sm text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-border">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "bg-card p-2 min-h-[100px] relative",
                  !isCurrentMonth && "opacity-40",
                  isToday && "bg-accent/5"
                )}
              >
                <div className={cn(
                  "font-semibold text-sm mb-1",
                  isToday && "text-accent"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        background: event.color || 'hsl(var(--accent))',
                        color: 'hsl(var(--accent-foreground))',
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
