import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Database,
  Cloud,
  Key,
  Settings,
  Edit,
  Trash2,
  MoreHorizontal,
  Power,
  PowerOff,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Mock auth sources data
const mockAuthSources = [
  {
    id: 1,
    name: "Active Directory",
    type: "LDAP",
    icon: Database,
    status: "active",
    users: 1250,
    lastSync: "2024-01-19 08:30",
    priority: 1,
    description: "Corporate Active Directory",
  },
  {
    id: 2,
    name: "Azure AD",
    type: "OAuth 2.0",
    icon: Cloud,
    status: "active",
    users: 850,
    lastSync: "2024-01-19 09:15",
    priority: 2,
    description: "Microsoft Azure Active Directory",
  },
  {
    id: 3,
    name: "Okta",
    type: "SAML 2.0",
    icon: Key,
    status: "inactive",
    users: 0,
    lastSync: "2024-01-15 14:22",
    priority: 3,
    description: "Okta Identity Provider",
  },
  {
    id: 4,
    name: "Google Workspace",
    type: "OAuth 2.0",
    icon: Cloud,
    status: "active",
    users: 320,
    lastSync: "2024-01-19 07:45",
    priority: 4,
    description: "Google Workspace SSO",
  },
  {
    id: 5,
    name: "Local Database",
    type: "Database",
    icon: Database,
    status: "active",
    users: 180,
    lastSync: "N/A",
    priority: 5,
    description: "Local user database",
  },
];

const authTypes = [
  { value: "ldap", label: "LDAP / Active Directory" },
  { value: "oauth", label: "OAuth 2.0" },
  { value: "saml", label: "SAML 2.0" },
  { value: "database", label: "Database" },
  { value: "radius", label: "RADIUS" },
];

export const AuthSourcesPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [authSources, setAuthSources] = useState(mockAuthSources);

  const filteredSources = authSources.filter(
    (source) =>
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSource = (id: number) => {
    setAuthSources((prev) =>
      prev.map((source) =>
        source.id === id
          ? { ...source, status: source.status === "active" ? "inactive" : "active" }
          : source
      )
    );
    const source = authSources.find((s) => s.id === id);
    toast({
      title: source?.status === "active" ? "Source Disabled" : "Source Enabled",
      description: `${source?.name} has been ${source?.status === "active" ? "disabled" : "enabled"}.`,
    });
  };

  const handleSync = (source: typeof mockAuthSources[0]) => {
    toast({
      title: "Sync Started",
      description: `Synchronizing users from ${source.name}...`,
    });
  };

  const handleAddSource = () => {
    toast({
      title: "Source Added",
      description: "New authentication source has been configured.",
    });
    setIsDialogOpen(false);
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
          <h1 className="text-2xl sm:text-3xl font-bold">Authoritative Sources</h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage identity providers and authentication sources
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Authentication Source</DialogTitle>
              <DialogDescription>
                Configure a new identity provider or authentication source
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sourceName">Source Name</Label>
                <Input id="sourceName" placeholder="e.g., Corporate LDAP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceType">Authentication Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {authTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serverUrl">Server URL</Label>
                <Input id="serverUrl" placeholder="e.g., ldap://ldap.company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority (Lower = Higher Priority)</Label>
                <Input id="priority" type="number" placeholder="1" min="1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSource}>Add Source</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold">{authSources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Power className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sources</p>
                <p className="text-2xl font-bold">
                  {authSources.filter((s) => s.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <PowerOff className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive Sources</p>
                <p className="text-2xl font-bold">
                  {authSources.filter((s) => s.status === "inactive").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Key className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {authSources.reduce((sum, s) => sum + s.users, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources List */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Sources</CardTitle>
          <CardDescription>
            Manage identity providers in order of authentication priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredSources.map((source) => {
              const SourceIcon = source.icon;
              return (
                <div
                  key={source.id}
                  className={`p-4 rounded-lg border ${
                    source.status === "active"
                      ? "bg-card border-border"
                      : "bg-muted/30 border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          source.status === "active" ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <SourceIcon
                          className={`h-6 w-6 ${
                            source.status === "active" ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{source.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            Priority {source.priority}
                          </Badge>
                          {source.status === "active" ? (
                            <Badge className="bg-success/10 text-success border-success/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Type: {source.type}</span>
                          <span>•</span>
                          <span>{source.users} users</span>
                          <span>•</span>
                          <span>Last sync: {source.lastSync}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={source.status === "active"}
                        onCheckedChange={() => handleToggleSource(source.id)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleSync(source)}
                          >
                            <RefreshCw className="h-4 w-4" />
                            Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Settings className="h-4 w-4" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
