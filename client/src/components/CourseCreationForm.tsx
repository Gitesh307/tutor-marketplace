import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CourseCreationFormProps {
  onSuccess?: () => void;
  editingCourse?: any;
}

export function CourseCreationForm({ onSuccess, editingCourse }: CourseCreationFormProps) {
  const [formData, setFormData] = useState({
    title: editingCourse?.title || "",
    description: editingCourse?.description || "",
    subject: editingCourse?.subject || undefined,
    gradeLevel: editingCourse?.gradeLevel || undefined,
    price: editingCourse?.price?.toString() || "",
    duration: editingCourse?.duration?.toString() || "",
    sessionsPerWeek: editingCourse?.sessionsPerWeek?.toString() || "1",
    totalSessions: editingCourse?.totalSessions?.toString() || "",
    imageUrl: editingCourse?.imageUrl || "",
    curriculum: editingCourse?.curriculum || "",
  });

  const createMutation = trpc.adminCourses.createCourse.useMutation({
    onSuccess: () => {
      toast.success("Course created successfully!");
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create course: ${error.message}`);
    },
  });

  const updateMutation = trpc.adminCourses.updateCourse.useMutation({
    onSuccess: () => {
      toast.success("Course updated successfully!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update course: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subject: undefined,
      gradeLevel: undefined,
      price: "",
      duration: "",
      sessionsPerWeek: "1",
      totalSessions: "",
      imageUrl: "",
      curriculum: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", formData);

    // Validate required fields
    if (!formData.title || !formData.subject || !formData.price) {
      console.log("Validation failed", { title: formData.title, subject: formData.subject, price: formData.price });
      toast.error("Please fill in all required fields (Title, Subject, Price)");
      return;
    }

    const courseData = {
      ...formData,
      subject: formData.subject!, // Ensure subject is always a string
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      sessionsPerWeek: parseInt(formData.sessionsPerWeek),
      totalSessions: formData.totalSessions ? parseInt(formData.totalSessions) : undefined,
    };

    console.log("Course data to submit:", courseData);

    if (editingCourse) {
      console.log("Updating course", editingCourse.id);
      updateMutation.mutate({
        id: editingCourse.id,
        ...courseData,
      });
    } else {
      console.log("Creating new course");
      createMutation.mutate(courseData);
    }
  };

  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Foreign Language",
    "Computer Science",
    "Art",
    "Music",
    "Test Prep",
    "Other",
  ];

  const gradeLevels = [
    "Elementary (K-5)",
    "Middle School (6-8)",
    "High School (9-12)",
    "College",
    "Adult",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCourse ? "Edit Course" : "Create New Course"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., SAT Math Prep"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Select
                value={formData.gradeLevel}
                onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="99.99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionsPerWeek">Sessions Per Week</Label>
              <Input
                id="sessionsPerWeek"
                type="number"
                value={formData.sessionsPerWeek}
                onChange={(e) => setFormData({ ...formData, sessionsPerWeek: e.target.value })}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSessions">Total Sessions</Label>
              <Input
                id="totalSessions"
                type="number"
                value={formData.totalSessions}
                onChange={(e) => setFormData({ ...formData, totalSessions: e.target.value })}
                placeholder="12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="curriculum">Curriculum</Label>
            <Textarea
              id="curriculum"
              value={formData.curriculum}
              onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
              placeholder="Detailed curriculum outline..."
              rows={5}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingCourse ? "Update Course" : "Create Course"}
            </Button>
            {!editingCourse && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
