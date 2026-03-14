import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Edit,
    Filter,
    KeyRound,
    MoreVertical,
    Search,
    UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api"; // or REACT_APP_API_BASE_URL

type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
};

export const UserAdministrationPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetch(`${API_BASE_URL}/users`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
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
                    status: u.status || "Active",
                    lastLogin: u.lastLogin || "—",
                }));
                setUsers(mappedUsers);
            })
            .catch((err) => {
                console.error("User fetch failed:", err);
            });
    }, []);

    const filteredUsers = users.filter(
        (user) =>
            `${user.firstName} ${user.lastName}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">All Users</h1>
                    <p className="text-muted-foreground">
                        Manage and view all users in the system
                    </p>
                </div>
                <Button onClick={() => navigate("/users/create")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                </Button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="user-search"
                            name="userSearch"
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
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden sm:table-cell">Email</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 bg-primary/20">
                                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                                {user.firstName.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p className="font-medium">
                                            {user.firstName} {user.lastName}
                                        </p>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline">{user.role}</Badge>
                                </TableCell>

                                <TableCell>
                                    <span className="text-sm font-medium text-green-500">
                                        Active
                                    </span>
                                </TableCell>

                                <TableCell className="hidden sm:table-cell text-muted-foreground">
                                    {user.email}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Switch
                                            checked={user.status === "Active"}
                                            aria-label={`Toggle status for ${user.firstName}`}
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <KeyRound className="h-4 w-4 mr-2" />
                                                    Reset Password
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredUsers.length} of {users.length} users
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
        </motion.div>
    );
};
