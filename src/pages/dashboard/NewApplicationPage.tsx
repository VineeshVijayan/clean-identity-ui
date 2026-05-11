import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion } from "framer-motion";
import { AppWindow, Check, ChevronsUpDown, Save, Eraser } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CONNECTED_APPS = [
  { value: "salesforce", label: "Salesforce" },
  { value: "slack", label: "Slack" },
  { value: "github", label: "GitHub" },
  { value: "jira", label: "Jira" },
  { value: "okta", label: "Okta" },
  { value: "google-workspace", label: "Google Workspace" },
  { value: "microsoft-365", label: "Microsoft 365" },
  { value: "zoom", label: "Zoom" },
];

export const NewApplicationPage = () => {
  const [appName, setAppName] = useState("");
  const [connectedApp, setConnectedApp] = useState("");
  const [essential, setEssential] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    setAppName("");
    setConnectedApp("");
    setEssential(false);
  };

  const handleSave = () => {
    if (!appName.trim()) {
      toast.error("Application Name is required");
      return;
    }
    toast.success("Application saved successfully");
    handleClear();
  };

  const selectedLabel =
    CONNECTED_APPS.find((a) => a.value === connectedApp)?.label ||
    "Select connected application";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <AppWindow className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">New Application</h1>
          <p className="text-muted-foreground">
            Create a new application and configure access
          </p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input
              id="app-name"
              placeholder="Enter application name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Connected Applications</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-12 font-normal"
                >
                  <span
                    className={cn(
                      !connectedApp && "text-muted-foreground"
                    )}
                  >
                    {selectedLabel}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search applications..." />
                  <CommandList>
                    <CommandEmpty>No applications found.</CommandEmpty>
                    <CommandGroup>
                      {CONNECTED_APPS.map((app) => (
                        <CommandItem
                          key={app.value}
                          value={app.label}
                          onSelect={() => {
                            setConnectedApp(
                              app.value === connectedApp ? "" : app.value
                            );
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              connectedApp === app.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {app.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="essential" className="text-base">
                Essential
              </Label>
              <Switch
                id="essential"
                checked={essential}
                onCheckedChange={setEssential}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This application will be added to the Essential Blueprint granting
              access to all new accounts.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleClear}>
              <Eraser className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Application
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
