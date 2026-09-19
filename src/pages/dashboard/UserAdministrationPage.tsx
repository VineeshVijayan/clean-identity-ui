import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { identityFetch } from "@/services/api-config";
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Edit,
    Filter,
    KeyRound,
    MoreVertical,
    RefreshCw,
    Search,
    UserPlus
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type FetchType = "ALL" | "ACTIVE" | "INACTIVE";

const mapUserStatus = (user: {
    status?: string | boolean;
    enabled?: boolean;
    active?: boolean;
    isActive?: boolean;
}) => {
    if (typeof user.status === "string") return user.status;
    if (typeof user.isActive === "boolean") return user.isActive ? "Active" : "Inactive";
    if (typeof user.enabled === "boolean") return user.enabled ? "Active" : "Inactive";
    if (typeof user.active === "boolean") return user.active ? "Active" : "Inactive";
    if (typeof user.status === "boolean") return user.status ? "Active" : "Inactive";
    return "Active";
};

type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
    companyName: string;
};

type SortDirection = "asc" | "desc";

type AdminUserSortField = "name" | "role" | "status" | "email" | "companyName";

const getSortValue = (user: User, field: AdminUserSortField) => {
    if (field === "name") {
        return `${user.firstName} ${user.lastName}`.trim().toLowerCase();
    }

    return String(user[field] ?? "").toLowerCase();
};

const sortUsers = (
    users: User[],
    field: AdminUserSortField,
    direction: SortDirection
) => {
    return [...users].sort((a, b) => {
        const comparison = getSortValue(a, field).localeCompare(getSortValue(b, field));
        return direction === "asc" ? comparison : -comparison;
    });
};

