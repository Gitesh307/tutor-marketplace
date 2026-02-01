import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Link as LinkIcon } from "lucide-react";

export function CourseAcuityMapping() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<string>("");
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("");

  // Fetch courses
  const { data: courses, isLoading: coursesLoading } = trpc.course.list.useQuery();

  // Fetch Acuity data
  const { data: appointmentTypes, isLoading: appointmentTypesLoading } = 
    trpc.admin.getAcuityAppointmentTypes.useQuery();
  
  const { data: calendars, isLoading: calendarsLoading } = 
    trpc.admin.getAcuityCalendars.useQuery();

  // Update mutation
  const updateMappingMutation = trpc.admin.updateCourseAcuityMapping.useMutation({
    onSuccess: () => {
      toast.success("Acuity mapping updated successfully");
      setSelectedCourseId(null);
      setSelectedAppointmentTypeId("");
      setSelectedCalendarId("");
    },
    onError: (error) => {
      toast.error(`Failed to update mapping: ${error.message}`);
    },
  });

  // Get selected course
  const selectedCourse = courses?.find(c => c.id === selectedCourseId);

  // Handle course selection
  const handleCourseSelect = (courseId: string) => {
    const id = parseInt(courseId);
    setSelectedCourseId(id);
    
    const course = courses?.find(c => c.id === id);
    if (course) {
      setSelectedAppointmentTypeId(course.acuityAppointmentTypeId?.toString() || "");
      setSelectedCalendarId(course.acuityCalendarId?.toString() || "");
    }
  };

  // Handle save
  const handleSave = () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }

    updateMappingMutation.mutate({
      courseId: selectedCourseId,
      acuityAppointmentTypeId: selectedAppointmentTypeId ? parseInt(selectedAppointmentTypeId) : null,
      acuityCalendarId: selectedCalendarId ? parseInt(selectedCalendarId) : null,
    });
  };

  if (coursesLoading || appointmentTypesLoading || calendarsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Map each course to a specific Acuity appointment type and calendar. This ensures parents book the correct session type with the right tutor.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Configure Course Mapping</CardTitle>
          <CardDescription>
            Select a course and assign its Acuity appointment type and calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select value={selectedCourseId?.toString() || ""} onValueChange={handleCourseSelect}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Select a course to configure" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                    {course.acuityAppointmentTypeId && (
                      <CheckCircle2 className="inline-block ml-2 w-4 h-4 text-green-600" />
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCourse && (
            <>
              {/* Appointment Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="appointmentType">Acuity Appointment Type</Label>
                <Select 
                  value={selectedAppointmentTypeId} 
                  onValueChange={setSelectedAppointmentTypeId}
                >
                  <SelectTrigger id="appointmentType">
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes?.map((type: any) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} ({type.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {appointmentTypes?.length || 0} appointment types available
                </p>
              </div>

              {/* Calendar Selection */}
              <div className="space-y-2">
                <Label htmlFor="calendar">Acuity Calendar</Label>
                <Select 
                  value={selectedCalendarId} 
                  onValueChange={setSelectedCalendarId}
                >
                  <SelectTrigger id="calendar">
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendars?.map((calendar: any) => (
                      <SelectItem key={calendar.id} value={calendar.id.toString()}>
                        {calendar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {calendars?.length || 0} calendars available
                </p>
              </div>

              {/* Current Mapping Status */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Current Mapping:</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <span>
                      Appointment Type: {
                        selectedCourse.acuityAppointmentTypeId 
                          ? appointmentTypes?.find((t: any) => t.id === selectedCourse.acuityAppointmentTypeId)?.name || "Unknown"
                          : "Not configured"
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <span>
                      Calendar: {
                        selectedCourse.acuityCalendarId 
                          ? calendars?.find((c: any) => c.id === selectedCourse.acuityCalendarId)?.name || "Unknown"
                          : "Not configured"
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button 
                onClick={handleSave} 
                disabled={updateMappingMutation.isPending}
                className="w-full"
              >
                {updateMappingMutation.isPending ? "Saving..." : "Save Mapping"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Courses Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            Overview of Acuity mapping status for all courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courses?.map((course) => (
              <div 
                key={course.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleCourseSelect(course.id.toString())}
              >
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-xs text-muted-foreground">{course.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  {course.acuityAppointmentTypeId && course.acuityCalendarId ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">Configured</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">Not configured</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
