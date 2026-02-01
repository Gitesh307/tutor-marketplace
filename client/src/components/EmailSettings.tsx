import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RefreshCw, Eye, Save } from "lucide-react";

export function EmailSettings() {
  const utils = trpc.useUtils();

  // Fetch current settings
  const { data: settings, isLoading } = trpc.admin.getEmailSettings.useQuery();
  const updateMutation = trpc.admin.updateEmailSettings.useMutation({
    onSuccess: () => {
      toast.success("Email template settings have been updated successfully.");
      utils.admin.getEmailSettings.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  // Form state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#667eea");
  const [accentColor, setAccentColor] = useState("#764ba2");
  const [footerText, setFooterText] = useState("EdKonnect Academy - Connecting Students with Expert Tutors");
  const [companyName, setCompanyName] = useState("EdKonnect Academy");
  const [supportEmail, setSupportEmail] = useState<string | null>("support@edkonnect.com");
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setLogoUrl(settings.logoUrl);
      setPrimaryColor(settings.primaryColor);
      setAccentColor(settings.accentColor);
      setFooterText(settings.footerText);
      setCompanyName(settings.companyName);
      setSupportEmail(settings.supportEmail);
    }
  }, [settings]);

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB");
      return;
    }

    try {
      setUploading(true);
      
      // Read file as buffer
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Upload to S3
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `email-logos/logo-${timestamp}-${randomSuffix}.${file.name.split('.').pop()}`;
      
      // Note: storagePut is a server-side function, we need to use an API endpoint
      // For now, we'll use a data URL as a workaround
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLogoUrl(dataUrl);
        toast.success("Logo has been uploaded successfully. Click Save to apply changes.");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle save
  const handleSave = () => {
    updateMutation.mutate({
      logoUrl: logoUrl || null,
      primaryColor,
      accentColor,
      footerText,
      companyName,
      supportEmail: supportEmail || undefined,
    });
  };

  // Handle reset to defaults
  const handleReset = () => {
    setLogoUrl(null);
    setPrimaryColor("#667eea");
    setAccentColor("#764ba2");
    setFooterText("EdKonnect Academy - Connecting Students with Expert Tutors");
    setCompanyName("EdKonnect Academy");
    setSupportEmail("support@edkonnect.com");
    toast.success("Form has been reset. Click Save to apply changes.");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  // Email preview component
  const EmailPreview = () => (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f9fafb",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            padding: "30px 20px",
            textAlign: "center",
          }}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              style={{
                maxWidth: "150px",
                maxHeight: "60px",
                marginBottom: "15px",
              }}
            />
          )}
          <h1 style={{ color: "white", margin: 0, fontSize: "24px" }}>
            {companyName}
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: "30px 20px" }}>
          <h2 style={{ color: "#1f2937", marginTop: 0 }}>
            Session Confirmation
          </h2>
          <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
            Dear Parent,
          </p>
          <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
            Your tutoring session has been successfully scheduled. Here are the details:
          </p>

          {/* Details Box */}
          <div
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: "6px",
              padding: "20px",
              margin: "20px 0",
            }}
          >
            <p style={{ margin: "8px 0", color: "#374151" }}>
              <strong>Course:</strong> Mathematics - Algebra I
            </p>
            <p style={{ margin: "8px 0", color: "#374151" }}>
              <strong>Tutor:</strong> John Smith
            </p>
            <p style={{ margin: "8px 0", color: "#374151" }}>
              <strong>Date & Time:</strong> January 20, 2026 at 3:00 PM
            </p>
            <p style={{ margin: "8px 0", color: "#374151" }}>
              <strong>Duration:</strong> 60 minutes
            </p>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: "center", margin: "30px 0" }}>
            <a
              href="#"
              style={{
                display: "inline-block",
                backgroundColor: primaryColor,
                color: "white",
                padding: "12px 30px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              View Session Details
            </a>
          </div>

          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>
            If you have any questions, please contact us at{" "}
            <a href={`mailto:${supportEmail}`} style={{ color: accentColor }}>
              {supportEmail}
            </a>
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "20px",
            textAlign: "center",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <p style={{ color: "#6b7280", fontSize: "12px", margin: 0 }}>
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Settings Form */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Email Template Settings</h2>

        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl && (
                <div className="w-32 h-16 border rounded flex items-center justify-center bg-muted">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a logo (max 2MB, PNG/JPG/SVG)
                </p>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="EdKonnect Academy"
            />
          </div>

          {/* Primary Color */}
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Brand Color</Label>
            <div className="flex items-center gap-4">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#667eea"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Used for header background and primary buttons
            </p>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center gap-4">
              <Input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#764ba2"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Used for gradient and accent elements
            </p>
          </div>

          {/* Support Email */}
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={supportEmail || ""}
              onChange={(e) => setSupportEmail(e.target.value || null)}
              placeholder="support@edkonnect.com"
            />
          </div>

          {/* Footer Text */}
          <div className="space-y-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="EdKonnect Academy - Connecting Students with Expert Tutors"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Appears at the bottom of all emails
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </Card>

      {/* Live Preview */}
      {showPreview && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Email Preview</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <EmailPreview />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This is how your booking confirmation emails will appear to parents.
          </p>
        </Card>
      )}
    </div>
  );
}
