import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Send,
  AlertTriangle,
  FileText,
  Package,
  Calendar,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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

interface RequestApplication {
  id: number;
  applicationName: string;
  requestedBy: string;
  requestDate: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
}

interface DeleteApplication {
  id: number;
  applicationName: string;
  assignedTo: string;
  assignedDate: string;
  department: string;
  selected: boolean;
}

// Mock data for Request Applications
const initialRequestApplications: RequestApplication[] = [
  {
    id: 1,
    applicationName: "Salesforce CRM",
    requestedBy: "John Smith",
    requestDate: "2024-01-15",
    justification: "Required for managing customer relationships and sales pipeline",
    status: "pending",
    priority: "high",
  },
  {
    id: 2,
    applicationName: "Microsoft Teams",
    requestedBy: "Sarah Johnson",
    requestDate: "2024-01-14",
    justification: "Need access for team collaboration and meetings",
    status: "pending",
    priority: "medium",
  },
  {
    id: 3,
    applicationName: "Jira Software",
    requestedBy: "Mike Wilson",
    requestDate: "2024-01-13",
    justification: "Project management and issue tracking for development team",
    status: "pending",
    priority: "high",
  },
  {
    id: 4,
    applicationName: "Slack",
    requestedBy: "Emily Davis",
    requestDate: "2024-01-12",
    justification: "Internal communication with remote team members",
    status: "pending",
    priority: "low",
  },
];

// Mock data for Delete Applications
const initialDeleteApplications: DeleteApplication[] = [
  {
    id: 1,
    applicationName: "Legacy HR System",
    assignedTo: "HR Department",
    assignedDate: "2022-03-20",
    department: "Human Resources",
    selected: false,
  },
  {
    id: 2,
    applicationName: "Old CRM Tool",
    assignedTo: "Sales Team",
    assignedDate: "2021-08-15",
    department: "Sales",
    selected: false,
  },
  {
    id: 3,
    applicationName: "Deprecated Analytics",
    assignedTo: "Marketing",
    assignedDate: "2020-11-10",
    department: "Marketing",
    selected: false,
  },
];

