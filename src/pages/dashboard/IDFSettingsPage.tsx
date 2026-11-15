import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Palette,
  Menu,
  Shield,
  Save,
  RotateCcw,
  SlidersHorizontal,
  Users,
  UserCheck,
  AppWindow,
  Bell,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangeSidebarIconSettings } from "@/components/settings/ChangeSidebarIconSettings";
import { ChangeButtonColorSettings } from "@/components/settings/ChangeButtonColorSettings";
import { ManageRolesSettings } from "@/components/settings/ManageRolesSettings";
import { PlatformCategorySettings } from "@/components/settings/PlatformCategorySettings";
import { useToast } from "@/hooks/use-toast";
import { useSettings, isSettingEnabled } from "@/context/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getErrorFromCatch } from "@/lib/api-errors";
import {
  appearanceButtonColorsJson,
  parseButtonColors,
  SETTING_KEYS,
  settingJson,
  writeLocalButtonConfigs,
} from "@/lib/platform-settings";
import { saveUiSettings } from "@/services/settings-api";
import { ManageSecurity } from "@/components/settings/ManageSecurity";
import { getUserRoles } from "@/services/jwt-service";

export const IDFSettingsPage = () => {
  const { settings, setSettings, fetchSettings } = useSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sidebar-icons");
  const [saving, setSaving] = useState(false);
  const isSuperAdmin = getUserRoles().some((role) => role?.toLowerCase() === "super_admin");

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const colors = appearanceButtonColorsJson(settings);
      await saveUiSettings({
        SHOW_COMPANY_MENU: String(isSettingEnabled(settings.SHOW_COMPANY_MENU, true)),
        [SETTING_KEYS.sidebarIcons]: settingJson(settings?.[SETTING_KEYS.sidebarIcons]),
        [SETTING_KEYS.buttonColors]: colors,
      });
      writeLocalButtonConfigs(parseButtonColors({ [SETTING_KEYS.buttonColors]: colors }));
      window.dispatchEvent(new Event("buttonStyleChanged"));
      await fetchSettings?.();
      toast({
        title: "Settings Saved",
        description: "Sidebar icons and button colors have been saved.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorFromCatch(err, "Failed to save settings"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            IDF Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize the Identity Framework appearance, platform behavior, and security
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset All
          </Button>
          <Button onClick={handleSaveAll} className="gap-2" disabled={saving}>
            <Save className="h-4 w-4" />
            Save All
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent flex-wrap">
                <TabsTrigger
                  value="sidebar-icons"
                  className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                >
                  <Menu className="h-4 w-4" />
                  Sidebar Icons
                </TabsTrigger>
                <TabsTrigger
                  value="button-colors"
                  className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                >
                  <Palette className="h-4 w-4" />
                  Button Colors
                </TabsTrigger>
                {isSuperAdmin && (
                  <>
                    {
                      <TabsTrigger
                        value="notifications"
                        className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                      </TabsTrigger>
                    }
                    {/* <TabsTrigger
                      value="general"
                      className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      General
                    </TabsTrigger>
                    <TabsTrigger
                      value="user-management"
                      className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Users
                    </TabsTrigger>
                    <TabsTrigger
                      value="lifecycle"
                      className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      Lifecycle
                    </TabsTrigger>
                    <TabsTrigger
                      value="applications"
                      className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                    >
                      <AppWindow className="h-4 w-4" />
                      Applications
                    </TabsTrigger>
                    <TabsTrigger
                      value="notifications"
                      className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger
                      value="audit"
                      className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                    >
                      <ScrollText className="h-4 w-4" />
                      Audit
                    </TabsTrigger> */}
                  </>
                )}
                <TabsTrigger
                  value="manage-roles"
                  className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Manage Roles
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="sidebar-icons" className="p-6 mt-0">
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <Label className="text-base font-medium">
                    Show Company Menu
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable Company sidebar menu
                  </p>
                </div>

                <Switch
                  checked={isSettingEnabled(settings?.SHOW_COMPANY_MENU, true)}
                  onCheckedChange={(value) =>
                    setSettings((prev: any) => ({
                      ...prev,
                      SHOW_COMPANY_MENU: value,
                    }))
                  }
                />
              </div>
              <br></br>
              <ChangeSidebarIconSettings />
            </TabsContent>

            <TabsContent value="button-colors" className="p-6 mt-0">
              <ChangeButtonColorSettings />
            </TabsContent>

            {isSuperAdmin && (
              <>
                <TabsContent value="general" className="p-6 mt-0">
                  <PlatformCategorySettings category="GENERAL" />
                </TabsContent>
                <TabsContent value="user-management" className="p-6 mt-0">
                  <PlatformCategorySettings category="USER_MANAGEMENT" />
                </TabsContent>
                <TabsContent value="lifecycle" className="p-6 mt-0">
                  <PlatformCategorySettings category="USER_LIFECYCLE" />
                </TabsContent>
                <TabsContent value="applications" className="p-6 mt-0">
                  <PlatformCategorySettings category="APPLICATIONS" />
                </TabsContent>
                <TabsContent value="notifications" className="p-6 mt-0">
                  <PlatformCategorySettings category="NOTIFICATIONS" />
                </TabsContent>
                <TabsContent value="audit" className="p-6 mt-0">
                  <PlatformCategorySettings category="AUDIT" />
                </TabsContent>
              </>
            )}

            <TabsContent value="manage-roles" className="p-6 mt-0">
              <ManageRolesSettings />
            </TabsContent>
            <TabsContent value="security" className="p-6 mt-0">
              <ManageSecurity />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};
