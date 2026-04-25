import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Palette,
  Menu,
  Shield,
  Save,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangeSidebarIconSettings } from "@/components/settings/ChangeSidebarIconSettings";
import { ChangeButtonColorSettings } from "@/components/settings/ChangeButtonColorSettings";
import { ManageRolesSettings } from "@/components/settings/ManageRolesSettings";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/context/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const IDFSettingsPage = () => {
  const API_BASE_URL = "https://identity-api.ndashdigital.com/api";
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sidebar-icons");


  const handleSaveAll = async () => {
    const token = localStorage.getItem("auth-token");
    await fetch(`${API_BASE_URL}/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        SHOW_COMPANY_MENU: String(settings.SHOW_COMPANY_MENU),
      }),
    });

    toast({
      title: "Settings Saved",
      description: "All IDF settings have been saved successfully.",
    });
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            IDF Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize the Identity Framework appearance and behavior
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset All
          </Button>
          <Button onClick={handleSaveAll} className="gap-2">
            <Save className="h-4 w-4" />
            Save All
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
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
                <TabsTrigger
                  value="manage-roles"
                  className="data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Manage Roles
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="sidebar-icons" className="p-6 mt-0">
              {/* 👇 NEW TOGGLE */}
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
                  checked={settings?.SHOW_COMPANY_MENU || false}
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

            <TabsContent value="manage-roles" className="p-6 mt-0">
              <ManageRolesSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};
