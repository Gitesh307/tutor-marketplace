import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface TutorAvailabilityDisplayProps {
  availability: Array<{
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>;
}

export default function TutorAvailabilityDisplay({ availability }: TutorAvailabilityDisplayProps) {
  // Group availability by day
  const availabilityByDay = DAYS_OF_WEEK.map(day => ({
    ...day,
    slots: availability.filter(slot => slot.dayOfWeek === day.value && slot.isActive),
  }));

  // Check if tutor has any availability set
  const hasAvailability = availability.some(slot => slot.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Weekly Availability
        </CardTitle>
        <CardDescription>
          When this tutor is typically available for sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAvailability ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No availability schedule set</p>
            <p className="text-sm">Contact the tutor to discuss scheduling options</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilityByDay.map(day => (
              day.slots.length > 0 && (
                <div key={day.value} className="border-b pb-3 last:border-0">
                  <div className="font-medium text-sm mb-2">{day.label}</div>
                  <div className="space-y-1 pl-4">
                    {day.slots.map(slot => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
