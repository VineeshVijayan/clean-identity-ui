import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Trash2, AlertTriangle, CheckCircle, Package, Shield, X, AppWindow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data for user's applications
const mockApplications = [
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

export const RemoveAppPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApps, setSelectedApps] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredApps = mockApplications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectApp = (appId: number) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const handleRemoveAccess = () => {
    const removedApps = mockApplications.filter((app) =>
      selectedApps.includes(app.id)
    );
    
    toast({
      title: "Access Removal Requested",
      description: `Removal request submitted for ${removedApps.length} application(s). This will be processed within 24 hours.`,
    });
    
    setSelectedApps([]);
    setIsDialogOpen(false);
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
          <div className="p-2 rounded-lg bg-destructive/10">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Remove Application Access</h1>
            <p className="text-muted-foreground">
              Manage and revoke your application access permissions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Alert */}
      <motion.div variants={itemVariants}>
        <Alert className="border-warning/50 bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Important Notice</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Essential applications marked with a shield icon cannot be removed. Contact your administrator for assistance with essential apps.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-3xl font-bold text-foreground">{mockApplications.length}</p>
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
                  {mockApplications.filter((app) => app.isEssential).length}
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
                <p className="text-3xl font-bold text-foreground">{selectedApps.length}</p>
              </div>
              <div className="p-3 rounded-full bg-destructive/10">
                <X className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Action Bar */}
      <motion.div variants={itemVariants}>
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
                disabled={selectedApps.length === 0}
                onClick={() => setIsDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove Selected ({selectedApps.length})
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
              {filteredApps.map((app) => (
                <motion.div
                  key={app.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedApps.includes(app.id) 
                        ? "ring-2 ring-destructive bg-destructive/5" 
                        : app.isEssential 
                          ? "opacity-75 cursor-not-allowed"
                          : "hover:shadow-md"
                    }`}
                    onClick={() => !app.isEssential && handleSelectApp(app.id)}
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
                            checked={selectedApps.includes(app.id)}
                            onCheckedChange={() => handleSelectApp(app.id)}
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
                      ) : selectedApps.includes(app.id) ? (
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

            {filteredApps.length === 0 && (
              <div className="text-center py-12">
                <AppWindow className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No applications found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Access Removal
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>You are about to request removal of access to {selectedApps.length} application(s).
                This action will be processed within 24 hours and cannot be easily reversed.</p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-medium text-foreground mb-2">Applications to be removed:</p>
                  <ul className="space-y-2">
                    {mockApplications
                      .filter((app) => selectedApps.includes(app.id))
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
