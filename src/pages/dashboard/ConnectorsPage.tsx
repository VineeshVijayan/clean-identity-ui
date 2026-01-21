import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Link2,
  Cloud,
  Database,
  Server,
  Settings,
  Edit,
  Trash2,
  MoreHorizontal,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Mock connectors data
const mockConnectors = [
  {
    id: 1,
    name: "Salesforce Connector",
    type: "CRM",
    direction: "outbound",
    icon: Cloud,
    status: "active",
    lastRun: "2024-01-19 10:30",
    recordsProcessed: 1524,
    errors: 0,
  },
  {
    id: 2,
    name: "SAP HR Integration",
    type: "HR System",
    direction: "inbound",
    icon: Database,
    status: "active",
    lastRun: "2024-01-19 08:00",
    recordsProcessed: 3200,
    errors: 2,
  },
  {
    id: 3,
    name: "ServiceNow Provisioning",
    type: "ITSM",
    direction: "outbound",
    icon: Server,
    status: "warning",
    lastRun: "2024-01-18 22:15",
    recordsProcessed: 450,
    errors: 15,
  },
  {
    id: 4,
    name: "Workday Connector",
    type: "HR System",
    direction: "inbound",
    icon: Cloud,
    status: "inactive",
    lastRun: "2024-01-10 06:00",
    recordsProcessed: 0,
    errors: 0,
  },
  {
    id: 5,
    name: "Microsoft 365 Sync",
    type: "Productivity",
    direction: "bidirectional",
    icon: Cloud,
    status: "active",
    lastRun: "2024-01-19 11:00",
    recordsProcessed: 890,
    errors: 0,
  },
  {
    id: 6,
    name: "AWS IAM Provisioning",
    type: "Cloud Infrastructure",
    direction: "outbound",
    icon: Server,
    status: "active",
    lastRun: "2024-01-19 09:45",
    recordsProcessed: 125,
    errors: 0,
  },
];

const connectorTypes = [
  { value: "crm", label: "CRM System" },
  { value: "hr", label: "HR System" },
  { value: "itsm", label: "ITSM / Service Desk" },
  { value: "cloud", label: "Cloud Infrastructure" },
  { value: "productivity", label: "Productivity Suite" },
  { value: "custom", label: "Custom Integration" },
];

export const ConnectorsPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [connectors, setConnectors] = useState(mockConnectors);
  const [directionFilter, setDirectionFilter] = useState("all");

  const filteredConnectors = connectors.filter((connector) => {
    const matchesSearch =
      connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connector.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDirection =
      directionFilter === "all" || connector.direction === directionFilter;
    return matchesSearch && matchesDirection;
  });

  const handleToggleConnector = (id: number) => {
    setConnectors((prev) =>
      prev.map((connector) =>
        connector.id === id
          ? {
              ...connector,
              status: connector.status === "active" ? "inactive" : "active",
            }
          : connector
      )
    );
    const connector = connectors.find((c) => c.id === id);
    toast({
      title: connector?.status === "active" ? "Connector Disabled" : "Connector Enabled",
      description: `${connector?.name} has been ${connector?.status === "active" ? "disabled" : "enabled"}.`,
    });
  };

  const handleRunConnector = (connector: typeof mockConnectors[0]) => {
    toast({
      title: "Connector Started",
      description: `${connector.name} is now running...`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success/10 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case "inbound":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            ← Inbound
          </Badge>
        );
      case "outbound":
        return (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
            Outbound →
          </Badge>
        );
      case "bidirectional":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            ↔ Bidirectional
          </Badge>
        );
      default:
        return <Badge variant="outline">{direction}</Badge>;
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold">Outbound Connectors</h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage integration connectors for identity provisioning
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Connector
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Connector</DialogTitle>
              <DialogDescription>
                Configure a new outbound connector for identity provisioning
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="connectorName">Connector Name</Label>
                <Input id="connectorName" placeholder="e.g., Salesforce Provisioning" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connectorType">Connector Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectorTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direction">Direction</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound (Import)</SelectItem>
                    <SelectItem value="outbound">Outbound (Provision)</SelectItem>
                    <SelectItem value="bidirectional">Bidirectional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input id="endpoint" placeholder="https://api.example.com/v1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast({ title: "Connector Added", description: "New connector configured successfully." });
                  setIsDialogOpen(false);
                }}
              >
                Add Connector
              </Button>
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
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Connectors</p>
                <p className="text-2xl font-bold">{connectors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Play className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {connectors.filter((c) => c.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Errors</p>
                <p className="text-2xl font-bold">
                  {connectors.filter((c) => c.errors > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <ArrowRightLeft className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Records Today</p>
                <p className="text-2xl font-bold">
                  {connectors.reduce((sum, c) => sum + c.recordsProcessed, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connectors List */}
      <Card>
        <CardHeader>
          <CardTitle>Connectors</CardTitle>
          <CardDescription>Manage your identity provisioning and synchronization connectors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={directionFilter} onValueChange={setDirectionFilter} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="inbound">Inbound</TabsTrigger>
                <TabsTrigger value="outbound">Outbound</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-4">
            {filteredConnectors.map((connector) => {
              const ConnectorIcon = connector.icon;
              return (
                <div
                  key={connector.id}
                  className={`p-4 rounded-lg border ${
                    connector.status === "active"
                      ? "bg-card border-border"
                      : "bg-muted/30 border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          connector.status === "active" ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <ConnectorIcon
                          className={`h-6 w-6 ${
                            connector.status === "active" ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{connector.name}</h4>
                          {getDirectionBadge(connector.direction)}
                          {getStatusBadge(connector.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Type: {connector.type}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                          <span>Last run: {connector.lastRun}</span>
                          <span>•</span>
                          <span>{connector.recordsProcessed.toLocaleString()} records</span>
                          {connector.errors > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-destructive">{connector.errors} errors</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunConnector(connector)}
                        disabled={connector.status !== "active"}
                        className="gap-1"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Run
                      </Button>
                      <Switch
                        checked={connector.status === "active"}
                        onCheckedChange={() => handleToggleConnector(connector.id)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
