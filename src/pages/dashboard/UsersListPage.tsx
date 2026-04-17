import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Filter,
  MoreVertical,
  Search,
  Send,
  Trash2,
  UserCheck,
  UserPlus,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const authHeaders = () => {
  const token = localStorage.getItem("auth-token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    Accept: "application/json",
    "Content-Type": "application/json"
  };
};

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

const CONNECTOR_API_BASE_URL = "https://idf-connector.ndashdigital.com/api";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  departmentId: string;
  departmentName: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "Inactive":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "Pending":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

/* ─── Shared User Table ─── */
const UserTable = ({
  users,
  searchQuery,
  setSearchQuery,
  totalCount,
}: {
  users: User[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  totalCount: number;
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/20">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {user.firstName.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{user.firstName}</p>
                  </div>
                </TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.status}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() =>
                        navigate("/edit-profile", {
                          state: { userId: user.id, user },
                        })
                      }>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {users.length} of {totalCount} users
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


const DelegateTable = ({
  users,
  searchQuery,
  setSearchQuery,
  totalCount,
}: {
  users: User[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  totalCount: number;
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/20">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {user.firstName.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{user.firstName}</p>
                  </div>
                </TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.departmentName}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() =>
                        navigate("/edit-profile", {
                          state: { userId: user.id, user },
                        })
                      }>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {users.length} of {totalCount} users
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export const UsersListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("myteam");
  const [teamSearch, setTeamSearch] = useState("");
  const [delegateSearch, setDelegateSearch] = useState("");
  const [delegateModalOpen, setDelegateModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [delegateReason, setDelegateReason] = useState("");
  // ADD this state
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const deptId = getDeptId();

    if (!deptId) {
      console.error("No departmentId in token");
      return;
    }

    fetch(`${API_BASE_URL}/users/departments/${deptId}`, {
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((response) => {
        const mappedUsers = response.data.map((u: any) => ({
          id: u.id || u.username,
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email,
          role: u.roles?.join(", ") || "N/A",
          status: "Active",
          lastLogin: u.lastLogin || "—",
          departmentId: u.departmentId || "",
          departmentName: u.departmentName || ""
        }));

        setUsers(mappedUsers);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/departments`, {
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch departments");
        return res.json();
      })
      .then((response) => {
        const deptList = response.data.map((d: any) => ({
          id: d.id,
          name: d.name,
        }));
        setDepartments(deptList);
      })
      .catch((err) => console.error(err));
  }, []);


  const teamUsers = users;

  type AccessRequest = {
    id: string;
    requesterName: string;
    departmentName: string;
    status: string;
    comments: string;
    requestedAt: string;
  };

  const [delegateUsers, setDelegateUsers] = useState<User[]>([]);

  const filteredTeam = teamUsers.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(teamSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(teamSearch.toLowerCase())
  );

  // delegateSearch is kept for future use

  const getDeptId = () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.departmentId;
    } catch {
      return null;
    }
  };

  const handleSendRequest = async () => {
    if (!selectedDepartment) return;

    try {
      const response = await fetch(`${API_BASE_URL}/delegates/request`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          targetDepartmentId: Number(selectedDepartment),
          comments: delegateReason || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send request");
      }

      // ✅ Success
      toast.success("Request sent successfully");

      // Reset
      setDelegateModalOpen(false);
      setSelectedDepartment("");
      setDelegateReason("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send request");
    }
  };
  useEffect(() => {
    if (activeTab !== "delegate") return;

    // Prevent repeat API calls if already loaded
    if (delegateUsers.length > 0) return;

    fetch(`${API_BASE_URL}/delegates/users`, {
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch delegate users");
        return res.json();
      })
      .then((response) => {
        const mapped = response.data.map((u: any) => ({
          id: String(u.id),
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          role: "Delegate",
          status: u.status ? "Active" : "Inactive",
          lastLogin: "—",
          departmentId: "",
          departmentName: u.departmentName,
        }));

        setDelegateUsers(mapped);
      })
      .catch((err) => console.error(err));
  }, [activeTab]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">All Users</h1>
            <p className="text-muted-foreground">View your direct reports</p>
          </div>
        </div>
        {activeTab === "myteam" ? (
          <Button onClick={() => navigate("/users/create")}>
            <UserPlus className="h-4 w-4 mr-2" />
            New Team Member
          </Button>
        ) : (
          <Button onClick={() => setDelegateModalOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            New Delegate
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="myteam" className="gap-2">
            <Users className="h-4 w-4" />
            My Team
          </TabsTrigger>
          <TabsTrigger value="delegate" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Delegate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="myteam" className="mt-6">
          <UserTable
            users={filteredTeam}
            searchQuery={teamSearch}
            setSearchQuery={setTeamSearch}
            totalCount={teamUsers.length}
          />
        </TabsContent>

        <TabsContent value="delegate" className="mt-6">
          <DelegateTable
            users={delegateUsers}
            searchQuery={delegateSearch}
            setSearchQuery={setDelegateSearch}
            totalCount={delegateUsers.length}
          />
        </TabsContent>
      </Tabs>

      {/* New Delegate Modal */}
      <Dialog open={delegateModalOpen} onOpenChange={setDelegateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Delegate Request</DialogTitle>
            <DialogDescription>
              Select a department to send a delegate request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Enter reason for delegate request"
                value={delegateReason}
                onChange={(e) => setDelegateReason(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSendRequest}
              disabled={!selectedDepartment}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};