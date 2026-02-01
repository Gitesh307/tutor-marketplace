import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: number;
  tutorName: string;
  scheduledAt: Date;
  duration: number;
  status: string;
}

interface SessionCalendarProps {
  sessions: Session[];
}

export function SessionCalendar({ sessions }: SessionCalendarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming sessions scheduled
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg p-3 min-w-[70px]">
                  <div className="text-2xl font-bold">
                    {format(new Date(session.scheduledAt), 'd')}
                  </div>
                  <div className="text-xs uppercase">
                    {format(new Date(session.scheduledAt), 'MMM')}
                  </div>
                </div>

                {/* Session Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="font-semibold truncate">
                        Session with {session.tutorName}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(session.scheduledAt), 'h:mm a')}
                        </span>
                        <span>•</span>
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
