import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, Clock } from "lucide-react";

export function NotificationSettings() {
  const { data: preferences, isLoading } = trpc.parentProfile.getNotificationPreferences.useQuery();
  const updateMutation = trpc.parentProfile.updateNotificationPreferences.useMutation();

  const [localPrefs, setLocalPrefs] = useState(preferences);

  // Update local state when data loads
  if (preferences && !localPrefs) {
    setLocalPrefs(preferences);
  }

  const handleSave = async () => {
    if (!localPrefs) return;

    try {
      await updateMutation.mutateAsync({
        emailEnabled: localPrefs.emailEnabled,
        inAppEnabled: localPrefs.inAppEnabled,
        smsEnabled: localPrefs.smsEnabled,
        timing24h: localPrefs.timing24h,
        timing1h: localPrefs.timing1h,
        timing15min: localPrefs.timing15min,
      });
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  if (isLoading || !localPrefs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Choose how and when you want to receive session reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Channels
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="in-app" className="cursor-pointer">
                  In-App Notifications
                </Label>
              </div>
              <Switch
                id="in-app"
                checked={localPrefs.inAppEnabled}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, inAppEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="email" className="cursor-pointer">
                  Email Notifications
                </Label>
              </div>
              <Switch
                id="email"
                checked={localPrefs.emailEnabled}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, emailEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="sms" className="cursor-pointer">
                  SMS Notifications
                </Label>
              </div>
              <Switch
                id="sms"
                checked={localPrefs.smsEnabled}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, smsEnabled: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Notification Timing */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reminder Timing
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="timing-24h" className="cursor-pointer">
                24 hours before session
              </Label>
              <Switch
                id="timing-24h"
                checked={localPrefs.timing24h}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, timing24h: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="timing-1h" className="cursor-pointer">
                1 hour before session
              </Label>
              <Switch
                id="timing-1h"
                checked={localPrefs.timing1h}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, timing1h: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="timing-15min" className="cursor-pointer">
                15 minutes before session
              </Label>
              <Switch
                id="timing-15min"
                checked={localPrefs.timing15min}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, timing15min: checked })
                }
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="w-full"
        >
          {updateMutation.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
