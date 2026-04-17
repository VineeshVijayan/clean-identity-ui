import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CheckCircle2, FolderOpen, Save, Shield, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Mock applications data
const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

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
  const [jobOptions, setJobOptions] = useState<{ label: string; value: string }[]>([]);
  const [blueprintApps, setBlueprintApps] = useState<BlueprintApp[]>([]);

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

  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const toggleJob = (value: string) => {
    setSelectedJobs((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleRemoveApp = (id: string) => {
    const app = blueprintApps.find((a) => a.id === id);
    if (app?.essential) return;
    setBlueprintApps((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      toast({
        title: "Error",
        description: "Blueprint name is required",
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

    try {
      const token = localStorage.getItem("auth-token");

      const payload = {
        name: roleName,
        jobTitleIds: selectedJobs.map((id) => Number(id)), // ✅ convert to Long
        applicationIds: blueprintApps.map((app) => Number(app.id)), // ✅ convert to Long
      };

      const res = await fetch(`${API_BASE_URL}/blueprints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create blueprint");

      toast({
        title: "Success",
        description: "Blueprint created successfully",
      });

      navigate("/roles/manage");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create blueprint",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        const response = await fetch(`${API_BASE_URL}/job-titles`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch job titles");
        }
  
        const result = await response.json();
  
        const formatted = result.data.map((job: any) => ({
          label: job.name,
          value: job.id,
        }));
  
        setJobOptions(formatted);
      } catch (error) {
        console.error("Failed to fetch job titles", error);
      }
    };
  
    fetchJobTitles();
  }, []);

  const [availableApplications, setAvailableAppsToAdd] = useState<any[]>([]);
  /* FETCH APPS */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(`${API_BASE_URL}/applications`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch applications");

        const response = await res.json();

        const appsArray = Array.isArray(response)
          ? response
          : response.data.content || [];

        const mappedApps = appsArray.map((app: any) => ({
          id: app.id || app.appId,
          name: app.name || app.appName,
          category: app.category || "General",
          icon: app.icon || "📦", // fallback icon
        }));

        setAvailableAppsToAdd(mappedApps);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load applications",
          variant: "destructive",
        });
      }
    };

    fetchApplications();
  }, [toast]);

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
          <CardDescription>Assign job role to new Blueprint</CardDescription>
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
              <Label>Job Titles</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10 px-3 bg-muted/50"
                  >
                    {selectedJobs.length > 0
                      ? `${selectedJobs.length} selected`
                      : "Select job roles"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search job roles..." />
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup>
                      {jobOptions.map((job) => {
                        const isSelected = selectedJobs.includes(job.value);

                        return (
                          <CommandItem
                            key={job.value}
                            onSelect={() => toggleJob(job.value)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"
                                }`}
                            />
                            {job.label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedJobs.map((value) => {
                  const job = jobOptions.find((j) => j.value === value);
                  return (
                    <Badge key={value} variant="secondary">
                      {job?.label}
                      <button
                        className="ml-2"
                        onClick={() => toggleJob(value)}
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
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
            {blueprintApps.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-10">
                No applications available for selected blueprint
              </div>
            ) : (
              blueprintApps.map((app) => (
                <div
                  key={app.id}
                  className="relative rounded-xl border border-border bg-card p-5 space-y-3 transition-shadow hover:shadow-md"
                >
                  {/* Remove / Essential icon */}
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
              ))
            )}
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
