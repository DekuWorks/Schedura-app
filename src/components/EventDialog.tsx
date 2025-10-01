import { format } from "date-fns";
import { Calendar, Clock, StickyNote, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "./CalendarView";

interface EventDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDialog = ({ event, open, onOpenChange }: EventDialogProps) => {
  if (!event) return null;

  const duration = Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{event.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(event.start, "EEEE, MMMM d, yyyy")}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
            </span>
            <Badge variant="secondary" className="ml-2">
              {duration} min
            </Badge>
          </div>

          {event.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                <span>Notes</span>
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                {event.notes}
              </div>
            </div>
          )}

          <div
            className="h-2 rounded-full"
            style={{ backgroundColor: event.color || 'hsl(var(--accent))' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
