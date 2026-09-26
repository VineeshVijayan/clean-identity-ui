import { ApplicationStatusBadge } from "@/components/dashboard/ApplicationStatusBadge";
import {
  RequestedApplicationDialog,
  type RequestedApplicationPayload,
} from "@/components/dashboard/RequestedApplicationDialog";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryCodeSelect } from "@/components/ui/country-code-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AppWindow, ArrowLeft, Camera, Plus, Save, Shield, Trash2, Upload, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { identityFetch } from "@/services/api-config";
import { getApiErrorMessage, getErrorFromCatch, mapBlueprintOptions, readResponseBody } from "@/lib/api-errors";
import {
  flattenPendingRequests,
  flattenUserApplications,
  formatAccessLine,
  formatDate,
  toUserApplicationPayload,
} from "@/lib/application-access";
import {
  getUserProfile,
  updateUserProfile,
  type FlattenedApplicationAccess,
} from "@/services/application-api";
import { getUserDetails, getUserRoles } from "@/services/jwt-service";

const getUserFromToken = () => {
  const token = localStorage.getItem("auth-token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") as {
      userId?: string | number;
    };
  } catch {
    return {};
  }
};

type ManagerOption = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
};

const mapManagerUsers = (users: unknown[]): ManagerOption[] =>
  users.map((manager) => {
    const item = manager as {
      id: number;
      firstName?: string;
      lastName?: string;
      email?: string;
      active?: boolean;
    };

    return {
      id: item.id,
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      email: item.email || "",
      active: item.active ?? true,
    };
  });

