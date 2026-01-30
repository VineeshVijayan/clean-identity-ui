import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Send, Clock, CheckCircle, XCircle, Plus, AppWindow, FileText, Building2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export const RequestAppPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<typeof availableApplications[0] | null>(null);
  const [justification, setJustification] = useState("");
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

  const filteredApps = availableApplications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = mockRequests.filter((request) =>
    request.applicationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenRequestDialog = (app: typeof availableApplications[0]) => {
    setSelectedApp(app);
    setIsDialogOpen(true);
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
    setIsDialogOpen(false);
    setSelectedApp(null);
    setJustification("");
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
            <Send className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Request Application Access</h1>
            <p className="text-muted-foreground">
              Browse available applications and submit access requests
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
      </motion.div>

      {/* Main Content with Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="browse" className="gap-2">
              <AppWindow className="h-4 w-4" />
              Browse Apps
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <FileText className="h-4 w-4" />
              My Requests
            </TabsTrigger>
          </TabsList>

          {/* Browse Applications Tab */}
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
                  {filteredApps.map((app) => (
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

                {filteredApps.length === 0 && (
                  <div className="text-center py-12">
                    <AppWindow className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No applications found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Requests Tab */}
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
      </motion.div>

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} className="gap-2">
              <Send className="h-4 w-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
