import { motion } from "framer-motion";
import {
  AppWindow,
  CheckCircle,
  Cloud,
  Database,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

/* ---------------- MOCK DATA ---------------- */
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
];

const authTypes = [
  { value: "ldap", label: "LDAP / Active Directory" },
  { value: "oauth", label: "OAuth 2.0" },
  { value: "saml", label: "SAML 2.0" },
];

/* ---------------- COMPONENT ---------------- */
export const AuthSourcesPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [authSources] = useState(mockAuthSources);

  const filteredSources = authSources.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER — SAME AS ApplicationManagementPage */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <AppWindow className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Authoritative Sources
          </h1>
          <p className="text-muted-foreground">
            Configure and manage authentication providers
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
                Configure a new identity provider
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Source Name</Label>
                <Input placeholder="Corporate LDAP" />
              </div>

              <div className="space-y-2">
                <Label>Authentication Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {authTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Server URL</Label>
                <Input placeholder="ldap://ldap.company.com" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast({ title: "Source Added" });
                  setIsDialogOpen(false);
                }}
              >
                Add Source
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* STATS — SAME STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{authSources.length}</p>
            <p className="text-sm text-muted-foreground">Total Sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {authSources.filter((s) => s.status === "active").length}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {authSources.filter((s) => s.status === "inactive").length}
            </p>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CARD — SAME STRUCTURE */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Sources</CardTitle>
          <CardDescription>
            Manage identity providers in priority order
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* SEARCH */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* LIST */}
          <div className="space-y-4">
            {filteredSources.map((source) => {
              const Icon = source.icon;
              return (
                <Card key={source.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{source.name}</h4>
                            <Badge variant="outline">Priority {source.priority}</Badge>

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

                          <p className="text-sm text-muted-foreground mt-1">
                            {source.description}
                          </p>

                          <p className="text-xs text-muted-foreground mt-1">
                            Type: {source.type} • {source.users} users • Last sync: {source.lastSync}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch checked={source.status === "active"} />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync Now
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
