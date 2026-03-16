import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, FolderOpen, Save, Shield, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock applications data
const availableApplications = [
  { id: "salesforce", name: "Salesforce CRM", category: "CRM", icon: "💼" },
  { id: "jira", name: "Jira", category: "Project Management", icon: "📋" },
  { id: "slack", name: "Slack Enterprise", category: "Communication", icon: "💬" },
  { id: "tableau", name: "Tableau", category: "Analytics", icon: "📊" },
  { id: "github", name: "GitHub Enterprise", category: "Development", icon: "🐙" },
  { id: "confluence", name: "Confluence", category: "Documentation", icon: "📝" },
  { id: "okta", name: "Okta", category: "Identity", icon: "🔐" },
  { id: "zoom", name: "Zoom", category: "Communication", icon: "📹" },
];

type BlueprintApp = {
  id: string;
  name: string;
  category: string;
  icon: string;
  accessLevel: string;
  grantedDate: string;
  essential: boolean;
};

export const NewRolePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedAppId, setSelectedAppId] = useState("");
  const [blueprintApps, setBlueprintApps] = useState<BlueprintApp[]>([
    { id: "salesforce", name: "Salesforce CRM", category: "CRM", icon: "💼", accessLevel: "Full Access", grantedDate: "2023-06-15", essential: false },
    { id: "jira", name: "Jira", category: "Project Management", icon: "📋", accessLevel: "Standard", grantedDate: "2023-08-20", essential: true },
    { id: "slack", name: "Slack Enterprise", category: "Communication", icon: "💬", accessLevel: "Full Access", grantedDate: "2023-01-10", essential: true },
    { id: "tableau", name: "Tableau", category: "Analytics", icon: "📊", accessLevel: "Read Only", grantedDate: "2023-11-05", essential: false },
    { id: "github", name: "GitHub Enterprise", category: "Development", icon: "🐙", accessLevel: "Contributor", grantedDate: "2023-03-22", essential: true },
    { id: "confluence", name: "Confluence", category: "Documentation", icon: "📝", accessLevel: "Standard", grantedDate: "2023-04-18", essential: false },
  ]);

  const handleAddApp = () => {
    if (!selectedAppId) return;
    const app = availableApplications.find((a) => a.id === selectedAppId);
    if (!app || blueprintApps.find((a) => a.id === app.id)) return;
    setBlueprintApps((prev) => [
      ...prev,
      {
        ...app,
        accessLevel: "Standard",
        grantedDate: new Date().toISOString().split("T")[0],
        essential: false,
      },
    ]);
    setSelectedAppId("");
  };

  const handleRemoveApp = (id: string) => {
    const app = blueprintApps.find((a) => a.id === id);
    if (app?.essential) return;
    setBlueprintApps((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    if (blueprintApps.length === 0) {
      toast({
        title: "Error",
        description: "At least one application must be added",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Role Created",
      description: `Role "${roleName}" has been created with ${blueprintApps.length} applications.`,
    });

    navigate("/roles/manage");
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create New Blueprint</h1>
            <p className="text-muted-foreground mt-1">
              Add applications to your new Blueprint
            </p>
          </div>
        </div>
      </div>

      {/* Role Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Blueprint Details
          </CardTitle>
          <CardDescription>Assign HR job role to new Blueprint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="roleName">Blueprint Name *</Label>
              <Input
                id="roleName"
                placeholder="e.g., Content Manager"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>HR Job Role</Label>
              <div className="h-10 px-3 rounded-lg border bg-muted/50 flex items-center">
                <Badge variant="secondary">{blueprintApps.length} applications</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleDescription">Description</Label>
            <Textarea
              id="roleDescription"
              placeholder="Describe the purpose of this Blueprint"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Add Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Select Application</Label>
            <div className="flex gap-2">
              <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose an application..." />
                </SelectTrigger>
                <SelectContent>
                  {availableApplications
                    .filter((app) => !blueprintApps.find((a) => a.id === app.id))
                    .map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        <span className="flex items-center gap-2">
                          <span>{app.icon}</span>
                          <span>{app.name}</span>
                          <span className="text-muted-foreground text-xs">— {app.category}</span>
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddApp} disabled={!selectedAppId}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blueprint Application List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Blueprint Application List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blueprintApps.map((app) => (
              <div
                key={app.id}
                className="relative rounded-xl border border-border bg-card p-5 space-y-3 transition-shadow hover:shadow-md"
              >
                {/* Remove button */}
                <div className="absolute top-3 right-3">
                  {app.essential ? (
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <button
                      onClick={() => handleRemoveApp(app.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* App info */}
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{app.icon}</div>
                  <div>
                    <p className="font-semibold text-sm">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{app.category}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Access Level:</span>
                    <Badge variant="outline" className="text-xs font-medium">
                      {app.accessLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Granted:</span>
                    <span className="text-xs">{app.grantedDate}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="pt-1">
                  {app.essential ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full py-1.5 px-3">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Essential — Cannot Remove
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 border border-green-200 bg-green-50 rounded-full py-1.5 px-3">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active Access
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Role Button at bottom */}
      <div className="flex justify-end">
        <Button onClick={handleSaveRole} className="gap-2 bg-green-600 text-white hover:bg-green-700">
          <Save className="h-4 w-4" />
          Build Blueprint
        </Button>
      </div>
    </motion.div>
  );
};
