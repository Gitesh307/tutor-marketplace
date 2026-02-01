import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Session {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
}

interface SchedulingCalendarProps {
  subscriptionId: number;
  tutorId: number;
  parentId: number;
  onSessionCreated?: () => void;
}

export default function SchedulingCalendar({ subscriptionId, tutorId, parentId, onSessionCreated }: SchedulingCalendarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [duration, setDuration] = useState<string>("60");

  const { data: sessions, refetch } = trpc.session.myUpcoming.useQuery();
  const createSessionMutation = trpc.session.create.useMutation();

  const calendarEvents: Session[] = (sessions || []).map((session) => ({
    id: session.id,
    title: `Tutoring Session`,
    start: new Date(session.scheduledAt),
    end: new Date(new Date(session.scheduledAt).getTime() + session.duration * 60000),
    status: session.status,
  }));

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setIsDialogOpen(true);
  };

  const handleCreateSession = async () => {
    if (!selectedSlot) return;

    try {
      await createSessionMutation.mutateAsync({
        subscriptionId,
        tutorId,
        parentId,
        scheduledAt: selectedSlot.start.getTime(),
        duration: parseInt(duration),
      });

      toast.success("Session scheduled successfully!");
      setIsDialogOpen(false);
      setSelectedSlot(null);
      refetch();
      onSessionCreated?.();
    } catch (error) {
      toast.error("Failed to schedule session");
    }
  };

  return (
    <>
      <div className="h-[600px] bg-card rounded-lg border border-border p-4">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          selectable
          onSelectSlot={handleSelectSlot}
          views={["month", "week", "day"]}
          defaultView="week"
          step={30}
          timeslots={2}
          eventPropGetter={(event: Session) => ({
            style: {
              backgroundColor: event.status === "completed" ? "#10b981" : "#3b82f6",
              borderRadius: "4px",
              opacity: 0.8,
              color: "white",
              border: "0px",
              display: "block",
            },
          })}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Tutoring Session</DialogTitle>
            <DialogDescription>
              Create a new tutoring session for the selected time slot
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-4">
              <div>
                <Label>Date & Time</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSlot.start.toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="duration">Session Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSession} disabled={createSessionMutation.isPending}>
                  {createSessionMutation.isPending ? "Scheduling..." : "Schedule Session"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
