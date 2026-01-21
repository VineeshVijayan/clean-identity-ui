import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Trash2, AlertTriangle, CheckCircle, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  },
  {
    id: 2,
    name: "Jira",
    category: "Project Management",
    accessLevel: "Standard",
    grantedDate: "2023-08-20",
    lastUsed: "2024-01-19",
    isEssential: true,
  },
  {
    id: 3,
    name: "Slack Enterprise",
    category: "Communication",
    accessLevel: "Full Access",
    grantedDate: "2023-01-10",
    lastUsed: "2024-01-19",
    isEssential: true,
  },
  {
    id: 4,
    name: "Tableau",
    category: "Analytics",
    accessLevel: "Read Only",
    grantedDate: "2023-11-05",
    lastUsed: "2024-01-15",
    isEssential: false,
  },
  {
    id: 5,
    name: "GitHub Enterprise",
    category: "Development",
    accessLevel: "Contributor",
    grantedDate: "2023-03-22",
    lastUsed: "2024-01-19",
    isEssential: true,
  },
  {
    id: 6,
    name: "Confluence",
    category: "Documentation",
    accessLevel: "Standard",
    grantedDate: "2023-04-18",
    lastUsed: "2024-01-10",
    isEssential: false,
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

  const handleSelectAll = () => {
    const nonEssentialApps = filteredApps.filter((app) => !app.isEssential);
    if (selectedApps.length === nonEssentialApps.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(nonEssentialApps.map((app) => app.id));
    }
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

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case "Full Access":
        return <Badge className="bg-primary/10 text-primary border-primary/30">Full Access</Badge>;
      case "Standard":
        return <Badge variant="secondary">Standard</Badge>;
      case "Read Only":
        return <Badge variant="outline">Read Only</Badge>;
      case "Contributor":
        return <Badge className="bg-success/10 text-success border-success/30">Contributor</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
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
          <h1 className="text-2xl sm:text-3xl font-bold">Remove Application Access</h1>
          <p className="text-muted-foreground mt-1">
            Manage and revoke your application access permissions
          </p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{mockApplications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Essential Apps</p>
                <p className="text-2xl font-bold">
                  {mockApplications.filter((app) => app.isEssential).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected for Removal</p>
                <p className="text-2xl font-bold">{selectedApps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>
            Select applications to remove access. Essential apps cannot be removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSelectAll}>
              {selectedApps.length === filteredApps.filter((app) => !app.isEssential).length
                ? "Deselect All"
                : "Select All Removable"}
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Access Level</TableHead>
                  <TableHead className="hidden sm:table-cell">Granted</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Used</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow
                    key={app.id}
                    className={selectedApps.includes(app.id) ? "bg-destructive/5" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedApps.includes(app.id)}
                        onCheckedChange={() => handleSelectApp(app.id)}
                        disabled={app.isEssential}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{app.category}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {getAccessLevelBadge(app.accessLevel)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{app.grantedDate}</TableCell>
                    <TableCell className="hidden lg:table-cell">{app.lastUsed}</TableCell>
                    <TableCell>
                      {app.isEssential ? (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                          <Shield className="w-3 h-3 mr-1" />
                          Essential
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Removable
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Access Removal
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to request removal of access to {selectedApps.length} application(s).
              This action will be processed within 24 hours and cannot be easily reversed.
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground mb-2">Applications to be removed:</p>
                <ul className="list-disc list-inside text-sm">
                  {mockApplications
                    .filter((app) => selectedApps.includes(app.id))
                    .map((app) => (
                      <li key={app.id}>{app.name}</li>
                    ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAccess}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
