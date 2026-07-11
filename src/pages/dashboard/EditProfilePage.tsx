import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryCodeSelect } from "@/components/ui/country-code-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AppWindow, ArrowLeft, Camera, Save, Shield, Trash2, Upload, User, X } from "lucide-react";
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
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RequestedApplicationDialog } from "@/components/dashboard/RequestedApplicationDialog";
import { Plus, Trash2 as TrashIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";
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
export const EditProfilePage = () => {


  const location = useLocation();
  const fromPage = location.state?.from || "/users";
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

  const userId = passedUserId || tokenUser?.userId;
  const userEmail = passedUser?.email || tokenUser?.sub;
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableRoles, setAvailableRoles] = useState<
    { id: number; name: string }[]
  >([]);

  const [availableBlueprints, setAvailableBluePrints] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleToAdd, setRoleToAdd] = useState("");
  const [selectedBlueprint, setSelectedBlueprint] = useState("");

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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  type AssignedApp = {
    id: number;
    name: string;
    description: string;
    accessLevel: string;
    grantedDate: string;
    essential: boolean;
  };
  const [assignedApps, setAssignedApps] = useState<AssignedApp[]>([]);
  const [appToRemove, setAppToRemove] = useState<AssignedApp | null>(null);

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
      });
    }
  }, []);

  /* ---------------- FETCH USER ---------------- */

  useEffect(() => {

    const fetchUser = async () => {

      const token = localStorage.getItem("auth-token");

      try {

        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error();



        const data = await res.json();
        const user = data?.data || data;
        setCountryCode(user.countryCode || "US:+1");
        setSelectedRoles(user.roles || []);
        setSelectedBlueprint(user.blueprints?.[0] || "");

        setForm({
          employeeId: user.id || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          countryCode: user.countryCode || "US:+1",
          email: user.email || "",
          dob: user.dob ? user.dob.substring(0, 10) : "",
          ssn: user.maskedSsn ? user.maskedSsn : "", // ✅ FIX

        });

      } catch {

        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data",
        });

      }
    };

    if (userId) fetchUser();

  }, [userId, toast]);

  /* ---------------- FETCH ASSIGNED APPLICATIONS ---------------- */
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("auth-token");
    fetch(`${API_BASE_URL}/applications/users/${userId}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((res) => {
        const list = res?.data || res || [];
        const mapped: AssignedApp[] = list
          .filter((app: any) => app.active)
          .map((app: any) => ({
            id: app.id,
            name: app.name,
            description: app.description || "",
            accessLevel: app.accessLevel || "Standard",
            grantedDate: app.grantedDate
              ? new Date(app.grantedDate).toLocaleDateString()
              : "",
            essential: app.essential || false,
          }));
        setAssignedApps(mapped);
      })
      .catch(() => setAssignedApps([]));
  }, [userId]);

  const confirmRemoveApp = () => {
    if (!appToRemove) return;
    setAssignedApps((prev) => prev.filter((a) => a.id !== appToRemove.id));
    toast({
      title: "Application Removed",
      description: `${appToRemove.name} was removed from the user's assignments.`,
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

  const handleBluePrintSelect = (blueprint: string) => {
    setSelectedBlueprint(blueprint);
  };

  const removeRole = (roleName: string) => {
    setSelectedRoles(selectedRoles.filter((role) => role !== roleName));
  };

  const removeBluePrint = () => {
    setSelectedBlueprint("");
  };

  useEffect(() => {
    const fetchRoles = async () => {
      const token = localStorage.getItem("auth-token");

      try {
        const res = await fetch(`${API_BASE_URL}/roles`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        // Supports ["admin","user"] OR {data:["admin","user"]}
        const roles = data?.data || [];

        setAvailableRoles(
          roles.map((role: any) => ({
            id: role.id,
            name: role.name,
          }))
        );
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load roles",
        });
      }
    };

    fetchRoles();
  }, [toast]);


  useEffect(() => {
    const fetchBluePrints = async () => {
      const token = localStorage.getItem("auth-token");

      try {
        const res = await fetch(`${API_BASE_URL}/blueprints`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        // Supports ["admin","user"] OR {data:["admin","user"]}
        const roles = data?.data || [];

        setAvailableBluePrints(
          roles.map((role: any) => ({
            id: role.id,
            name: role.name,
          }))
        );
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load blueprints",
        });
      }
    };

    fetchBluePrints();
  }, [toast]);

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

    const token = localStorage.getItem("auth-token");

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
    };

    try {

      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast({
        title: "Profile Updated",
        description: "User profile updated successfully",
      });

      navigate(fromPage);

    } catch {

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });

    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- CLEAR ---------------- */

  const handleClear = () => {
    setForm({
      employeeId: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      countryCode: "",
      email: "",
      dob: "",
      ssn: "",
    });
    setCountryCode("US:+1"); // Reset country code selector
    setPhotoPreview(null);
    setErrors({});
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
            <h1 className="text-2xl font-bold text-foreground">Edit Team Member</h1>
            <p className="text-muted-foreground text-sm">
              Update your personal information
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
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  disabled
                />
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
                          value={bp.name}
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

              </div>

            </CardContent>

          </Card>

        </motion.div>

        {/* Requested / Assigned Applications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <AppWindow className="h-4 w-4 text-primary" />
                </div>
                Requested Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedApps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications assigned to this user.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignedApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-md border border-border bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground truncate">
                            {app.name}
                          </span>
                          {app.essential && (
                            <Shield className="h-3.5 w-3.5 text-warning shrink-0" />
                          )}
                        </div>
                        {app.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {app.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {app.accessLevel}
                          </Badge>
                          {app.grantedDate && (
                            <Badge variant="outline" className="text-xs">
                              Granted: {app.grantedDate}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!app.essential && (
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
              )}
            </CardContent>
          </Card>
        </motion.div>

        <AlertDialog open={!!appToRemove} onOpenChange={(v) => !v && setAppToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Application</AlertDialogTitle>
              <AlertDialogDescription>
                Remove <strong>{appToRemove?.name}</strong> from this user's
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

          <Button variant="outline" type="button" onClick={handleClear}>
            Clear
          </Button>

          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>

        </motion.div>

      </form>

    </motion.div>
  );
};