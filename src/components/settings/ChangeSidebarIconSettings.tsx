import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  Check,
  Database,
  FileText,
  Folder,
  Globe,
  Heart,
  Home,
  Image,
  Key,
  Layers,
  Lock,
  Mail,
  Settings,
  Shield,
  Upload,
  UserCog,
  Users,
  Zap,
  X,
} from "lucide-react";

/* ---------- Available Icons ---------- */
const availableIcons: { name: string; icon: LucideIcon }[] = [
  { name: "Home", icon: Home },
  { name: "Users", icon: Users },
  { name: "Shield", icon: Shield },
  { name: "Settings", icon: Settings },
  { name: "FileText", icon: FileText },
  { name: "Database", icon: Database },
  { name: "Key", icon: Key },
  { name: "BarChart3", icon: BarChart3 },
  { name: "Briefcase", icon: Briefcase },
  { name: "Globe", icon: Globe },
  { name: "Lock", icon: Lock },
  { name: "UserCog", icon: UserCog },
  { name: "Folder", icon: Folder },
  { name: "Bell", icon: Bell },
  { name: "Mail", icon: Mail },
  { name: "Calendar", icon: Calendar },
  { name: "Layers", icon: Layers },
  { name: "Zap", icon: Zap },
  { name: "Heart", icon: Heart },
];

/* ---------- Sidebar Items ---------- */
const sidebarItems = [
  { id: "dashboard", label: "Dashboard", defaultIcon: "Home" },
  { id: "users", label: "User Management", defaultIcon: "Users" },
  { id: "roles", label: "Role Management", defaultIcon: "Shield" },
  { id: "admin", label: "Admin Settings", defaultIcon: "Settings" },
  { id: "reports", label: "Reports", defaultIcon: "BarChart3" },
];

export const ChangeSidebarIconSettings = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [iconSelections, setIconSelections] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        sidebarItems.map((item) => [item.id, item.defaultIcon])
      )
  );
  
  // Custom logo state
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem("sidebarLogo");
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const getIconComponent = (iconName: string): LucideIcon =>
    availableIcons.find((i) => i.name === iconName)?.icon || Home;

  const handleIconChange = (itemId: string, iconName: string) => {
    setIconSelections((prev) => ({
      ...prev,
      [itemId]: iconName,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image under 2MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadUrl = () => {
    if (logoUrl.trim()) {
      setPreviewLogo(logoUrl.trim());
      toast({
        title: "Image Loaded",
        description: "Preview updated with the provided URL.",
      });
    }
  };

  const handleApplyLogo = () => {
    if (previewLogo) {
      setCustomLogo(previewLogo);
      localStorage.setItem("sidebarLogo", previewLogo);
      // Dispatch custom event to notify sidebar
      window.dispatchEvent(new CustomEvent("sidebarLogoChanged", { detail: previewLogo }));
      toast({
        title: "Logo Applied",
        description: "The sidebar logo has been updated.",
      });
    }
  };

  const handleRemoveLogo = () => {
    setCustomLogo(null);
    setPreviewLogo(null);
    setLogoUrl("");
    localStorage.removeItem("sidebarLogo");
    // Dispatch custom event to notify sidebar
    window.dispatchEvent(new CustomEvent("sidebarLogoChanged", { detail: null }));
    toast({
      title: "Logo Removed",
      description: "The sidebar logo has been reset to default.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Sidebar Icon Updated",
      description: "Your sidebar icon settings have been saved.",
    });
  };

  const handleReset = () => {
    setIconSelections(
      Object.fromEntries(
        sidebarItems.map((item) => [item.id, item.defaultIcon])
      )
    );
    setSelectedItem(null);
    handleRemoveLogo();
    toast({
      title: "Reset Successful",
      description: "Sidebar icons restored to default.",
    });
  };

  const displayLogo = previewLogo || customLogo;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-3">
          <Image className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Change Sidebar Icon</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the sidebar logo and navigation icons
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload / URL */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Custom Logo</CardTitle>
            <CardDescription>
              Upload your organization logo or icon for the sidebar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current/Preview Logo Display */}
            {displayLogo && (
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                <div className="relative">
                  <img
                    src={displayLogo}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain rounded-lg border border-border"
                  />
                  <button
                    onClick={() => setPreviewLogo(null)}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop an image here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Or enter image URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
                <Button variant="outline" onClick={handleLoadUrl}>
                  Load
                </Button>
              </div>
            </div>

            {previewLogo && (
              <div className="flex gap-2">
                <Button onClick={handleApplyLogo} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Apply Logo
                </Button>
              </div>
            )}

            {customLogo && (
              <Button variant="outline" onClick={handleRemoveLogo} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Remove Custom Logo
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Recommended: square image, minimum 64×64 (PNG, JPG, SVG). Max 2MB.
            </p>
          </CardContent>
        </Card>

        {/* Preset Icons */}
        <Card>
          <CardHeader>
            <CardTitle>Preset Icons</CardTitle>
            <CardDescription>
              Choose an icon for each sidebar menu item
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sidebarItems.map((item) => {
              const IconComp = getIconComponent(iconSelections[item.id]);
              const active = selectedItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`relative w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${active
                    ? "border-accent bg-accent/10"
                    : "border-border hover:bg-muted"
                    }`}
                >
                  {active && (
                    <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                      <Check className="h-3 w-3 text-accent-foreground" />
                    </div>
                  )}
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Icon Picker */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Icons</CardTitle>
            <CardDescription>
              {selectedItem
                ? `Choose an icon for "${sidebarItems.find((i) => i.id === selectedItem)?.label
                }"`
                : "Select a menu item to change its icon"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {availableIcons.map((iconItem) => {
                  const IconComp = iconItem.icon;
                  const isSelected =
                    iconSelections[selectedItem] === iconItem.name;

                  return (
                    <button
                      key={iconItem.name}
                      onClick={() =>
                        handleIconChange(selectedItem, iconItem.name)
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border hover:bg-muted"
                        }`}
                      title={iconItem.name}
                    >
                      <IconComp
                        className={`h-5 w-5 mx-auto ${isSelected ? "text-primary" : ""
                          }`}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a menu item to preview and change its icon
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your sidebar will look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-sidebar rounded-lg p-4 max-w-xs border border-sidebar-border">
              {/* Logo Preview */}
              <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-sidebar-border">
                <img
                  src={displayLogo || "/assets/Identity.png"}
                  alt="Sidebar Logo"
                  className="w-8 h-8 object-contain rounded"
                />
                <span className="text-sm font-bold text-sidebar-foreground">
                  Identity<span className="text-primary">Framework</span>
                </span>
              </div>
              <div className="space-y-1">
                {sidebarItems.map((item) => {
                  const IconComp = getIconComponent(iconSelections[item.id]);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent"
                    >
                      <IconComp className="h-5 w-5" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave}>
          Save Changes
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
};
