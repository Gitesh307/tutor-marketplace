import { Calendar } from "lucide-react";
import { useEffect, useRef } from "react";

interface AcuitySchedulingEmbedProps {
  acuityLink: string;
  compact?: boolean;
}

export function AcuitySchedulingEmbed({ acuityLink, compact = false }: AcuitySchedulingEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Acuity Scheduling iframe auto-resize script
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'string' && event.data.indexOf('acuity') !== -1) {
        try {
          const data = JSON.parse(event.data);
          if (data.height && iframeRef.current) {
            iframeRef.current.style.height = `${data.height}px`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Extract the scheduling URL from various Acuity link formats
  const getEmbedUrl = (link: string): string => {
    // If it's already a full URL, use it
    if (link.startsWith('http')) {
      return link;
    }
    // If it's a relative path, construct the full URL
    return `https://app.acuityscheduling.com/${link}`;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Real-Time Availability
        </div>
        <a
          href={getEmbedUrl(acuityLink)}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-center font-medium text-sm transition-colors"
        >
          View Schedule & Book
        </a>
        <p className="text-xs text-muted-foreground text-center">
          Opens in a new window
        </p>
      </div>
    );
  }

  // Full embed view
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4" />
        Schedule a Session
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-background">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl(acuityLink)}
          width="100%"
          height="600"
          frameBorder="0"
          title="Schedule Appointment"
          className="w-full min-h-[600px]"
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Powered by Acuity Scheduling
      </p>
    </div>
  );
}
