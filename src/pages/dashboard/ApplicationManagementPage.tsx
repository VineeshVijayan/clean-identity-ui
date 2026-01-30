import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, Send, Clock, CheckCircle, XCircle, Plus, AppWindow, FileText, 
  Building2, Trash2, AlertTriangle, Package, Shield, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data for application requests
const mockRequests = [
  {
    id: "REQ001",
    applicationName: "Salesforce CRM",
    requestedBy: "John Doe",
    department: "Sales",
    requestDate: "2024-01-15",
    status: "pending",
    justification: "Need access for customer management",
    icon: "💼",
  },
  {
    id: "REQ002",
    applicationName: "Jira",
    requestedBy: "Jane Smith",
    department: "Engineering",
    requestDate: "2024-01-14",
    status: "approved",
    justification: "Project tracking and issue management",
    icon: "📋",
  },
  {
    id: "REQ003",
    applicationName: "Slack Enterprise",
    requestedBy: "Bob Wilson",
    department: "Marketing",
    requestDate: "2024-01-13",
    status: "rejected",
    justification: "Team communication needs",
    icon: "💬",
  },
  {
    id: "REQ004",
    applicationName: "Tableau",
    requestedBy: "Alice Brown",
    department: "Analytics",
    requestDate: "2024-01-12",
    status: "pending",
    justification: "Data visualization requirements",
    icon: "📊",
  },
];

const availableApplications = [
  { id: 1, name: "Salesforce CRM", category: "CRM", icon: "💼", description: "Customer relationship management" },
  { id: 2, name: "Jira", category: "Project Management", icon: "📋", description: "Issue tracking and project management" },
  { id: 3, name: "Slack Enterprise", category: "Communication", icon: "💬", description: "Team messaging and collaboration" },
  { id: 4, name: "Tableau", category: "Analytics", icon: "📊", description: "Data visualization and analytics" },
  { id: 5, name: "GitHub Enterprise", category: "Development", icon: "🐙", description: "Code hosting and version control" },
  { id: 6, name: "Confluence", category: "Documentation", icon: "📝", description: "Team workspace and documentation" },
  { id: 7, name: "Zendesk", category: "Support", icon: "🎧", description: "Customer support and ticketing" },
  { id: 8, name: "HubSpot", category: "Marketing", icon: "📣", description: "Marketing automation platform" },
];

// Mock data for user's current applications
const userApplications = [
  {
    id: 1,
    name: "Salesforce CRM",
    category: "CRM",
    accessLevel: "Full Access",
    grantedDate: "2023-06-15",
    lastUsed: "2024-01-18",
    isEssential: false,
    icon: "💼",
  },
  {
    id: 2,
    name: "Jira",
    category: "Project Management",
    accessLevel: "Standard",
    grantedDate: "2023-08-20",
    lastUsed: "2024-01-19",
    isEssential: true,
    icon: "📋",
  },
  {
    id: 3,
    name: "Slack Enterprise",
    category: "Communication",
    accessLevel: "Full Access",
    grantedDate: "2023-01-10",
    lastUsed: "2024-01-19",
    isEssential: true,
    icon: "💬",
  },
  {
    id: 4,
    name: "Tableau",
    category: "Analytics",
    accessLevel: "Read Only",
    grantedDate: "2023-11-05",
    lastUsed: "2024-01-15",
    isEssential: false,
    icon: "📊",
  },
  {
    id: 5,
    name: "GitHub Enterprise",
    category: "Development",
    accessLevel: "Contributor",
    grantedDate: "2023-03-22",
    lastUsed: "2024-01-19",
    isEssential: true,
    icon: "🐙",
  },
  {
    id: 6,
    name: "Confluence",
    category: "Documentation",
    accessLevel: "Standard",
    grantedDate: "2023-04-18",
    lastUsed: "2024-01-10",
    isEssential: false,
    icon: "📝",
  },
];

