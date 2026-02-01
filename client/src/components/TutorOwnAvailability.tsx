import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Plus, Clock } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function TutorOwnAvailability() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const { data: availability, isLoading, refetch } = trpc.tutorAvailability.getAvailability.useQuery();

  const createSlotMutation = trpc.tutorAvailability.createSlot.useMutation({
    onSuccess: () => {
      toast.success("Availability slot added successfully");
      refetch();
      setSelectedDay(null);
      setStartTime("09:00");
      setEndTime("17:00");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add availability slot");
    },
  });

  const deleteSlotMutation = trpc.tutorAvailability.deleteSlot.useMutation({
    onSuccess: () => {
      toast.success("Availability slot deleted");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete slot");
    },
  });

  const handleAddSlot = () => {
    if (selectedDay === null) {
      toast.error("Please select a day");
      return;
    }

    createSlotMutation.mutate({
      dayOfWeek: selectedDay,
      startTime,
      endTime,
    });
  };

  const handleDeleteSlot = (slotId: number) => {
    if (confirm("Are you sure you want to delete this availability slot?")) {
      deleteSlotMutation.mutate({ id: slotId });
    }
  };

  // Group availability by day
  const availabilityByDay = DAYS_OF_WEEK.map(day => ({
    ...day,
    slots: (availability || []).filter((slot: any) => slot.dayOfWeek === day.value && slot.isActive),
  }));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading availability...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Availability Slot</CardTitle>
          <CardDescription>Set your weekly availability schedule for students to book sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <select
                value={selectedDay ?? ""}
                onChange={(e) => setSelectedDay(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a day</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleAddSlot}
            disabled={createSlotMutation.isPending}
            className="w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Availability Slot
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Weekly Schedule</CardTitle>
          <CardDescription>Your current availability that students can see on your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availabilityByDay.map(day => (
              <div key={day.value} className="border-b pb-4 last:border-0">
                <div className="font-medium mb-2">{day.label}</div>
                {day.slots.length === 0 ? (
                  <div className="text-sm text-muted-foreground pl-4">No availability set</div>
                ) : (
                  <div className="space-y-2 pl-4">
                    {day.slots.map((slot: any) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between bg-muted/50 p-3 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={deleteSlotMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {(availability || []).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No availability slots set yet</p>
              <p className="text-sm">Add your first availability slot above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
