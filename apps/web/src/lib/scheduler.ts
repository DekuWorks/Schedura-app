import { Task } from "@/components/TaskInput";
import { CalendarEvent } from "@/components/CalendarView";
import { addMinutes, setHours, setMinutes, startOfWeek, addDays, isWithinInterval, isBefore, isAfter } from "date-fns";

interface ScheduleOptions {
  startDate?: Date;
  workStartHour?: number; // 9 AM default
  workEndHour?: number; // 17 PM default (5 PM)
  excludeWeekends?: boolean;
}

export const scheduleTasks = (
  tasks: Task[],
  existingEvents: CalendarEvent[] = [],
  options: ScheduleOptions = {}
): CalendarEvent[] => {
  const {
    startDate = new Date(),
    workStartHour = 9,
    workEndHour = 17,
    excludeWeekends = true,
  } = options;

  const scheduledEvents: CalendarEvent[] = [];
  let currentSlot = getNextAvailableSlot(startDate, workStartHour);

  // Separate tasks with fixed times from tasks that need scheduling
  const fixedTimeTasks = tasks.filter(t => t.startTime && t.endTime);
  const flexibleTasks = tasks.filter(t => !t.startTime || !t.endTime);

  // Add fixed time tasks first
  for (const task of fixedTimeTasks) {
    scheduledEvents.push({
      id: task.id,
      title: task.title,
      start: task.startTime!,
      end: task.endTime!,
      color: getPriorityColor(task.priority),
      notes: task.notes,
    });
  }

  // Sort flexible tasks by priority (high -> medium -> low) and then by duration
  const sortedTasks = [...flexibleTasks].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const priorityDiff = (priorityWeight[b.priority || "medium"] - priorityWeight[a.priority || "medium"]);
    if (priorityDiff !== 0) return priorityDiff;
    return b.duration - a.duration;
  });

  for (const task of sortedTasks) {
    let scheduled = false;
    let attempts = 0;
    const maxAttempts = 14; // Try up to 2 weeks

    while (!scheduled && attempts < maxAttempts) {
      // Skip weekends if needed
      if (excludeWeekends && (currentSlot.getDay() === 0 || currentSlot.getDay() === 6)) {
        currentSlot = addDays(currentSlot, 1);
        currentSlot = setHours(setMinutes(currentSlot, 0), workStartHour);
        attempts++;
        continue;
      }

      const proposedEnd = addMinutes(currentSlot, task.duration);
      const proposedEndHour = proposedEnd.getHours() + proposedEnd.getMinutes() / 60;

      // Check if event fits within work hours
      if (proposedEndHour > workEndHour) {
        // Move to next day
        currentSlot = addDays(currentSlot, 1);
        currentSlot = setHours(setMinutes(currentSlot, 0), workStartHour);
        attempts++;
        continue;
      }

      // Check for conflicts with existing events
      const hasConflict = [...existingEvents, ...scheduledEvents].some(event =>
        isWithinInterval(currentSlot, { start: event.start, end: event.end }) ||
        isWithinInterval(proposedEnd, { start: event.start, end: event.end }) ||
        (isBefore(currentSlot, event.start) && isAfter(proposedEnd, event.end))
      );

      if (hasConflict) {
        // Find the next event that conflicts and jump past it
        const nextConflict = [...existingEvents, ...scheduledEvents]
          .filter(event => isAfter(event.end, currentSlot))
          .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
        
        if (nextConflict) {
          currentSlot = nextConflict.end;
        } else {
          currentSlot = addMinutes(currentSlot, 15); // Move forward 15 minutes
        }
        continue;
      }

      // Schedule the task
      scheduledEvents.push({
        id: task.id,
        title: task.title,
        start: currentSlot,
        end: proposedEnd,
        color: getPriorityColor(task.priority),
        notes: task.notes,
      });

      currentSlot = addMinutes(proposedEnd, 15); // Add 15-minute buffer
      scheduled = true;
    }
  }

  return scheduledEvents;
};

const getNextAvailableSlot = (date: Date, workStartHour: number): Date => {
  const now = new Date();
  let slot = new Date(date);

  // If the date is today and it's past work start, start from current time
  if (slot.toDateString() === now.toDateString()) {
    const currentHour = now.getHours();
    if (currentHour >= workStartHour) {
      slot = new Date(now);
      // Round up to next 15-minute interval
      const minutes = slot.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 15) * 15;
      slot = setMinutes(slot, roundedMinutes % 60);
      if (roundedMinutes >= 60) {
        slot = setHours(slot, slot.getHours() + 1);
      }
      return slot;
    }
  }

  return setHours(setMinutes(slot, 0), workStartHour);
};

const getPriorityColor = (priority?: "low" | "medium" | "high"): string => {
  switch (priority) {
    case "high":
      return "hsl(0 84% 60%)"; // destructive
    case "low":
      return "hsl(142 71% 45%)"; // success
    case "medium":
    default:
      return "hsl(262 83% 58%)"; // primary/accent
  }
};

export const exportToICS = (events: CalendarEvent[]): string => {
  const icsEvents = events.map(event => {
    const dtStart = formatICSDate(event.start);
    const dtEnd = formatICSDate(event.end);
    
    return `BEGIN:VEVENT
UID:${event.id}@schedura.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${event.title}
END:VEVENT`;
  }).join('\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Schedura//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${icsEvents}
END:VCALENDAR`;
};

const formatICSDate = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

export const downloadICS = (events: CalendarEvent[], filename: string = "schedura-calendar.ics") => {
  const icsContent = exportToICS(events);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
