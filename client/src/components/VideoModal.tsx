import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VideoModal({ open, onOpenChange }: VideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>What's EdKonnect Academy?</DialogTitle>
          <DialogDescription>
            Discover how EdKonnect connects parents with expert tutors for personalized learning
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="EdKonnect Academy Platform Overview"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            EdKonnect Academy brings together dedicated parents and qualified tutors to create meaningful 
            one-on-one learning experiences. Our platform makes it easy to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Browse and enroll in courses taught by expert tutors</li>
            <li>Manage multiple students with individual progress tracking</li>
            <li>Schedule sessions and communicate directly with tutors</li>
            <li>Track payments and download curriculum materials</li>
            <li>Share files and documents within conversations</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