const SortableTableHead = ({
    label,
    active,
    direction,
    onSort,
    className,
}: {
    label: string;
    active: boolean;
    direction: SortDirection;
    onSort: () => void;
    className?: string;
}) => (
    <TableHead className={className}>
        <button
            type="button"
            onClick={onSort}
            className="inline-flex items-center gap-1.5 font-medium hover:text-foreground transition-colors -ml-1 px-1"
        >
            {label}
            {active ? (
                direction === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                )
            ) : (
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
        </button>
    </TableHead>
);

const escapeCsvValue = (value: string) => {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
};

const downloadUsersCsv = (users: User[], filename: string) => {
    const header = "First Name,Last Name,Role,Status,Email,Company,Last Login\n";
    const rows = users
        .map((user) =>
            [
                user.firstName,
                user.lastName,
                user.role,
                user.status,
                user.email,
                user.companyName,
                user.lastLogin,
            ]
                .map((value) => escapeCsvValue(String(value ?? "")))
                .join(",")
        )
        .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

export const UserAdministrationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [fetchType, setFetchType] = useState<FetchType>("ALL");
    const [loaded, setLoaded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<AdminUserSortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [roleFilter, setRoleFilter] = useState("all");
    const [companyFilter, setCompanyFilter] = useState("all");
    const [filterOpen, setFilterOpen] = useState(false);
    const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
    const PAGE_SIZE = 20;

    const activeFilterCount = [roleFilter, companyFilter].filter(
        (value) => value !== "all"
    ).length;

    const handleSort = (field: AdminUserSortField) => {
        if (sortField === field) {
            setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
            return;
        }

        setSortField(field);
        setSortDirection("asc");
    };

    useEffect(() => {
        const loadUsers = async () => {
            setLoaded(false);

            try {
                const res = await identityFetch(`/users?fetchType=${fetchType}`, {
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) {
                    const body = await readResponseBody(res);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: getApiErrorMessage(body, "Failed to fetch users"),
                    });
                    return;
                }

                const response = await res.json();
                const mappedUsers = response.data.map((u: any) => ({
                    id: u.id || u.username,
                    firstName: u.firstName || "",
                    lastName: u.lastName || "",
                    email: u.email,
                    role: u.roles?.join(", ") || "N/A",
                    status: mapUserStatus(u),
                    lastLogin: u.lastLogin || "—",
                    companyName:
                        u.companyName ||
                        u.company?.name ||
                        u.company ||
                        u.organizationName ||
                        "—",
                }));
                setUsers(mappedUsers);
            } catch (err) {
                console.error("User fetch failed:", err);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: getErrorFromCatch(err, "Failed to fetch users"),
                });
            } finally {
                setLoaded(true);
            }
        };

        loadUsers();
    }, [fetchType]);

    const toggleUserStatus = async (user: User) => {
        const isActive = user.status !== "Active";

        setTogglingUserId(user.id);

        try {
            const res = await identityFetch(`/users/${user.id}/active`, {
                method: "PUT",
                skipLoader: true,
                body: JSON.stringify({ isActive }),
            });

            if (!res.ok) {
                const body = await readResponseBody(res);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: getApiErrorMessage(body, "Failed to update user status"),
                });
                return;
            }

            setUsers((prev) =>
                prev.map((item) =>
                    item.id === user.id
                        ? { ...item, status: isActive ? "Active" : "Inactive" }
                        : item
                )
            );

            toast({
                title: "Status Updated",
                description: `User ${isActive ? "activated" : "deactivated"} successfully.`,
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: getErrorFromCatch(err, "Failed to update user status"),
            });
        } finally {
            setTogglingUserId(null);
        }
    };

    const availableRoles = useMemo(() => {
        const roles = new Set<string>();

        users.forEach((user) => {
            user.role
                .split(",")
                .map((role) => role.trim())
                .forEach((role) => {
                    if (role && role !== "N/A") roles.add(role);
                });
        });

        return Array.from(roles).sort((a, b) => a.localeCompare(b));
    }, [users]);

    const availableCompanies = useMemo(() => {
        const companies = new Set<string>();

        users.forEach((user) => {
            if (user.companyName && user.companyName !== "—") {
                companies.add(user.companyName);
            }
        });

        return Array.from(companies).sort((a, b) => a.localeCompare(b));
    }, [users]);

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query);

        const matchesRole =
            roleFilter === "all" ||
            user.role
                .split(",")
                .map((role) => role.trim().toLowerCase())
                .includes(roleFilter.toLowerCase());

        const matchesCompany =
            companyFilter === "all" || user.companyName === companyFilter;

        return matchesSearch && matchesRole && matchesCompany;
    });

    const clearFilters = () => {
        setRoleFilter("all");
        setCompanyFilter("all");
    };

    const sortedUsers = useMemo(
        () => sortUsers(filteredUsers, sortField, sortDirection),
        [filteredUsers, sortField, sortDirection]
    );

    const handleExport = () => {
        if (sortedUsers.length === 0) {
            toast({
                variant: "destructive",
                title: "Nothing to export",
                description: "Adjust your filters or search to include users first.",
            });
            return;
        }

        const dateStamp = new Date().toISOString().slice(0, 10);
        downloadUsersCsv(sortedUsers, `users_administration_${dateStamp}.csv`);

        toast({
            title: "Export complete",
            description: `${sortedUsers.length} user${sortedUsers.length === 1 ? "" : "s"} exported to CSV.`,
        });
    };

    const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
    const paginatedUsers = sortedUsers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, fetchType, sortField, sortDirection, roleFilter, companyFilter]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">All Users</h1>
                    <p className="text-muted-foreground">
                        Manage and view all users in the system
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => navigate("/admin/user-sync")}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        User Sync
                    </Button>
                    <Button onClick={() => navigate("/users/create")}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                    </Button>
                </div>
            </div>

            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                    <div className="flex flex-wrap items-center gap-2">
                        <ToggleGroup
                            type="single"
                            value={fetchType}
                            onValueChange={(value) => {
                                if (value) setFetchType(value as FetchType);
                            }}
                            variant="outline"
                            size="sm"
                        >
                            <ToggleGroupItem value="ALL" aria-label="Show all users">
                                All
                            </ToggleGroupItem>
                            <ToggleGroupItem value="ACTIVE" aria-label="Show active users">
                                Active
                            </ToggleGroupItem>
                            <ToggleGroupItem value="INACTIVE" aria-label="Show inactive users">
                                Inactive
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="relative">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                    {activeFilterCount > 0 && (
                                        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Role</Label>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All roles</SelectItem>
                                            {availableRoles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Company</Label>
                                    <Select value={companyFilter} onValueChange={setCompanyFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All companies" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All companies</SelectItem>
                                            {availableCompanies.map((company) => (
                                                <SelectItem key={company} value={company}>
                                                    {company}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-between gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        disabled={activeFilterCount === 0}
                                    >
                                        Clear filters
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => setFilterOpen(false)}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <SortableTableHead
                                label="Name"
                                active={sortField === "name"}
                                direction={sortDirection}
                                onSort={() => handleSort("name")}
                            />
                            <SortableTableHead
                                label="Role"
                                active={sortField === "role"}
                                direction={sortDirection}
                                onSort={() => handleSort("role")}
                            />
                            <SortableTableHead
                                label="Status"
                                active={sortField === "status"}
                                direction={sortDirection}
                                onSort={() => handleSort("status")}
                            />
                            <SortableTableHead
                                label="Email"
                                active={sortField === "email"}
                                direction={sortDirection}
                                onSort={() => handleSort("email")}
                                className="hidden sm:table-cell"
                            />
                            <SortableTableHead
                                label="Company"
                                active={sortField === "companyName"}
                                direction={sortDirection}
                                onSort={() => handleSort("companyName")}
                                className="hidden md:table-cell"
                            />
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {!loaded ? null : sortedUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedUsers.map((user) => (
                                <TableRow
                                    key={user.id}
                                    className={`transition-opacity duration-300 ${
                                        user.status === "Active" ? "opacity-100" : "opacity-50"
                                    }`}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 bg-primary/20">
                                                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                                    {user.firstName.charAt(0)}
                                                    {user.lastName ? user.lastName.charAt(0) : ""}
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
                                        <span
                                            className={`text-sm font-medium ${
                                                user.status === "Active"
                                                    ? "text-green-500"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {user.status}
                                        </span>
                                    </TableCell>

                                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                                        {user.email}
                                    </TableCell>

                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                        {user.companyName || "—"}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Switch
                                                checked={user.status === "Active"}
                                                disabled={togglingUserId === user.id}
                                                onCheckedChange={() => toggleUserStatus(user)}
                                                aria-label={`Toggle status for ${user.firstName}`}
                                            />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            navigate("/edit-profile", {
                                                                state: {
                                                                    userId: user.id,
                                                                    user,
                                                                    from: location.pathname,
                                                                    source: "useradmin",
                                                                },
                                                            })
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            navigate("/admin/reset-password", {
                                                                state: {
                                                                    userId: user.id,
                                                                    user,
                                                                    from: location.pathname,
                                                                },
                                                            })
                                                        }
                                                    >
                                                        <KeyRound className="h-4 w-4 mr-2" />
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-between p-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        {sortedUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                        -{Math.min(currentPage * PAGE_SIZE, sortedUsers.length)} of{" "}
                        {sortedUsers.length} users
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
