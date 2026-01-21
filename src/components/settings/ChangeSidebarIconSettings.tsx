import { useState } from "react";
import {
  Home,
  Users,
  Shield,
  Settings,
  FileText,
  Database,
  Key,
  BarChart3,
  Briefcase,
  Globe,
  Lock,
  UserCog,
  Folder,
  Bell,
  Mail,
  Calendar,
  CheckSquare,
  Layers,
  Zap,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";

// Available icons for sidebar items
const availableIcons = [
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
  { name: "CheckSquare", icon: CheckSquare },
  { name: "Layers", icon: Layers },
  { name: "Zap", icon: Zap },
  { name: "Heart", icon: Heart },
];

// Sidebar menu items that can be customized
const sidebarItems = [
  { id: "dashboard", label: "Dashboard", currentIcon: "Home" },
  { id: "users", label: "User Management", currentIcon: "Users" },
  { id: "roles", label: "Role Management", currentIcon: "Shield" },
  { id: "admin", label: "Admin Settings", currentIcon: "Settings" },
  { id: "reports", label: "Reports", currentIcon: "BarChart3" },
];

export const ChangeSidebarIconSettings = () => {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [iconSelections, setIconSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(sidebarItems.map((item) => [item.id, item.currentIcon]))
  );

  const handleIconChange = (itemId: string, iconName: string) => {
    setIconSelections((prev) => ({
      ...prev,
      [itemId]: iconName,
    }));
  };

  const handleSave = () => {
    toast({
      title: "Icons Updated",
      description: "Sidebar icons have been updated successfully.",
    });
  };

  const handleReset = () => {
    setIconSelections(Object.fromEntries(sidebarItems.map((item) => [item.id, item.currentIcon])));
    toast({
      title: "Icons Reset",
      description: "Sidebar icons have been reset to defaults.",
    });
  };

  const getIconComponent = (iconName: string): LucideIcon => {
    return availableIcons.find((i) => i.name === iconName)?.icon || Home;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Change Sidebar Icons</h3>
        <p className="text-sm text-muted-foreground">
          Customize the icons displayed in the sidebar navigation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Menu Items List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menu Items</CardTitle>
            <CardDescription>Select a menu item to change its icon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = getIconComponent(iconSelections[item.id]);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedItem === item.id
                      ? "bg-primary/10 border-primary border"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedItem === item.id ? "bg-primary/20" : "bg-muted"}`}>
                    <IconComponent className={`h-5 w-5 ${selectedItem === item.id ? "text-primary" : ""}`} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Icon Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Icons</CardTitle>
            <CardDescription>
              {selectedItem
                ? `Choose an icon for "${sidebarItems.find((i) => i.id === selectedItem)?.label}"`
                : "Select a menu item first"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="grid grid-cols-5 gap-2">
                {availableIcons.map((iconItem) => {
                  const IconComp = iconItem.icon;
                  const isSelected = iconSelections[selectedItem] === iconItem.name;
                  return (
                    <button
                      key={iconItem.name}
                      onClick={() => handleIconChange(selectedItem, iconItem.name)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:border-border hover:bg-muted"
                      }`}
                      title={iconItem.name}
                    >
                      <IconComp className={`h-5 w-5 mx-auto ${isSelected ? "text-primary" : ""}`} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a menu item from the left to change its icon
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>How your sidebar will look with the new icons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-sidebar rounded-lg p-4 max-w-xs">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const IconComponent = getIconComponent(iconSelections[item.id]);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};
