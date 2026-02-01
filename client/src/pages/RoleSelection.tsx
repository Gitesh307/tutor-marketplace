import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Users, GraduationCap } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { toast } from "sonner";

export default function RoleSelection() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const updateRoleMutation = trpc.auth.updateRole.useMutation({
    onSuccess: async () => {
      // Invalidate auth cache to force refetch
      await utils.auth.me.invalidate();
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user?.role === "tutor") {
      setLocation("/tutor/dashboard");
    } else if (user?.role === "parent") {
      setLocation("/parent/dashboard");
    }
  }, [user, setLocation]);

  const handleSelectRole = async (role: "parent" | "tutor") => {
    try {
      await updateRoleMutation.mutateAsync({ role });
      // Invalidate and refetch auth data
      await utils.auth.me.invalidate();
      await utils.auth.me.refetch();
      
      toast.success(`Account updated to ${role}`);
      
      // Navigate without full reload to preserve auth state
      setLocation(role === "tutor" ? "/tutor/dashboard" : "/parent/dashboard");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to EdKonnect Academy!</h1>
            <p className="text-lg text-muted-foreground">
              Please select your role to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-elegant cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">I'm a Parent</CardTitle>
                <CardDescription className="text-base">
                  Find qualified tutors for your child
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Browse and search for tutors by subject and grade level</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Subscribe to courses and schedule one-on-one sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Track your child's progress and communicate with tutors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Manage subscriptions and view session history</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleSelectRole("parent")}
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? "Setting up..." : "Continue as Parent"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-elegant cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <GraduationCap className="w-10 h-10 text-accent" />
                </div>
                <CardTitle className="text-2xl">I'm a Tutor</CardTitle>
                <CardDescription className="text-base">
                  Share your expertise and teach students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Create your professional tutor profile and showcase qualifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Design and offer tutoring courses and packages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Manage your schedule and track student sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Earn income and view earnings dashboard</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  size="lg"
                  variant="outline"
                  onClick={() => handleSelectRole("tutor")}
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? "Setting up..." : "Continue as Tutor"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
