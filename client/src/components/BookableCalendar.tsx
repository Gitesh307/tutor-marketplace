import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Repeat } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookableCalendarProps {
  tutorId: number;
  tutorName: string;
  courseId: number;
  courseName: string;
  sessionDuration: number; // in minutes
  onBookingComplete: () => void;
}

type RecurringFrequency = 'once' | 'weekly' | 'biweekly';

interface RecurringSession {
  date: Date;
  time: string;
}

export function BookableCalendar({
  tutorId,
  tutorName,
  courseId,
  courseName,
  sessionDuration,
  onBookingComplete,
}: BookableCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('once');
  const [numberOfWeeks, setNumberOfWeeks] = useState<number>(4);
  const [recurringSessions, setRecurringSessions] = useState<RecurringSession[]>([]);

  // Generate time slots from 8 AM to 8 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        // TODO: Check actual tutor availability from backend
        const available = Math.random() > 0.3; // Mock availability
        slots.push({ time, available });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
    
    // Calculate recurring sessions if applicable
    if (selectedDate && recurringFrequency !== 'once') {
      const sessions: RecurringSession[] = [];
      const weekIncrement = recurringFrequency === 'weekly' ? 1 : 2;
      
      for (let i = 0; i < numberOfWeeks; i++) {
        const sessionDate = new Date(selectedDate);
        sessionDate.setDate(sessionDate.getDate() + (i * weekIncrement * 7));
        sessions.push({ date: sessionDate, time });
      }
      
      setRecurringSessions(sessions);
    } else {
      setRecurringSessions([]);
    }
    
    setIsConfirmDialogOpen(true);
  };

  const bookSessionMutation = trpc.session.quickBook.useMutation({
    onSuccess: () => {
      toast.success("Session booked successfully!");
      setIsConfirmDialogOpen(false);
      onBookingComplete();
    },
    onError: (error) => {
      toast.error(`Failed to book session: ${error.message}`);
    },
  });

  const bookRecurringMutation = trpc.session.quickBookRecurring.useMutation({
    onSuccess: (data) => {
      if (data.totalFailed > 0) {
        toast.warning(`Booked ${data.totalBooked} sessions. ${data.totalFailed} sessions failed.`);
      } else {
        toast.success(`Successfully booked ${data.totalBooked} recurring sessions!`);
      }
      setIsConfirmDialogOpen(false);
      onBookingComplete();
    },
    onError: (error) => {
      toast.error(`Failed to book recurring sessions: ${error.message}`);
    },
  });

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    
    if (recurringSessions.length > 0) {
      // Book multiple recurring sessions
      const sessions = recurringSessions.map(session => {
        const scheduledDate = new Date(session.date);
        const [h, m] = session.time.split(":").map(Number);
        scheduledDate.setHours(h, m, 0, 0);
        return { scheduledAt: scheduledDate.getTime() };
      });
      
      bookRecurringMutation.mutate({
        courseId,
        tutorId,
        sessions,
        duration: sessionDuration,
      });
    } else {
      // Book single session
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      bookSessionMutation.mutate({
        courseId,
        tutorId,
        scheduledAt: scheduledDate.getTime(),
        duration: sessionDuration,
      });
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Recurring Options */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Repeat className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Booking Options</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={recurringFrequency} onValueChange={(value) => setRecurringFrequency(value as RecurringFrequency)}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time session</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly (every 2 weeks)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {recurringFrequency !== 'once' && (
            <div>
              <Label htmlFor="weeks">Number of Sessions</Label>
              <Input
                id="weeks"
                type="number"
                min={2}
                max={52}
                value={numberOfWeeks}
                onChange={(e) => setNumberOfWeeks(parseInt(e.target.value) || 4)}
              />
            </div>
          )}
        </div>
        {recurringFrequency !== 'once' && (
          <p className="text-sm text-muted-foreground mt-2">
            You'll book {numberOfWeeks} sessions, {recurringFrequency === 'weekly' ? 'every week' : 'every 2 weeks'}
          </p>
        )}
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Select a Date</h3>
        <Card className="p-4 inline-block">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
            className="rounded-md"
          />
        </Card>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Available Time Slots - {formatDate(selectedDate)}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={slot.available ? "outline" : "ghost"}
                disabled={!slot.available}
                onClick={() => handleTimeSlotClick(slot.time)}
                className={`h-12 ${
                  slot.available
                    ? "hover:bg-primary hover:text-primary-foreground"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                <Clock className="w-3 h-3 mr-1" />
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {recurringSessions.length > 0 ? `Confirm ${recurringSessions.length} Recurring Sessions` : 'Confirm Session Booking'}
            </DialogTitle>
            <DialogDescription>
              Please review the session details before confirming your booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{courseName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tutor</p>
                <p className="font-medium">{tutorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{sessionDuration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="font-medium">{recurringSessions.length > 0 ? recurringSessions.length : 1}</p>
              </div>
            </div>

            {recurringSessions.length > 0 ? (
              <div>
                <p className="text-sm font-medium mb-2">Scheduled Sessions:</p>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-2">#</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recurringSessions.map((session, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2">{formatDate(session.date)}</td>
                          <td className="p-2">{session.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedTime}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