export const CheckoutPage = () => {
  const { toast } = useToast();
  const [requestApps, setRequestApps] = useState(initialRequestApplications);
  const [deleteApps, setDeleteApps] = useState(initialDeleteApplications);
  
  // Dialog states
  const [showDeleteRequestDialog, setShowDeleteRequestDialog] = useState(false);
  const [showSubmitRequestDialog, setShowSubmitRequestDialog] = useState(false);
  const [showDeleteAppDialog, setShowDeleteAppDialog] = useState(false);
  const [showSubmitDeleteDialog, setShowSubmitDeleteDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Request Application handlers
  const handleDeleteRequest = (id: number) => {
    setSelectedRequestId(id);
    setShowDeleteRequestDialog(true);
  };

  const confirmDeleteRequest = () => {
    if (selectedRequestId) {
      setRequestApps((prev) => prev.filter((app) => app.id !== selectedRequestId));
      toast({
        title: "Request Deleted",
        description: "The application request has been removed.",
      });
    }
    setShowDeleteRequestDialog(false);
    setSelectedRequestId(null);
  };

  const handleSubmitRequest = (id: number) => {
    setSelectedRequestId(id);
    setShowSubmitRequestDialog(true);
  };

  const confirmSubmitRequest = () => {
    if (selectedRequestId) {
      setRequestApps((prev) =>
        prev.map((app) =>
          app.id === selectedRequestId ? { ...app, status: "approved" as const } : app
        )
      );
      toast({
        title: "Request Submitted",
        description: "The application request has been submitted for approval.",
      });
    }
    setShowSubmitRequestDialog(false);
    setSelectedRequestId(null);
  };

  // Delete Application handlers
  const toggleDeleteAppSelection = (id: number) => {
    setDeleteApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, selected: !app.selected } : app
      )
    );
  };

  const handleDeleteSingleApp = (id: number) => {
    setSelectedDeleteId(id);
    setShowDeleteAppDialog(true);
  };

  const confirmDeleteSingleApp = () => {
    if (selectedDeleteId) {
      setDeleteApps((prev) => prev.filter((app) => app.id !== selectedDeleteId));
      toast({
        title: "Application Deleted",
        description: "The application has been removed from the list.",
      });
    }
    setShowDeleteAppDialog(false);
    setSelectedDeleteId(null);
  };

  const handleSubmitAllDeletes = () => {
    const selectedCount = deleteApps.filter((app) => app.selected).length;
    if (selectedCount === 0) {
      toast({
        title: "No Applications Selected",
        description: "Please select at least one application to delete.",
        variant: "destructive",
      });
      return;
    }
    setShowSubmitDeleteDialog(true);
  };

  const confirmSubmitAllDeletes = () => {
    const selectedApps = deleteApps.filter((app) => app.selected);
    setDeleteApps((prev) => prev.filter((app) => !app.selected));
    toast({
      title: "Applications Deleted",
      description: `${selectedApps.length} application(s) have been removed.`,
    });
    setShowSubmitDeleteDialog(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const selectedDeleteCount = deleteApps.filter((app) => app.selected).length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">
              Manage application requests and deletions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Segment 1: Request Application Details */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Request Application Details</CardTitle>
              </div>
              <Badge variant="secondary" className="text-sm">
                {requestApps.length} Request{requestApps.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {requestApps.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-success mb-3" />
                <p className="text-muted-foreground">No pending application requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {requestApps.map((app) => (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="border border-border hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Package className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-foreground">
                                    {app.applicationName}
                                  </h3>
                                  <Badge className={`${getPriorityColor(app.priority)} text-xs`}>
                                    {app.priority.toUpperCase()} PRIORITY
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <User className="h-4 w-4" />
                                  <span>Requested by: <span className="text-foreground font-medium">{app.requestedBy}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Date: <span className="text-foreground font-medium">{app.requestDate}</span></span>
                                </div>
                              </div>
                              
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">Justification: </span>
                                  {app.justification}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
                                onClick={() => handleDeleteRequest(app.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                              <Button
                                className="gap-2"
                                onClick={() => handleSubmitRequest(app.id)}
                              >
                                <Send className="h-4 w-4" />
                                Submit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Separator className="my-6" />

      {/* Segment 2: Delete Application */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-destructive" />
                <CardTitle>Delete Application</CardTitle>
              </div>
              <Badge variant="secondary" className="text-sm">
                {selectedDeleteCount} of {deleteApps.length} Selected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {deleteApps.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No applications to delete</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {deleteApps.map((app) => (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card 
                        className={`border transition-all cursor-pointer ${
                          app.selected 
                            ? "border-primary bg-primary/5 shadow-md" 
                            : "border-border hover:shadow-sm"
                        }`}
                        onClick={() => toggleDeleteAppSelection(app.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                app.selected 
                                  ? "border-primary bg-primary" 
                                  : "border-muted-foreground"
                              }`}>
                                {app.selected && (
                                  <CheckCircle className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <div className="p-2 rounded-lg bg-destructive/10">
                                <Package className="h-5 w-5 text-destructive" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {app.applicationName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {app.department}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-right">
                                <p className="text-muted-foreground">Assigned to</p>
                                <p className="font-medium text-foreground">{app.assignedTo}</p>
                              </div>
                              <div className="text-sm text-right">
                                <p className="text-muted-foreground">Assigned Date</p>
                                <p className="font-medium text-foreground">{app.assignedDate}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSingleApp(app.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Submit Button for Delete Segment */}
                <div className="flex justify-end pt-4">
                  <Button
                    className="gap-2"
                    onClick={handleSubmitAllDeletes}
                    disabled={selectedDeleteCount === 0}
                  >
                    <Send className="h-4 w-4" />
                    Submit Selected ({selectedDeleteCount})
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Request Confirmation Dialog */}
      <AlertDialog open={showDeleteRequestDialog} onOpenChange={setShowDeleteRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Delete Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Request Confirmation Dialog */}
      <AlertDialog open={showSubmitRequestDialog} onOpenChange={setShowSubmitRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Confirm Submit Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this application request for approval?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmitRequest}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Single App Confirmation Dialog */}
      <AlertDialog open={showDeleteAppDialog} onOpenChange={setShowDeleteAppDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Delete Application
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSingleApp}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit All Deletes Confirmation Dialog */}
      <AlertDialog open={showSubmitDeleteDialog} onOpenChange={setShowSubmitDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Delete Selected Applications
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDeleteCount} selected application(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmitAllDeletes}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
