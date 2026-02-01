import React, { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { AcuityBookingWidget } from "@/components/AcuityBookingWidget";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function BookSession() {
  const { id } = useParams();
  const subscriptionId = parseInt(id || "0");
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: subscriptions, isLoading } = trpc.subscription.mySubscriptions.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "parent" }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && user?.role !== "parent" && user?.role !== "admin") {
      setLocation("/role-selection");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Find the subscription
  const subscription = subscriptions?.find(s => s.subscription.id === subscriptionId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Subscription not found. Please return to your dashboard.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link href="/parent/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if subscription is active and paid
  if (subscription.subscription.status !== "active" || subscription.subscription.paymentStatus !== "paid") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {subscription.subscription.status !== "active" 
                ? "This subscription is not active. Please contact support if you believe this is an error."
                : "Payment is required before booking sessions. Please complete your payment from the dashboard."}
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link href="/parent/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if course has Acuity mapping configured
  const hasAcuityMapping = subscription.course.acuityAppointmentTypeId && subscription.course.acuityCalendarId;
  const acuityOwner = import.meta.env.VITE_ACUITY_OWNER_ID || "29896173";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/parent/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{subscription.course.title}</CardTitle>
              <CardDescription>
                with {subscription.tutor.name || "Tutor"}
                {subscription.subscription.studentFirstName && subscription.subscription.studentLastName && (
                  <> • Student: {subscription.subscription.studentFirstName} {subscription.subscription.studentLastName}</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{subscription.subscription.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sessions Completed</p>
                  <p className="font-medium">{subscription.subscription.sessionsCompleted || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{subscription.course.duration} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Started</p>
                  <p className="font-medium">
                    {new Date(subscription.subscription.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!hasAcuityMapping ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 h-4" />
            <AlertDescription>
              This course is not configured for online booking yet. Please contact support to enable booking for this course.
            </AlertDescription>
          </Alert>
        ) : (
          <AcuityBookingWidget
            owner={acuityOwner}
            appointmentTypeId={subscription.course.acuityAppointmentTypeId ?? undefined}
            calendarId={subscription.course.acuityCalendarId ?? undefined}
            courseTitle={subscription.course.title}
            tutorName={subscription.tutor.name || undefined}
          />
        )}
      </div>
    </div>
  );
}
