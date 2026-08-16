import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { identityFetch } from "@/services/api-config";
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import { motion } from "framer-motion";
import { Building2, ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Edit, Filter, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


interface Company {
  id: string;
  name: string;
  location: string;
  phoneNumber: string;
  primaryContact: string;
  approverId: number;
  isEnabled: boolean;
}

interface Approver {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

type FetchType = "ALL" | "ACTIVE" | "INACTIVE";

type SortDirection = "asc" | "desc";

type CompanySortField =
  | "name"
  | "location"
  | "phoneNumber"
  | "primaryContact"
  | "status";

const getCompanySortValue = (
  company: Company,
  field: CompanySortField,
  statusMap: Record<string, boolean>
) => {
  if (field === "status") {
    const isActive = statusMap[company.id] ?? company.isEnabled;
    return isActive ? "active" : "inactive";
  }

  return String(company[field] ?? "").toLowerCase();
};

const sortCompanies = (
  companies: Company[],
  field: CompanySortField,
  direction: SortDirection,
  statusMap: Record<string, boolean>
) => {
  return [...companies].sort((a, b) => {
    const comparison = getCompanySortValue(a, field, statusMap).localeCompare(
      getCompanySortValue(b, field, statusMap)
    );
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

export const ManageCompanyPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
  const [fetchType, setFetchType] = useState<FetchType>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [sortField, setSortField] = useState<CompanySortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [locationFilter, setLocationFilter] = useState("all");
  const [approverFilter, setApproverFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const PAGE_SIZE = 20;

  const activeFilterCount = [locationFilter, approverFilter].filter(
    (value) => value !== "all"
  ).length;

  const getApproverName = (approverId: number) => {
    const approver = approvers.find((item) => item.id === approverId);
    if (!approver) return "";
    return `${approver.firstName} ${approver.lastName}`.trim();
  };

  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    companies.forEach((company) => {
      if (company.location?.trim()) {
        locations.add(company.location);
      }
    });
    return Array.from(locations).sort((a, b) => a.localeCompare(b));
  }, [companies]);

  const handleSort = (field: CompanySortField) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return companies.filter((company) => {
      const matchesSearch =
        !q ||
        company.name.toLowerCase().includes(q) ||
        company.location.toLowerCase().includes(q) ||
        company.primaryContact.toLowerCase().includes(q) ||
        company.phoneNumber.toLowerCase().includes(q);

      const matchesLocation =
        locationFilter === "all" || company.location === locationFilter;

      const matchesApprover =
        approverFilter === "all" ||
        String(company.approverId) === approverFilter;

      return matchesSearch && matchesLocation && matchesApprover;
    });
  }, [companies, search, locationFilter, approverFilter]);

  const clearFilters = () => {
    setLocationFilter("all");
    setApproverFilter("all");
  };

  const sorted = useMemo(
    () => sortCompanies(filtered, sortField, sortDirection, statusMap),
    [filtered, sortField, sortDirection, statusMap]
  );

  const handleExport = () => {
    if (sorted.length === 0) {
      toast.error("Nothing to export. Adjust your filters or search first.");
      return;
    }

    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      "Company Name,Location,Phone Number,Primary Contact,Status,Approver\n",
      sorted.map((company) => {
        const isActive = statusMap[company.id] ?? company.isEnabled;
        return [
          company.name,
          company.location,
          company.phoneNumber,
          company.primaryContact,
          isActive ? "Active" : "Inactive",
          getApproverName(company.approverId),
        ];
      }),
      `companies_${dateStamp}.csv`
    );

    toast.success(
      `${sorted.length} compan${sorted.length === 1 ? "y" : "ies"} exported to CSV.`
    );
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = useMemo(
    () => sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sorted, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fetchType, sortField, sortDirection, locationFilter, approverFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const handleEdit = (company: Company) => {
    const isActive = statusMap[company.id] ?? company.isEnabled;
    if(!isActive){
      return;
    }
    setEditing({ ...company });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const res = await identityFetch(`/companies/${editing.id}`, {
        method: "PUT",
        skipLoader: true,
        body: JSON.stringify({
          name: editing.name,
          location: editing.location,
          phoneNumber: editing.phoneNumber,
          approverId: editing.approverId,
          contact: {
            firstName: editing.primaryContact.split(" ")[0],
            lastName: editing.primaryContact.split(" ")[1] || "",
          },
        }),
      });

      if (!res.ok) {
        const body = await readResponseBody(res);
        toast.error(getApiErrorMessage(body, "Update failed"));
        return;
      }

      // update UI
      setCompanies((prev) =>
        prev.map((c) => (c.id === editing.id ? editing : c))
      );

      setEditOpen(false);
      toast.success("Company updated successfully");

    } catch (err) {
      toast.error(getErrorFromCatch(err, "Update failed"));
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);

      try {
        const res = await identityFetch(`/companies?fetchType=${fetchType}`, {
          skipLoader: true,
        });
        const data = await res.json();

        const list = data.data || data;

        const mapped = list.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          location: c.location,
          phoneNumber: c.phoneNumber,
          primaryContact: c.contactName || "",
          approverId: c.approverId,
          isEnabled: c.enabled,
        }));

        setCompanies(mapped);
        setStatusMap(
          Object.fromEntries(
            mapped.map((c) => [c.id, c.enabled])
          )
        );

      } catch (err) {
        console.error("Failed to load companies", err);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, [fetchType]);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const res = await identityFetch(`/users/managers?fetchType=${fetchType}`, {
          skipLoader: true,
        });

        if (!res.ok) {
          const body = await readResponseBody(res);
          console.error(getApiErrorMessage(body, "Failed to load approvers"));
          return;
        }

        const data = await res.json();
        const list = data.data || data;

        setApprovers(list);
      } catch (err) {
        console.error(getErrorFromCatch(err, "Failed to load approvers"), err);
      }
    };

    fetchApprovers();
  }, [fetchType]);

  const toggleStatus = async (company: Company) => {

    const newStatus = !(statusMap[company.id] ?? company.isEnabled);
  
    try {
      const response = await identityFetch(`/companies/${company.id}`, {
        method: "PUT",
        skipLoader: true,
        body: JSON.stringify({
          name: company.name,
          location: company.location,
          phoneNumber: company.phoneNumber,
          approverId: company.approverId,
          isEnabled: newStatus,
        }),
      });
  
      if (!response.ok) {
        const body = await readResponseBody(response);
        toast.error(getApiErrorMessage(body, "Failed to update company status"));
        return;
      }
  
      setStatusMap((prev) => ({
        ...prev,
        [company.id]: newStatus,
      }));
  
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id
            ? { ...c, isEnabled: newStatus }
            : c
        )
      );
  
      toast.success(
        `Company ${newStatus ? "activated" : "deactivated"} successfully`
      );
  
    } catch (err) {
      toast.error(getErrorFromCatch(err, "Failed to update company status"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Manage Companies</h1>
            <p className="text-muted-foreground">View and edit company details</p>
          </div>
        </div>
        <Button onClick={() => navigate("/company/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Company
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
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
                <ToggleGroupItem value="ALL" aria-label="Show all companies">
                  All
                </ToggleGroupItem>
                <ToggleGroupItem value="ACTIVE" aria-label="Show active companies">
                  Active
                </ToggleGroupItem>
                <ToggleGroupItem value="INACTIVE" aria-label="Show inactive companies">
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
                    <Label className="text-sm font-medium">Location</Label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All locations</SelectItem>
                        {availableLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Approver</Label>
                    <Select value={approverFilter} onValueChange={setApproverFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All approvers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All approvers</SelectItem>
                        {approvers.map((approver) => (
                          <SelectItem key={approver.id} value={String(approver.id)}>
                            {approver.firstName} {approver.lastName}
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

          <div className="relative rounded-lg border border-border overflow-hidden">
            {companiesLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    label="Company Name"
                    active={sortField === "name"}
                    direction={sortDirection}
                    onSort={() => handleSort("name")}
                  />
                  <SortableTableHead
                    label="Location"
                    active={sortField === "location"}
                    direction={sortDirection}
                    onSort={() => handleSort("location")}
                  />
                  <SortableTableHead
                    label="Phone Number"
                    active={sortField === "phoneNumber"}
                    direction={sortDirection}
                    onSort={() => handleSort("phoneNumber")}
                  />
                  <SortableTableHead
                    label="Primary Contact"
                    active={sortField === "primaryContact"}
                    direction={sortDirection}
                    onSort={() => handleSort("primaryContact")}
                  />
                  <SortableTableHead
                    label="Status"
                    active={sortField === "status"}
                    direction={sortDirection}
                    onSort={() => handleSort("status")}
                  />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!companiesLoading && sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((company) => {
                    const isActive = statusMap[company.id] ?? company.isEnabled;
                    return (
                      <TableRow
                        key={company.id}
                        className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-50"}`}
                      >
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.location}</TableCell>
                        <TableCell>{company.phoneNumber}</TableCell>
                        <TableCell>{company.primaryContact}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => toggleStatus(company)}
                              aria-label={`Toggle status for ${company.name}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(company)}
                            disabled ={!isActive}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              {sorted.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
              -{Math.min(currentPage * PAGE_SIZE, sorted.length)} of{" "}
              {sorted.length} companies
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
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Company Name</Label>
                <Input
                  id="edit-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editing.phoneNumber}
                  onChange={(e) => setEditing({ ...editing, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Primary Contact</Label>
                <Input
                  id="edit-contact"
                  value={editing.primaryContact}
                  onChange={(e) => setEditing({ ...editing, primaryContact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Approver</Label>

                <Select
                  value={String(editing.approverId)}
                  onValueChange={(value) =>
                    setEditing({
                      ...editing,
                      approverId: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>

                  <SelectContent>
                    {approvers.map((approver) => (
                      <SelectItem
                        key={approver.id}
                        value={String(approver.id)}
                      >
                        {approver.firstName} {approver.lastName} ({approver.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
