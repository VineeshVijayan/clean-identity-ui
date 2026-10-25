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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ManageDelegatesDialog } from "@/components/dashboard/ManageDelegatesDialog";
import { DEFAULT_COMPANY_NAME, getUniqueManagers } from "@/lib/delegate-users";
import { fetchDelegatedUsers } from "@/services/delegate-api";
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
  Loader2,
  MoreVertical,
  Search,
  Send,
  Settings2,
  UserCheck,
  UserPlus,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectorFetch, identityFetch } from "@/services/api-config";
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import { toast } from "sonner";

const acceptJsonHeaders = {
  Accept: "application/json",
};

type FetchType = "ALL" | "ACTIVE" | "INACTIVE";

const mapUserStatus = (user: {
  status?: string | boolean;
  enabled?: boolean;
  active?: boolean;
}) => {
  if (typeof user.status === "string") return user.status;
  if (typeof user.enabled === "boolean") return user.enabled ? "Active" : "Inactive";
  if (typeof user.active === "boolean") return user.active ? "Active" : "Inactive";
  if (typeof user.status === "boolean") return user.status ? "Active" : "Inactive";
  return "Active";
};

type Subordinate = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

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
  managerName: string;
  companyName: string;
  subordinates?: Subordinate[];
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
const PAGE_SIZE = 20;

type SortDirection = "asc" | "desc";

type UserSortField =
  | "firstName"
  | "lastName"
  | "status"
  | "email"
  | "companyName";

type DelegateSortField =
  | "firstName"
  | "lastName"
  | "managerName"
  | "email"
  | "companyName";

