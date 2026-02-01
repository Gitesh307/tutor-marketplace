import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, AlertCircle, TrendingUp, Calendar, Download, Image as ImageIcon, File } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

interface SessionNotesViewProps {
  note: {
    id: number;
    progressSummary: string;
    homework?: string | null;
    challenges?: string | null;
    nextSteps?: string | null;
    createdAt: Date | string;
  };
  sessionDate?: Date | number;
}

interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date | string;
}

export function SessionNotesView({ note, sessionDate }: SessionNotesViewProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: attachments, isLoading: attachmentsLoading } = trpc.sessionNotes.getAttachments.useQuery(
    { sessionNoteId: note.id }
  );

  const formatDate = (date: Date | string | number) => {
    const d = typeof date === 'number' ? new Date(date) : new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    } else if (mimeType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else {
      return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Session Notes</CardTitle>
          </div>
          {sessionDate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(sessionDate)}
            </Badge>
          )}
        </div>
        <CardDescription>
          Feedback from your tutor about this session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Progress Summary</span>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
            {note.progressSummary}
          </p>
        </div>

        {/* Homework */}
        {note.homework && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>Homework Assigned</span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
              {note.homework}
            </p>
          </div>
        )}

        {/* Challenges */}
        {note.challenges && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span>Challenges & Areas for Improvement</span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
              {note.challenges}
            </p>
          </div>
        )}

        {/* Next Steps */}
        {note.nextSteps && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span>Next Steps & Recommendations</span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
              {note.nextSteps}
            </p>
          </div>
        )}

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Attached Files ({attachments.length})</span>
            </div>
            <div className="space-y-2 pl-6">
              {attachments.map((attachment: Attachment) => (
                <Card key={attachment.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(attachment.mimeType)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment.fileUrl, attachment.fileName)}
                      className="shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  {attachment.mimeType.startsWith("image/") && (
                    <div className="mt-2">
                      <img
                        src={attachment.fileUrl}
                        alt={attachment.fileName}
                        className="max-w-full h-auto rounded cursor-pointer"
                        onClick={() => setImagePreview(attachment.fileUrl)}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Note Date */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Notes added on {formatDate(note.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
