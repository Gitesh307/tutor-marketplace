import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGIN_PATH } from "@/const";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Computer Science",
  "Spanish",
  "French",
  "Art",
  "Music",
];

const GRADE_LEVELS = [
  "Elementary School",
  "Middle School",
  "High School",
  "College",
  "Adult Education",
];

export default function TutorRegistration() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    qualifications: "",
    yearsOfExperience: "",
    hourlyRate: "",
    subjects: [] as string[],
    gradeLevels: [] as string[],
    acuityLink: "",
  });

  const registerMutation = trpc.tutorProfile.register.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Registration submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit registration");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to submit your tutor application.");
      navigate(LOGIN_PATH);
      return;
    }

    // Validation
    if (!formData.name || !formData.email || !formData.bio || !formData.qualifications) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    if (formData.gradeLevels.length === 0) {
      toast.error("Please select at least one grade level");
      return;
    }

    const experience = parseInt(formData.yearsOfExperience);
    if (isNaN(experience) || experience < 0) {
      toast.error("Please enter a valid years of experience");
      return;
    }

    const rate = parseFloat(formData.hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Please enter a valid hourly rate");
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      bio: formData.bio,
      qualifications: formData.qualifications,
      yearsOfExperience: experience,
      hourlyRate: rate,
      subjects: formData.subjects,
      gradeLevels: formData.gradeLevels,
      acuityLink: formData.acuityLink || undefined,
    });
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const toggleGradeLevel = (level: string) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: prev.gradeLevels.includes(level)
        ? prev.gradeLevels.filter(l => l !== level)
        : [...prev.gradeLevels, level]
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest in joining our tutoring platform. Your application is under review.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm text-left mb-6">
                <p className="font-medium">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Our team will review your application</li>
                  <li>You'll receive an email notification with the decision</li>
                  <li>If approved, you can start creating your profile and accepting students</li>
                </ul>
              </div>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <div className="flex-1 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Become a Tutor</h1>
              <p className="text-lg text-muted-foreground">
                Join our community of expert educators and help students achieve their learning goals.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Tutor Registration</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill out the form below to apply as a tutor. All fields marked with * are required.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Personal Information</h3>
                    
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium">
                          Email Address *
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Professional Information</h3>

                    <div className="space-y-2">
                      <label htmlFor="bio" className="block text-sm font-medium">
                        About You *
                      </label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about your teaching philosophy, experience, and what makes you a great tutor..."
                        rows={4}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="qualifications" className="block text-sm font-medium">
                        Qualifications & Education *
                      </label>
                      <textarea
                        id="qualifications"
                        value={formData.qualifications}
                        onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                        placeholder="List your degrees, certifications, and relevant qualifications..."
                        rows={3}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="experience" className="block text-sm font-medium">
                          Years of Experience *
                        </label>
                        <input
                          id="experience"
                          type="number"
                          min="0"
                          value={formData.yearsOfExperience}
                          onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                          placeholder="5"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="rate" className="block text-sm font-medium">
                          Hourly Rate (USD) *
                        </label>
                        <input
                          id="rate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                          placeholder="50.00"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="acuityLink" className="block text-sm font-medium">
                        Acuity Scheduling Link (Optional)
                      </label>
                      <input
                        id="acuityLink"
                        type="url"
                        value={formData.acuityLink}
                        onChange={(e) => setFormData({ ...formData, acuityLink: e.target.value })}
                        placeholder="https://app.acuityscheduling.com/schedule.php?owner=..."
                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground">
                        If you use Acuity Scheduling, paste your scheduling link here to display your real-time availability to parents.
                      </p>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Subjects You Teach *</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {SUBJECTS.map((subject) => (
                        <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.subjects.includes(subject)}
                            onChange={() => toggleSubject(subject)}
                            className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                          />
                          <span className="text-sm">{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Grade Levels */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Grade Levels *</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {GRADE_LEVELS.map((level) => (
                        <label key={level} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.gradeLevels.includes(level)}
                            onChange={() => toggleGradeLevel(level)}
                            className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                          />
                          <span className="text-sm">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium flex items-center justify-center"
                    >
                      {registerMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Application
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="px-4 py-2 border border-input rounded-md hover:bg-accent"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