const sortByField = <T extends Record<string, unknown>>(
  items: T[],
  field: keyof T,
  direction: SortDirection
) => {
  return [...items].sort((a, b) => {
    const aVal = String(a[field] ?? "").toLowerCase();
    const bVal = String(b[field] ?? "").toLowerCase();
    const comparison = aVal.localeCompare(bVal);
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

const downloadCsv = (header: string, rows: string[][], filename: string) => {
  const content =
    header +
    rows
      .map((row) => row.map((value) => escapeCsvValue(String(value ?? ""))).join(","))
      .join("\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const getUniqueRoles = (users: User[]) => {
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
};

const getUniqueCompanies = (users: User[]) => {
  const companies = new Set<string>();
  users.forEach((user) => {
    if (user.companyName && user.companyName !== "—") {
      companies.add(user.companyName);
    }
  });
  return Array.from(companies).sort((a, b) => a.localeCompare(b));
};

const UserTable = ({
  users,
  searchQuery,
  setSearchQuery,
  fetchType,
  onFetchTypeChange,
  loading = false,
}: {
  users: User[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  fetchType: FetchType;
  onFetchTypeChange: (value: FetchType) => void;
  loading?: boolean;
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<UserSortField>("firstName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [roleFilter, setRoleFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = [roleFilter, companyFilter].filter(
    (value) => value !== "all"
  ).length;

  const availableRoles = useMemo(() => getUniqueRoles(users), [users]);
  const availableCompanies = useMemo(() => getUniqueCompanies(users), [users]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesRole =
          roleFilter === "all" ||
          user.role
            .split(",")
            .map((role) => role.trim().toLowerCase())
            .includes(roleFilter.toLowerCase());

        const matchesCompany =
          companyFilter === "all" || user.companyName === companyFilter;

        return matchesRole && matchesCompany;
      }),
    [users, roleFilter, companyFilter]
  );

  const handleSort = (field: UserSortField) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const sortedUsers = useMemo(
    () => sortByField(filteredUsers, sortField, sortDirection),
    [filteredUsers, sortField, sortDirection]
  );

  const handleExport = () => {
    if (sortedUsers.length === 0) {
      toast.error("Nothing to export. Adjust your filters or search first.");
      return;
    }

    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      "First Name,Last Name,Role,Status,Email,Company,Last Login\n",
      sortedUsers.map((user) => [
        user.firstName,
        user.lastName,
        user.role,
        user.status,
        user.email,
        user.companyName,
        user.lastLogin,
      ]),
      `my_team_users_${dateStamp}.csv`
    );

    toast.success(
      `${sortedUsers.length} user${sortedUsers.length === 1 ? "" : "s"} exported to CSV.`
    );
  };

  const clearFilters = () => {
    setRoleFilter("all");
    setCompanyFilter("all");
  };

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const paginated = useMemo(
    () => sortedUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sortedUsers, currentPage]
  );
  useEffect(() => setCurrentPage(1), [searchQuery, fetchType, sortField, sortDirection, roleFilter, companyFilter]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              value={fetchType}
              onValueChange={(value) => {
                if (value) onFetchTypeChange(value as FetchType);
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
                  <Button type="button" size="sm" onClick={() => setFilterOpen(false)}>
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

      {/* Table */}
      <div className="relative glass-card overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="First Name"
                active={sortField === "firstName"}
                direction={sortDirection}
                onSort={() => handleSort("firstName")}
              />
              <SortableTableHead
                label="Last Name"
                active={sortField === "lastName"}
                direction={sortDirection}
                onSort={() => handleSort("lastName")}
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
            {!loading && paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((user) => (
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
                        {user.firstName.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{user.firstName}</p>
                  </div>
                </TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {user.companyName || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() =>
                        navigate("/edit-profile", {
                          state: { userId: user.id, user, source: "myteam" },
                        })
                      }>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {sortedUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            -{Math.min(currentPage * PAGE_SIZE, sortedUsers.length)} of {sortedUsers.length} users
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
    </div>
  );
};


const DelegateTable = ({
  users,
  searchQuery,
  setSearchQuery,
  loading = false,
}: {
  users: User[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  loading?: boolean;
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<DelegateSortField>("firstName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [managerFilter, setManagerFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = [managerFilter, companyFilter].filter(
    (value) => value !== "all"
  ).length;

  const availableManagers = useMemo(() => getUniqueManagers(users), [users]);
  const availableCompanies = useMemo(() => getUniqueCompanies(users), [users]);

  const searchFilteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.managerName.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const filteredUsers = useMemo(
    () =>
      searchFilteredUsers.filter((user) => {
        const matchesManager =
          managerFilter === "all" || user.managerName === managerFilter;

        const matchesCompany =
          companyFilter === "all" || user.companyName === companyFilter;

        return matchesManager && matchesCompany;
      }),
    [searchFilteredUsers, managerFilter, companyFilter]
  );

  const handleSort = (field: DelegateSortField) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const sortedUsers = useMemo(
    () => sortByField(filteredUsers, sortField, sortDirection),
    [filteredUsers, sortField, sortDirection]
  );

  const handleExport = () => {
    if (sortedUsers.length === 0) {
      toast.error("Nothing to export. Adjust your filters or search first.");
      return;
    }

    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      "First Name,Last Name,Manager,Status,Email,Company\n",
      sortedUsers.map((user) => [
        user.firstName,
        user.lastName,
        user.managerName,
        user.status,
        user.email,
        user.companyName,
      ]),
      `delegate_users_${dateStamp}.csv`
    );

    toast.success(
      `${sortedUsers.length} user${sortedUsers.length === 1 ? "" : "s"} exported to CSV.`
    );
  };

  const clearFilters = () => {
    setManagerFilter("all");
    setCompanyFilter("all");
  };

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const paginated = useMemo(
    () => sortedUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sortedUsers, currentPage]
  );
  useEffect(
    () => setCurrentPage(1),
    [searchQuery, sortField, sortDirection, managerFilter, companyFilter]
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          <div className="flex flex-wrap items-center gap-2">
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
                  <Label className="text-sm font-medium">Manager</Label>
                  <Select value={managerFilter} onValueChange={setManagerFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All managers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All managers</SelectItem>
                      {availableManagers.map((manager) => (
                        <SelectItem key={manager} value={manager}>
                          {manager}
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
                  <Button type="button" size="sm" onClick={() => setFilterOpen(false)}>
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

      {/* Table */}
      <div className="relative glass-card overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="First Name"
                active={sortField === "firstName"}
                direction={sortDirection}
                onSort={() => handleSort("firstName")}
              />
              <SortableTableHead
                label="Last Name"
                active={sortField === "lastName"}
                direction={sortDirection}
                onSort={() => handleSort("lastName")}
              />
              <SortableTableHead
                label="Manager"
                active={sortField === "managerName"}
                direction={sortDirection}
                onSort={() => handleSort("managerName")}
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
            {!loading && paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((user) => (
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
                  {user.managerName && user.managerName !== "—" ? (
                    <Badge variant="outline">{user.managerName}</Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {user.companyName || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() =>
                        navigate("/edit-profile", {
                          state: { userId: user.id, user, source: "myteam" },
                        })
                      }>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {sortedUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            -{Math.min(currentPage * PAGE_SIZE, sortedUsers.length)} of {sortedUsers.length} users
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
  const [manageDelegatesOpen, setManageDelegatesOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedManagerDepartment, setSelectedManagerDepartment] = useState("");
  const [selectedManagerDepartmentId, setSelectedManagerDepartmentId] = useState("");
  const [delegateReason, setDelegateReason] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [fetchType, setFetchType] = useState<FetchType>("ALL");
  const [managers, setManagers] = useState<
    {
      id: string;
      name: string;
      email: string;
      jobTitleName: string;
      departmentId: string;
      departmentName: string;
    }[]
  >([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [delegateLoading, setDelegateLoading] = useState(false);

  const handleSyncUsers = async () => {
    try {
      setSyncing(true);

      const res = await connectorFetch("/odoo/hr/employees/sync", {
        method: "POST",
        headers: acceptJsonHeaders,
        skipLoader: true,
      });

      if (!res.ok) {
        const body = await readResponseBody(res);
        toast.error(getApiErrorMessage(body, "Failed to sync users"));
        return;
      }

      toast.success("Users synced successfully");

      await fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(getErrorFromCatch(error, "Failed to sync users"));
    } finally {
      setSyncing(false);
    }
  };

  const fetchUsers = async () => {
    const userId = getUserId();

    if (!userId) {
      console.error("No userId in token");
      return;
    }

    setTeamLoading(true);

    try {
      const res = await identityFetch(`/users/${userId}?fetchType=${fetchType}`, {
        headers: acceptJsonHeaders,
        skipLoader: true,
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
      }

      if (!res.ok) {
        const body = await readResponseBody(res);
        throw new Error(getApiErrorMessage(body, "Failed to fetch user"));
      }

      const response = await res.json();

      const user = response.data;

      const mappedUsers = (user.subordinates || []).map((u: any) => ({
        id: String(u.id),
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email || "",
        role: "Employee",
        status: mapUserStatus(u),
        lastLogin: "—",
        departmentId: "",
        departmentName: "",
        managerName: u.managerName || "—",
        companyName:
          u.companyName ||
          u.company?.name ||
          u.company ||
          u.organizationName ||
          DEFAULT_COMPANY_NAME,
      }));

      setUsers(mappedUsers);
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers().catch((err) => console.error(err));
  }, [fetchType]);

  const resetDelegateModal = () => {
    setSelectedManagerId("");
    setSelectedManagerDepartment("");
    setSelectedManagerDepartmentId("");
    setDelegateReason("");
  };

  const fetchManagers = async () => {
    setManagersLoading(true);
    try {
      const res = await identityFetch("/users/managers?fetchType=ACTIVE", {
        headers: acceptJsonHeaders,
        skipLoader: true,
      });

      if (!res.ok) {
        const body = await readResponseBody(res);
        throw new Error(getApiErrorMessage(body, "Failed to fetch managers"));
      }

      const response = await res.json();
      const currentUserId = getUserId();
      const mapped = (response.data || []).flatMap((manager: any) => {
        const id = manager.id != null ? String(manager.id) : "";
        if (!id || (currentUserId && id === String(currentUserId))) {
          return [];
        }
        if (manager.isActive === false || manager.active === false) {
          return [];
        }

        const departmentId = manager.departmentId != null ? String(manager.departmentId) : "";
        const departmentName = manager.departmentName || "";
        if (!departmentId || !departmentName) {
          return [];
        }

        const name = `${manager.firstName || ""} ${manager.lastName || ""}`.trim()
          || manager.email
          || "Manager";

        return [{
          id,
          name,
          email: manager.email || "",
          jobTitleName: manager.jobTitleName || "",
          departmentId,
          departmentName,
        }];
      });

      setManagers(mapped);
    } catch (err) {
      console.error(err);
      toast.error(getErrorFromCatch(err, "Failed to fetch managers"));
      setManagers([]);
    } finally {
      setManagersLoading(false);
    }
  };

  const teamUsers = users;

  const [delegateUsers, setDelegateUsers] = useState<User[]>([]);

  const filteredTeam = teamUsers.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(teamSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const getUserId = () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId; // 👈 make sure this exists in token
    } catch {
      return null;
    }
  };

  const handleSelectManager = (managerId: string) => {
    setSelectedManagerId(managerId);
    const manager = managers.find((item) => item.id === managerId);
    const departmentName = manager?.departmentName || "";
    setSelectedManagerDepartment(departmentName);
    setSelectedManagerDepartmentId(manager?.departmentId || "");
    setDelegateReason(departmentName);
  };

  const handleSendRequest = async () => {
    if (!selectedManagerId) {
      toast.error("Please select a manager");
      return;
    }

    try {
      const response = await identityFetch("/delegates/request", {
        method: "POST",
        headers: acceptJsonHeaders,
        skipLoader: true,
        body: JSON.stringify({
          targetManagerId: Number(selectedManagerId),
          targetDepartmentId: selectedManagerDepartmentId
            ? Number(selectedManagerDepartmentId)
            : undefined,
          comments: delegateReason || selectedManagerDepartment || "",
        }),
      });

      if (!response.ok) {
        const body = await readResponseBody(response);
        toast.error(getApiErrorMessage(body, "Failed to send request"));
        return;
      }

      toast.success("Request sent successfully");
      setDelegateModalOpen(false);
      resetDelegateModal();
    } catch (error) {
      console.error(error);
      toast.error(getErrorFromCatch(error, "Failed to send request"));
    }
  };

  useEffect(() => {
    if (activeTab !== "delegate") return;

    fetchDelegateUsers();
  }, [activeTab]);

  const fetchDelegateUsers = async () => {
    setDelegateLoading(true);

    try {
      setDelegateUsers(await fetchDelegatedUsers());
    } catch (err) {
      console.error(err);
      toast.error(getErrorFromCatch(err, "Failed to fetch delegate users"));
    } finally {
      setDelegateLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold">{activeTab === "myteam" ? "My Team" : "Delegate"}</h1>
            <p className="text-muted-foreground">
              {activeTab === "myteam" ? "View your direct reports" : "View your delegated team members"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {activeTab === "myteam" && (
            <Button
              variant="outline"
              onClick={handleSyncUsers}
              disabled={syncing}
            >
              <Download className="h-4 w-4 mr-2" />
              {syncing ? "Syncing..." : "Sync"}
            </Button>
          )}

          {activeTab === "myteam" ? (
            <Button onClick={() => navigate("/users/create")}>
              <UserPlus className="h-4 w-4 mr-2" />
              New Team Member
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setManageDelegatesOpen(true)}>
                <Settings2 className="h-4 w-4 mr-2" />
                Manage Delegates
              </Button>
              <Button
                onClick={() => {
                  setDelegateModalOpen(true);
                  void fetchManagers();
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                New Delegate
              </Button>
            </>
          )}
        </div>
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
            fetchType={fetchType}
            onFetchTypeChange={setFetchType}
            loading={teamLoading}
          />
        </TabsContent>

        <TabsContent value="delegate" className="mt-6">
          <DelegateTable
            users={delegateUsers}
            searchQuery={delegateSearch}
            setSearchQuery={setDelegateSearch}
            loading={delegateLoading}
          />
        </TabsContent>
      </Tabs>

      {/* New Delegate Modal */}
      <Dialog
        open={delegateModalOpen}
        onOpenChange={(open) => {
          setDelegateModalOpen(open);
          if (!open) resetDelegateModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Delegate Request</DialogTitle>
            <DialogDescription>
              Select a manager to send a delegate request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Select
                value={selectedManagerId}
                onValueChange={handleSelectManager}
                disabled={managersLoading}
              >
                <SelectTrigger id="manager">
                  <SelectValue
                    placeholder={managersLoading ? "Loading managers..." : "Select a manager"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {[manager.name, manager.jobTitleName, manager.departmentName]
                        .filter(Boolean)
                        .join(" · ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedManagerDepartment ? (
              <div className="space-y-1">
                <Label>Department</Label>
                <p className="text-sm text-muted-foreground">{selectedManagerDepartment}</p>
              </div>
            ) : null}
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
              disabled={!selectedManagerId || managersLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ManageDelegatesDialog
        open={manageDelegatesOpen}
        onOpenChange={setManageDelegatesOpen}
        onDelegationsChanged={() => {
          void fetchDelegateUsers();
        }}
      />
    </motion.div>
  );
};