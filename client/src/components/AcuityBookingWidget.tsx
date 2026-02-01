import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface AcuityBookingWidgetProps {
  /** Acuity account owner ID */
  owner: string;
  /** Optional: specific appointment type ID to show */
  appointmentTypeId?: number;
  /** Optional: specific calendar ID to show */
  calendarId?: number;
  /** Course title for display */
  courseTitle?: string;
  /** Tutor name for display */
  tutorName?: string;
}

/**
 * Embedded Acuity Scheduling widget
 * 
 * This component embeds the Acuity Scheduling iframe to allow parents
 * to book tutoring sessions directly within the application.
 * 
 * Documentation: https://developers.acuityscheduling.com/docs/embed-options
 */
export function AcuityBookingWidget({
  owner,
  appointmentTypeId,
  calendarId,
  courseTitle,
  tutorName,
}: AcuityBookingWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Build Acuity scheduling URL
    const params = new URLSearchParams();
    params.append("owner", owner);
    
    if (appointmentTypeId) {
      params.append("appointmentType", appointmentTypeId.toString());
    }
    
    if (calendarId) {
      params.append("calendar", calendarId.toString());
    }

    const acuityUrl = `https://app.acuityscheduling.com/schedule.php?${params.toString()}`;

    // Create iframe
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      
      const iframe = document.createElement("iframe");
      iframe.src = acuityUrl;
      iframe.width = "100%";
      iframe.height = "800";
      iframe.frameBorder = "0";
      iframe.style.border = "none";
      
      containerRef.current.appendChild(iframe);
    }

    // Load Acuity embed script for responsive sizing
    const script = document.createElement("script");
    script.src = "https://embed.acuityscheduling.com/js/embed.js";
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [owner, appointmentTypeId, calendarId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book a Session
        </CardTitle>
        <CardDescription>
          {courseTitle && tutorName ? (
            <>Schedule your session for <strong>{courseTitle}</strong> with <strong>{tutorName}</strong></>
          ) : courseTitle ? (
            <>Schedule your session for <strong>{courseTitle}</strong></>
          ) : (
            "Choose a date and time that works for you"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="min-h-[800px] w-full" />
      </CardContent>
    </Card>
  );
}