const fetchManagers = async (): Promise<ManagerOption[]> => {
  const res = await identityFetch("/users/managers?fetchType=ACTIVE", {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await readResponseBody(res);
    throw new Error(getApiErrorMessage(body, "Failed to load managers"));
  }

  const data = await res.json();
  const users = data?.data ?? (Array.isArray(data) ? data : []);
  return mapManagerUsers(users);
};
export const EditProfilePage = () => {


  const location = useLocation();
  const source: "myteam" | "navbar" | "useradmin" =
    location.state?.source || (location.state?.userId ? "useradmin" : "navbar");

  const passedUserId = location.state?.userId;
  const passedUser = location.state?.user;
  const [countryCode, setCountryCode] = useState("US:+1");


  // Field-level edit permissions based on source
  const employeeIdDisabled = true; // Non-editable across all three sources
  const rolesDisabled = source === "myteam" || source === "navbar";

  // fallback (optional)
  const tokenUser = getUserFromToken();
  const storedUser = getStoredUser();

  const userId =
    passedUserId ||
    tokenUser?.userId ||
    storedUser.userId ||
    tokenUser?.id;
  const currentUserId = getUserDetails()?.userId || tokenUser?.userId || storedUser.userId;
  const isSelfEdit = String(userId) === String(currentUserId);
  const isSuperAdmin = getUserRoles().some(
    (role) => role?.toLowerCase() === "super_admin"
  );
  const userEmail = passedUser?.email || tokenUser?.sub;
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableRoles, setAvailableRoles] = useState<
    { id: number; name: string }[]
  >([]);

  const [availableBlueprints, setAvailableBluePrints] = useState<
    { id: number | string; name: string }[]
  >([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleToAdd, setRoleToAdd] = useState("");
  const [selectedBlueprint, setSelectedBlueprint] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [existingManagerName, setExistingManagerName] = useState<string | null>(null);
  const [availableManagers, setAvailableManagers] = useState<
    { id: number; firstName: string; lastName: string; email: string; active: boolean }[]
  >([]);

  /* ---------------- GET USER FROM LOCAL STORAGE ---------------- */

  /* ---------------- STATES ---------------- */

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    countryCode: "",
    email: "",
    dob: "",
    ssn: "",
    companyName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [assignedApps, setAssignedApps] = useState<FlattenedApplicationAccess[]>([]);
  const [pendingApps, setPendingApps] = useState<FlattenedApplicationAccess[]>([]);
  const [appToRemove, setAppToRemove] = useState<FlattenedApplicationAccess | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [draftApps, setDraftApps] = useState<FlattenedApplicationAccess[]>([]);
  const [appsLoaded, setAppsLoaded] = useState(false);

  useEffect(() => {
    if (passedUser) {
      setForm({
        employeeId: passedUser.id || "",
        firstName: passedUser.firstName || "",
        lastName: passedUser.lastName || "",
        phoneNumber: "",
        countryCode: passedUser.countryCode || "US:+1",
        email: passedUser.email || "",
        dob: "",
        ssn: "",
        companyName: passedUser.companyName || "Parent Company",
      });
    }
  }, []);

  const applyApplicationState = (
    applications: Parameters<typeof flattenUserApplications>[0],
    pendingRequests: Parameters<typeof flattenPendingRequests>[0]
  ) => {
    setAssignedApps(flattenUserApplications(applications));
    setPendingApps(flattenPendingRequests(pendingRequests));
    setDraftApps([]);
    setAppsLoaded(true);
  };

  /* ---------------- FETCH USER ---------------- */

  useEffect(() => {

    const fetchUser = async () => {
      try {
        const user = await getUserProfile(userId);

        setCountryCode(user.countryCode || "US:+1");
        setSelectedRoles(user.roles || []);
        setSelectedBlueprint(user.blueprints?.[0] || "");
        setSelectedManagerId(user.manager ?? null);
        setExistingManagerName(user.managerName ?? null);

        setForm({
          employeeId: user.id != null ? String(user.id) : "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          countryCode: user.countryCode || "US:+1",
          email: user.email || "",
          dob: user.dob ? user.dob.substring(0, 10) : "",
          ssn: user.maskedSsn ? user.maskedSsn : "",
          companyName: user.companyName ? user.companyName : "Parent Company",
        });
        applyApplicationState(user.applications, user.pendingApplicationAccessRequests);
      } catch (err) {

        toast({
          variant: "destructive",
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load user data"),
        });

      }
    };

    if (userId) fetchUser();

  }, [userId, toast]);

  const confirmRemoveApp = () => {
    if (!appToRemove) return;
    setAssignedApps((prev) => prev.filter((a) => a.key !== appToRemove.key));
    toast({
      title: "Application Removed",
      description: `${appToRemove.applicationName} will be removed when you save the profile.`,
    });
    setAppToRemove(null);
  };


  const handleRoleSelect = (roleName: string) => {
    if (!selectedRoles.includes(roleName)) {
      setSelectedRoles([...selectedRoles, roleName]);
    }

    // Reset dropdown placeholder after selection
    setRoleToAdd("");
  };

  const handleBluePrintSelect = (blueprintId: string) => {
    const selected = availableBlueprints.find(
      (blueprint) => String(blueprint.id) === blueprintId
    );

    if (!selected) return;

    setSelectedBlueprint(selected.name);
  };

  const removeRole = (roleName: string) => {
    setSelectedRoles(selectedRoles.filter((role) => role !== roleName));
  };

  const removeBluePrint = () => {
    setSelectedBlueprint("");
  };

  const handleManagerSelect = (managerId: string) => {
    const selected = availableManagers.find(
      (manager) => String(manager.id) === managerId
    );

    if (!selected) return;

    setSelectedManagerId(selected.id);
    setExistingManagerName(
      `${selected.firstName} ${selected.lastName}`.trim() || selected.email || null
    );
  };

  const removeManager = () => {
    setSelectedManagerId(null);
    setExistingManagerName(null);
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await identityFetch("/roles");

        if (!res.ok) {
          const body = await readResponseBody(res);
          toast({
            variant: "destructive",
            title: "Error",
            description: getApiErrorMessage(body, "Failed to load roles"),
          });
          return;
        }

        const data = await res.json();

        // Supports ["admin","user"] OR {data:["admin","user"]}
        const roles = data?.data || [];

        setAvailableRoles(
          roles.map((role: any) => ({
            id: role.id,
            name: role.name,
          }))
        );
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load roles"),
        });
      }
    };

    fetchRoles();
  }, [toast]);


  useEffect(() => {
    const fetchBluePrints = async () => {
      try {
        const res = await identityFetch("/blueprints");

        if (!res.ok) {
          const body = await readResponseBody(res);
          toast({
            variant: "destructive",
            title: "Error",
            description: getApiErrorMessage(body, "Failed to load blueprints"),
          });
          return;
        }

        const data = await res.json();

        setAvailableBluePrints(mapBlueprintOptions(data));
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load blueprints"),
        });
      }
    };

    fetchBluePrints();
  }, [toast]);

  useEffect(() => {
    if (!isSuperAdmin) return;

    const loadManagers = async () => {
      try {
        const managers = await fetchManagers();
        setAvailableManagers(
          userId
            ? managers.filter((manager) => String(manager.id) !== String(userId))
            : managers
        );
      } catch (err) {
        setAvailableManagers([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load managers"),
        });
      }
    };

    loadManagers();
  }, [isSuperAdmin, userId, toast]);

  /* ---------------- UPDATE FORM ---------------- */

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  /* ---------------- PHOTO ---------------- */

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ---------------- VALIDATION ---------------- */

  const nameRegex = /^[A-Za-z\s]+$/;
  const phoneRegex = /^[0-9]{10,15}$/;

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "firstName":
        if (!value.trim()) return "First Name is required.";
        if (!nameRegex.test(value)) return "First name cannot contain numbers.";
        return "";
      case "lastName":
        if (!value.trim()) return "Last Name is required.";
        if (!nameRegex.test(value)) return "Last name cannot contain numbers.";
        return "";
      case "phoneNumber":
        if (!value.trim()) return "Phone number is required.";
        if (!phoneRegex.test(value)) return "Enter a valid phone number.";
        return "";
      case "dob":
        if (!value) return "Date of Birth is required.";
        {
          const d = new Date(value);
          const today = new Date();
          d.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          if (d > today) return "Future date is not allowed.";
        }
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {
      employeeId: form.employeeId ? "" : "Employee ID is required.",
      firstName: validateField("firstName", form.firstName),
      lastName: validateField("lastName", form.lastName),
      phoneNumber: validateField("phoneNumber", form.phoneNumber),
      dob: validateField("dob", form.dob),
    };
    if (selectedRoles.length === 0) newErrors.role = "At least one role is required.";
    if (!selectedBlueprint) newErrors.blueprint = "Blueprint is required.";

    // Remove empty
    Object.keys(newErrors).forEach((k) => {
      if (!newErrors[k]) delete newErrors[k];
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const focusOrder = ["firstName", "lastName", "dob", "phoneNumber"];
      for (const f of focusOrder) {
        if (newErrors[f]) {
          document.getElementById(`edit-${f}`)?.focus();
          break;
        }
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- UPDATE USER ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      employeeId: form.employeeId,
      username: form.email,
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,

      phoneNumber: form.phoneNumber,
      countryCode: countryCode,
      ssn: form.ssn,
      dob: form.dob ? new Date(form.dob).toISOString() : null,
      roles: selectedRoles,
      blueprints: selectedBlueprint ? [selectedBlueprint] : [],
      ...(isSuperAdmin ? { manager: selectedManagerId } : {}),
      ...(appsLoaded
        ? { applications: toUserApplicationPayload([...assignedApps, ...draftApps]) }
        : {}),
    };

    try {
      const updated = await updateUserProfile(userId, payload);
      applyApplicationState(updated.applications, updated.pendingApplicationAccessRequests);

      const accessMessage = updated.applicationAccessMessage;
      toast({
        title: "Profile Updated",
        description: isSelfEdit && accessMessage
          ? accessMessage.replace(
              "Profile updated. Application access request has been submitted for manager approval.",
              "Application access request submitted for manager approval."
            )
          : accessMessage || "User profile updated successfully",
      });
    } catch (err) {

      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorFromCatch(err, "Failed to update profile"),
      });

    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- ANIMATION ---------------- */

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto space-y-6"
    >

      {/* Header */}

      <motion.div variants={itemVariants} className="flex items-center gap-4">

        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">

          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isSelfEdit ? "Edit Profile" : "Edit Team Member"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSelfEdit
                ? "Update your personal information"
                : "Update this team member's information"}
            </p>
          </div>

        </div>

      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Photo Card */}

        <motion.div variants={itemVariants}>

          <Card>

            <CardHeader className="pb-4">
              <CardTitle className="text-base">Profile Photo</CardTitle>
            </CardHeader>

            <CardContent>

              <div className="flex flex-col sm:flex-row items-center gap-6">

                <div className="relative">

                  <Avatar className="w-24 h-24 border-2 border-border">

                    <AvatarImage src={photoPreview || ""} />

                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                      {form.firstName.charAt(0) || "U"}
                      {form.lastName.charAt(0)}
                    </AvatarFallback>

                  </Avatar>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary text-primary-foreground shadow-md"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>

                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                <div className="flex flex-col gap-2 items-start">

                  <p className="text-sm text-muted-foreground">
                    Upload a profile photo (JPG, PNG)
                  </p>

                  <div className="flex gap-2">

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-2" />
                      Upload Photo
                    </Button>

                    {photoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPhotoPreview(null)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Remove
                      </Button>
                    )}

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>

        </motion.div>

        {/* Personal Info */}

        <motion.div variants={itemVariants}>

          <Card>

            <CardHeader className="pb-4">
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">

              <div className="space-y-1.5">
                <Label>Employee ID</Label>
                <Input
                  value={form.employeeId}
                  onChange={(e) => set("employeeId", e.target.value)}
                  disabled={employeeIdDisabled}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                    onBlur={(e) => handleBlur("firstName", e.target.value)}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                    onBlur={(e) => handleBlur("lastName", e.target.value)}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>

              </div>

              <div className="space-y-1.5">
                <Label>Phone Number <span className="text-red-500">*</span></Label>

                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <CountryCodeSelect
                      value={form.countryCode}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          countryCode: value,
                        }))
                      }
                    />
                  </div>

                  <Input
                    id="edit-phoneNumber"
                    value={form.phoneNumber}
                    type="tel"
                    maxLength={10}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    onBlur={(e) => handleBlur("phoneNumber", e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    className="flex-1"
                  />
                </div>


                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    value={form.email}
                    disabled
                  />
                </div>

                <div className="space-y-3">
                  <Label>Company</Label>

                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                      {form.companyName || "Parent Company"}
                    </div>
                  </div>
                </div>

              </div>
              <div className="grid sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">
                  <Label htmlFor="edit-dob">Date of Birth <span className="text-red-500">*</span></Label>

                  <Input
                    id="edit-dob"
                    type="date"
                    value={form.dob}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => set("dob", e.target.value)}
                    onBlur={(e) => handleBlur("dob", e.target.value)}
                  />

                  {errors.dob && (
                    <p className="text-sm text-red-500">{errors.dob}</p>
                  )}
                </div>


                <div className="space-y-1.5">
                  <Label>SSN <span className="text-red-500">*</span></Label>

                  <Input
                    value={form.ssn}
                    disabled
                  />

                  {errors.ssn && (
                    <p className="text-sm text-red-500">{errors.ssn}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Roles</Label>

                  {!rolesDisabled && (
                    <Select
                      value={roleToAdd}
                      onValueChange={(value) => {
                        setRoleToAdd(value);
                        handleRoleSelect(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add role" />
                      </SelectTrigger>

                      <SelectContent>
                        {availableRoles
                          .filter((role) => !selectedRoles.includes(role.name))
                          .map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Selected Role Chips */}
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.length === 0 && rolesDisabled && (
                      <span className="text-sm text-muted-foreground">No roles assigned</span>
                    )}
                    {selectedRoles.map((role) => (
                      <div
                        key={role}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        <span>
                          {role
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </span>

                        {!rolesDisabled && (
                          <button
                            type="button"
                            onClick={() => removeRole(role)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role}</p>
                  )}
                </div>


                <div className="space-y-3">
                  <Label>Blueprints</Label>

                  <Select
                    value=""
                    onValueChange={handleBluePrintSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Blueprint" />
                    </SelectTrigger>

                    <SelectContent>
                      {availableBlueprints.map((bp) => (
                        <SelectItem
                          key={bp.id}
                          value={String(bp.id)}
                        >
                          {bp.name
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, c => c.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected Blueprints Chips */}
                  <div className="flex flex-wrap gap-2">
                    {selectedBlueprint && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        <span>{selectedBlueprint}</span>

                        <button
                          type="button"
                          onClick={removeBluePrint}
                          className="hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {errors.blueprint && (
                    <p className="text-sm text-destructive">
                      {errors.blueprint}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Manager</Label>

                  {isSuperAdmin ? (
                    <>
                      <Select
                        value={
                          selectedManagerId != null ? String(selectedManagerId) : ""
                        }
                        onValueChange={handleManagerSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Manager" />
                        </SelectTrigger>

                        <SelectContent>
                          {availableManagers.map((manager) => (
                            <SelectItem key={manager.id} value={String(manager.id)}>
                              {`${manager.firstName} ${manager.lastName}`.trim()}
                              {manager.email ? ` (${manager.email})` : ""}
                              {!manager.active ? " — Inactive" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex flex-wrap gap-2">
                        {existingManagerName && (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                            <span>{existingManagerName}</span>

                            <button
                              type="button"
                              onClick={removeManager}
                              className="hover:text-destructive"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      {existingManagerName || "—"}
                    </p>
                  )}
                </div>

              </div>

            </CardContent>

          </Card>

        </motion.div>

        {/* Requested / Assigned Applications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <AppWindow className="h-4 w-4 text-primary" />
                </div>
                Application
              </CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowRequestDialog(true)}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {isSelfEdit ? "Request Access" : "Add"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                {isSelfEdit
                  ? "Application access you add here is submitted for manager approval. It will not be granted until approved."
                  : "Application access you add here is granted when you save this profile."}
              </p>
              {assignedApps.length === 0 && pendingApps.length === 0 && draftApps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications requested yet. Click "{isSelfEdit ? "Request Access" : "Add"}" to add one.
                </p>
              ) : (
                <>
                  {assignedApps.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Granted access
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {assignedApps.map((app) => (
                          <div
                            key={app.key}
                            className="flex items-start justify-between gap-3 p-3 rounded-md border border-border bg-muted/30"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-foreground truncate">
                                  {app.applicationName}
                                </span>
                                {app.essential && (
                                  <Shield className="h-3.5 w-3.5 text-warning shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatAccessLine(app)}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <ApplicationStatusBadge status="COMPLETED" label="Granted" />
                                {app.grantedDate && (
                                  <Badge variant="outline" className="text-xs">
                                    Granted: {formatDate(app.grantedDate)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {!isSelfEdit && !app.essential && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setAppToRemove(app)}
                                className="text-muted-foreground hover:text-destructive shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(pendingApps.length > 0 || draftApps.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Pending requests
                      </p>
                      <div className="space-y-2">
                        {pendingApps.map((r) => (
                          <div
                            key={r.key}
                            className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-sm text-foreground">
                                  {r.applicationName}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {formatAccessLine(r)}
                                </Badge>
                              </div>
                              <ApplicationStatusBadge status={r.requestStatus} />
                            </div>
                          </div>
                        ))}
                        {draftApps.map((r, idx) => (
                          <div
                            key={r.key}
                            className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-sm text-foreground">
                                  {r.applicationName}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {formatAccessLine(r)}
                                </Badge>
                              </div>
                              <ApplicationStatusBadge
                                status={isSelfEdit ? "PENDING" : "APPROVED"}
                                label={
                                  isSelfEdit
                                    ? "Pending Approval"
                                    : "Will be granted on save"
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDraftApps((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <RequestedApplicationDialog
          open={showRequestDialog}
          onOpenChange={setShowRequestDialog}
          submitLabel={isSelfEdit ? "Add to Request" : "Add Access"}
          onSubmitted={(entry: RequestedApplicationPayload) => {
            const next: FlattenedApplicationAccess = {
              key: `${entry.applicationId}|${entry.projectKey}|${entry.roleId}`,
              applicationId: Number(entry.applicationId),
              applicationName: entry.applicationName,
              description: "",
              essential: false,
              grantedDate: "",
              resourceName: entry.projectName || entry.projectKey,
              resourceKey: entry.projectKey,
              resourceId: entry.projectId,
              roleName: entry.roleName,
              roleId: entry.roleId,
            };
            const exists =
              assignedApps.some((app) => app.key === next.key) ||
              pendingApps.some((app) => app.key.endsWith(next.key)) ||
              draftApps.some((app) => app.key === next.key);
            if (exists) {
              toast({
                title: "Already added",
                description: "This application access is already on the profile.",
              });
              return;
            }
            setDraftApps((prev) => [...prev, next]);
          }}
        />


        <AlertDialog open={!!appToRemove} onOpenChange={(v) => !v && setAppToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Application</AlertDialogTitle>
              <AlertDialogDescription>
                Remove <strong>{appToRemove?.applicationName}</strong> from this user's
                assigned applications?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveApp}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Actions */}



        <motion.div variants={itemVariants} className="flex justify-end gap-3">
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>

        </motion.div>

      </form>

    </motion.div>
  );
};