import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionNotesView } from "@/components/SessionNotesView";
import { FileText, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function SessionNotesHistory() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: tutorNotes, isLoading: tutorNotesLoading } = trpc.sessionNotes.getMyNotes.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "tutor" }
  );

  const { data: parentNotes, isLoading: parentNotesLoading } = trpc.sessionNotes.getParentNotes.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "parent" }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const notes = user.role === "tutor" ? tutorNotes : parentNotes;
  const isLoading = user.role === "tutor" ? tutorNotesLoading : parentNotesLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Session Notes History</h1>
          </div>
          <p className="text-muted-foreground">
            {user.role === "tutor" 
              ? "View all session notes you've created for your students"
              : "View all session notes from your child's tutoring sessions"}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-6">
            {notes.map((note) => (
              <div key={note.id}>
                <SessionNotesView note={note} />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Session Notes Yet</CardTitle>
              <CardDescription>
                {user.role === "tutor"
                  ? "You haven't created any session notes yet. Add notes after completing a session to share feedback with parents."
                  : "Your tutor hasn't added any session notes yet. Notes will appear here after each completed session."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={user.role === "tutor" ? "/tutor-dashboard" : "/parent-dashboard"}>
                <a className="text-primary hover:underline">
                  Go to Dashboard
                </a>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