export const ApplicationManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("request");
  const [requestSubTab, setRequestSubTab] = useState("browse");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<typeof availableApplications[0] | null>(null);
  const [justification, setJustification] = useState("");
  const [selectedAppsForRemoval, setSelectedAppsForRemoval] = useState<number[]>([]);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredAvailableApps = availableApplications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = mockRequests.filter((request) =>
    request.applicationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserApps = userApplications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenRequestDialog = (app: typeof availableApplications[0]) => {
    setSelectedApp(app);
    setIsRequestDialogOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!justification) {
      toast({
        title: "Error",
        description: "Please provide a business justification",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request Submitted",
      description: `Your request for ${selectedApp?.name} has been submitted for approval.`,
    });
    setIsRequestDialogOpen(false);
    setSelectedApp(null);
    setJustification("");
  };

  const handleSelectAppForRemoval = (appId: number) => {
    setSelectedAppsForRemoval((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const handleRemoveAccess = () => {
    const removedApps = userApplications.filter((app) =>
      selectedAppsForRemoval.includes(app.id)
    );
    
    toast({
      title: "Access Removal Requested",
      description: `Removal request submitted for ${removedApps.length} application(s). This will be processed within 24 hours.`,
    });
    
    setSelectedAppsForRemoval([]);
    setIsRemoveDialogOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <AppWindow className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Application Management</h1>
            <p className="text-muted-foreground">
              Request new applications or manage your existing access
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="request" className="gap-2">
              <Send className="h-4 w-4" />
              Request Access
            </TabsTrigger>
            <TabsTrigger value="remove" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Remove Access
            </TabsTrigger>
          </TabsList>

          {/* Request Access Tab */}
          <TabsContent value="request" className="mt-6 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-t-4 border-t-primary">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-foreground">{mockRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-warning">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-warning">{mockRequests.filter((r) => r.status === "pending").length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-success">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-success">{mockRequests.filter((r) => r.status === "approved").length}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-destructive">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-destructive">{mockRequests.filter((r) => r.status === "rejected").length}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </CardContent>
              </Card>
            </div>

            {/* Sub-Tabs for Request */}
            <Tabs value={requestSubTab} onValueChange={setRequestSubTab} className="w-full">
              <TabsList className="grid w-full max-w-sm grid-cols-2">
                <TabsTrigger value="browse" className="gap-2">
                  <AppWindow className="h-4 w-4" />
                  Browse Apps
                </TabsTrigger>
                <TabsTrigger value="requests" className="gap-2">
                  <FileText className="h-4 w-4" />
                  My Requests
                </TabsTrigger>
              </TabsList>

              {/* Browse Applications */}
              <TabsContent value="browse" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <AppWindow className="h-5 w-5 text-primary" />
                          Available Applications
                        </CardTitle>
                        <CardDescription>Click on an application to request access</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {filteredAvailableApps.map((app) => (
                        <motion.div
                          key={app.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 h-full"
                            onClick={() => handleOpenRequestDialog(app)}
                          >
                            <CardContent className="pt-6 text-center">
                              <div className="text-4xl mb-3">{app.icon}</div>
                              <h3 className="font-semibold text-foreground mb-1">{app.name}</h3>
                              <Badge variant="secondary" className="mb-2">{app.category}</Badge>
                              <p className="text-xs text-muted-foreground">{app.description}</p>
                            </CardContent>
                            <CardFooter className="pt-0">
                              <Button variant="outline" className="w-full gap-2" size="sm">
                                <Plus className="h-4 w-4" />
                                Request Access
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {filteredAvailableApps.length === 0 && (
                      <div className="text-center py-12">
                        <AppWindow className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No applications found matching your search.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* My Requests */}
              <TabsContent value="requests" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      My Access Requests
                    </CardTitle>
                    <CardDescription>Track the status of your application access requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="space-y-4">
                      {filteredRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="text-3xl">{request.icon}</div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-foreground">{request.applicationName}</h3>
                                      {getStatusBadge(request.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{request.justification}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        {request.department}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {request.requestDate}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Request ID</p>
                                  <p className="font-mono text-sm font-medium">{request.id}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}

                      {filteredRequests.length === 0 && (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No requests found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Remove Access Tab */}
          <TabsContent value="remove" className="mt-6 space-y-6">
            {/* Info Alert */}
            <Alert className="border-warning/50 bg-warning/5">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">Important Notice</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Essential applications marked with a shield icon cannot be removed. Contact your administrator for assistance with essential apps.
              </AlertDescription>
            </Alert>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                      <p className="text-3xl font-bold text-foreground">{userApplications.length}</p>
                    </div>
                    <div className="p-3 rounded-full bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-warning">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Essential Apps</p>
                      <p className="text-3xl font-bold text-foreground">
                        {userApplications.filter((app) => app.isEssential).length}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-warning/10">
                      <Shield className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Selected for Removal</p>
                      <p className="text-3xl font-bold text-foreground">{selectedAppsForRemoval.length}</p>
                    </div>
                    <div className="p-3 rounded-full bg-destructive/10">
                      <X className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AppWindow className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">My Applications</CardTitle>
                      <CardDescription>Select applications to remove access</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    disabled={selectedAppsForRemoval.length === 0}
                    onClick={() => setIsRemoveDialogOpen(true)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Selected ({selectedAppsForRemoval.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Application Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUserApps.map((app) => (
                    <motion.div
                      key={app.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedAppsForRemoval.includes(app.id) 
                            ? "ring-2 ring-destructive bg-destructive/5" 
                            : app.isEssential 
                              ? "opacity-75 cursor-not-allowed"
                              : "hover:shadow-md"
                        }`}
                        onClick={() => !app.isEssential && handleSelectAppForRemoval(app.id)}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{app.icon}</div>
                              <div>
                                <h3 className="font-semibold text-foreground">{app.name}</h3>
                                <p className="text-sm text-muted-foreground">{app.category}</p>
                              </div>
                            </div>
                            {!app.isEssential && (
                              <Checkbox
                                checked={selectedAppsForRemoval.includes(app.id)}
                                onCheckedChange={() => handleSelectAppForRemoval(app.id)}
                                className="mt-1"
                              />
                            )}
                            {app.isEssential && (
                              <Shield className="h-5 w-5 text-warning" />
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Access Level:</span>
                              <Badge variant="secondary" className="text-xs">{app.accessLevel}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Granted:</span>
                              <span className="text-foreground">{app.grantedDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Used:</span>
                              <span className="text-foreground">{app.lastUsed}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          {app.isEssential ? (
                            <Badge variant="outline" className="w-full justify-center bg-warning/10 text-warning border-warning/30">
                              <Shield className="w-3 h-3 mr-1" />
                              Essential - Cannot Remove
                            </Badge>
                          ) : selectedAppsForRemoval.includes(app.id) ? (
                            <Badge variant="outline" className="w-full justify-center bg-destructive/10 text-destructive border-destructive/30">
                              <X className="w-3 h-3 mr-1" />
                              Selected for Removal
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="w-full justify-center bg-success/10 text-success border-success/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Click to Select
                            </Badge>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredUserApps.length === 0 && (
                  <div className="text-center py-12">
                    <AppWindow className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No applications found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedApp && <span className="text-2xl">{selectedApp.icon}</span>}
              Request Access
            </DialogTitle>
            <DialogDescription>
              {selectedApp && (
                <span>Submit a request for access to <strong>{selectedApp.name}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedApp && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{selectedApp.icon}</span>
                  <div>
                    <h4 className="font-semibold">{selectedApp.name}</h4>
                    <Badge variant="secondary">{selectedApp.category}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selectedApp.description}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="justification">Business Justification *</Label>
              <Textarea
                id="justification"
                placeholder="Explain why you need access to this application and how it will help with your work..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Provide a clear business reason for your access request
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} className="gap-2">
              <Send className="h-4 w-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Access Removal
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>You are about to request removal of access to {selectedAppsForRemoval.length} application(s).
                This action will be processed within 24 hours and cannot be easily reversed.</p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-medium text-foreground mb-2">Applications to be removed:</p>
                  <ul className="space-y-2">
                    {userApplications
                      .filter((app) => selectedAppsForRemoval.includes(app.id))
                      .map((app) => (
                        <li key={app.id} className="flex items-center gap-2 text-sm">
                          <span>{app.icon}</span>
                          <span>{app.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">{app.category}</Badge>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAccess}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
