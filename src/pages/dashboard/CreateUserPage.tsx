import { RequestedApplicationDialog } from "@/components/dashboard/RequestedApplicationDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CountryCodeSelect } from "@/components/ui/country-code-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AppWindow, ArrowLeft, Camera, Plus, Save, Trash2, Upload, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { identityFetch } from "@/services/api-config";
import { getApiErrorMessage, getErrorFromCatch, mapBlueprintOptions, mapApiError, networkError, readResponseBody } from "@/lib/api-errors";

export const CreateUserPage = () => {

  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [idfRoles, setIDFRoles] = useState<string[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [defaultCompanyId, setDefaultCompanyId] = useState<number | null>(null);

  const extractCompanyId = (user: {
    companyId?: number | string;
    company?: { id?: number | string };
  }) => {
    if (user.companyId != null && user.companyId !== "") {
      return Number(user.companyId);
    }
    if (user.company?.id != null) {
      return Number(user.company.id);
    }
    return null;
  };

  const getUserFromToken = () => {

    const token = localStorage.getItem("auth-token");

    if (!token) return null;

    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };


  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showIDFRoles, setShowIDFRoles] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestedApps, setRequestedApps] = useState<
    { applicationId: string; applicationName: string; projectKey: string; roleId: string; roleName: string }[]
  >([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "US:+1",
    ssn: "",
    dob: "",
    role: "",
    idfRoles: [] as string[],
    companyId: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "",
    dob: "",
    ssn: "",
    address: "",
  });

  useEffect(() => {
    const tokenUser = getUserFromToken();
    const userRoles: string[] = tokenUser?.roles || [];
    const isSuperAdmin = userRoles.includes("super_admin");
    const hasAccess = isSuperAdmin || userRoles.includes("Company");

    setShowCompanyDropdown(hasAccess);
    setShowIDFRoles(userRoles.includes("super_admin"));

    const tokenCompanyId = extractCompanyId(tokenUser ?? {});
    if (tokenCompanyId) {
      setDefaultCompanyId(tokenCompanyId);
      setFormData((prev) => ({
        ...prev,
        companyId: prev.companyId || String(tokenCompanyId),
      }));
    }

    if (!hasAccess) {
      const userId = tokenUser?.userId;
      if (!userId) return;

      identityFetch(`/users/${userId}`)
        .then(async (res) => {
          if (!res.ok) {
            const body = await readResponseBody(res);
            throw new Error(getApiErrorMessage(body, "Failed to load creator company"));
          }
          return res.json();
        })
        .then((data) => {
          const companyId = extractCompanyId(data?.data ?? data ?? {});
          if (!companyId) return;

          setDefaultCompanyId(companyId);
          setFormData((prev) => ({
            ...prev,
            companyId: prev.companyId || String(companyId),
          }));
        })
        .catch(() => {
          console.error("Failed to load creator company");
        });

      return;
    }

    const companyEndpoint = isSuperAdmin ? "/companies" : "/companies/my";

    identityFetch(companyEndpoint)
      .then(async (res) => {
        if (!res.ok) {
          const body = await readResponseBody(res);
          throw new Error(getApiErrorMessage(body, "Failed to load companies"));
        }
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];

        const mapped = list
          .filter((company: { enabled?: boolean }) => company.enabled === true)
          .map((company: { id: number; name: string }) => ({
            id: company.id,
            name: company.name,
          }));

        setCompanies(mapped);

        if (mapped.length === 1) {
          setDefaultCompanyId(mapped[0].id);
          setFormData((prev) => ({
            ...prev,
            companyId: String(mapped[0].id),
          }));
          return;
        }

        const matchedCompany = mapped.find(
          (company) => String(company.id) === String(tokenCompanyId)
        );
        if (matchedCompany) {
          setFormData((prev) => ({
            ...prev,
            companyId: String(matchedCompany.id),
          }));
        }
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load companies"),
        });
      });
  }, []);

  /* ---------------- FETCH ROLES ---------------- */

  useEffect(() => {

    identityFetch("/blueprints")
      .then(async (res) => {
        if (!res.ok) {
          const body = await readResponseBody(res);
          throw new Error(getApiErrorMessage(body, "Failed to load roles"));
        }
        return res.json();
      })
      .then((data) => {
        setRoles(mapBlueprintOptions(data).map((blueprint) => blueprint.name));
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load roles"),
        });
      });

  }, []);


  useEffect(() => {
    identityFetch("/roles")
      .then(async (res) => {
        if (!res.ok) {
          const body = await readResponseBody(res);
          throw new Error(getApiErrorMessage(body, "Failed to load roles"));
        }
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.roles || [];

        const roleNames = list.map((r: any) => r.name);

        setIDFRoles(roleNames);

        // Default select "user" if it exists
        const defaultRole = roleNames.find(
          (role) => role.toLowerCase() === "user"
        );

        if (defaultRole) {
          setFormData((prev) => ({
            ...prev,
            idfRoles: [defaultRole],
          }));
        }
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load roles"),
        });
      });
  }, []);

  /* ---------------- PHOTO ---------------- */

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

  };

  //-----------Validation----------

  const resolveCompanyId = () => {
    if (formData.companyId) {
      return Number(formData.companyId);
    }
    return defaultCompanyId;
  };

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      countryCode: "",
      dob: "",
      ssn: "",
      address: "",
    };
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName = "First name cannot contain numbers";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName = "Last name cannot contain numbers";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid phone number";
    }





    if (formData.dob) {
      const selectedDate = new Date(formData.dob);
      const today = new Date();

      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        newErrors.dob = "Future date is not allowed";
      }
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  //----------------------Validation end 

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const companyId = resolveCompanyId();

    const payload = {
      username: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      countryCode: formData.countryCode,
      ssn: formData.ssn,
      dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      blueprints: formData.role ? [formData.role] : [],
      roles: formData.idfRoles,
      ...(companyId ? { companyId } : {}),
    };

    try {
      const res = await identityFetch("/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const response = await res.json();

      if (!res.ok) {
        const { toast: friendlyToast, fieldErrors } = mapApiError(res, response, {
          fallbackTitle: "Unable to create user",
          fallbackMessage:
            "The user could not be created. Please review the highlighted information and try again.",
        });

        setErrors((prev) => ({
          ...prev,
          email: fieldErrors.email || "",
          ssn: fieldErrors.ssn || "",
          phoneNumber: fieldErrors.phoneNumber || "",
          dob: fieldErrors.dob || "",
          firstName: fieldErrors.firstName || "",
          lastName: fieldErrors.lastName || "",
        }));

        toast({
          variant: "destructive",
          title: friendlyToast.title,
          description: friendlyToast.description,
        });

        return;
      }

      toast({
        title: "User Created",
        description: `${formData.firstName} ${formData.lastName} created successfully`,
      });

      navigate("/users");

    } catch {
      const { toast: t } = networkError("Unable to create user");
      toast({
        variant: "destructive",
        title: t.title,
        description: t.description,
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
              New Team Member
            </h1>
            <p className="text-muted-foreground text-sm">
              Add a new member to your team
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
                      {formData.firstName.charAt(0) || "U"}
                      {formData.lastName.charAt(0)}
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

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 mr-2" />
                    Upload Photo
                  </Button>

                </div>

              </div>

            </CardContent>

          </Card>

        </motion.div>

        {/* Personal Information */}

        <motion.div variants={itemVariants}>

          <Card>

            <CardHeader className="pb-4">
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">

              <div className="grid sm:grid-cols-2 gap-4">

                <InputField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(v: string) =>
                    setFormData({ ...formData, firstName: v.replace(/[^A-Za-z\s]/g, "") })
                  }
                  error={errors.firstName}
                />

                <InputField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(v: string) =>
                    setFormData({ ...formData, lastName: v.replace(/[^A-Za-z\s]/g, "") })
                  }
                  error={errors.lastName}
                />

              </div>

              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(v: string) =>
                  setFormData({ ...formData, email: v })
                }
                error={errors.email}
              />

              <div className="grid sm:grid-cols-2 gap-4">

                <InputField
                  label="SSN"
                  value={formData.ssn}
                  onChange={(v: string) =>
                    setFormData({ ...formData, ssn: v.replace(/\D/g, "") })
                  }
                  error={errors.ssn}
                />

                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    aria-invalid={!!errors.dob}
                  />
                  <p className="text-sm text-red-500 min-h-[1.25rem] leading-5">
                    {errors.dob || "\u00A0"}
                  </p>
                </div>

              </div>

              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <CountryCodeSelect
                    value={formData.countryCode}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        countryCode: value,
                      }))
                    }
                  />
                  <Input
                    value={formData.phoneNumber}
                    type="tel"
                    maxLength={10}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    placeholder="Enter 10-digit phone number"
                    className="flex-2"
                    aria-invalid={!!errors.phoneNumber}
                  />
                </div>
                <p className="text-sm text-red-500 min-h-[1.25rem] leading-5">
                  {errors.phoneNumber || "\u00A0"}
                </p>
              </div>

              {showCompanyDropdown && (
                <div className="space-y-1.5">

                  <Label>Company</Label>

                  <select
                    value={formData.companyId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyId: e.target.value,
                      })
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Company</option>

                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Blue Prints */}

              <div className="space-y-1.5">
                <Label>Blueprint</Label>

                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Blueprint</option>

                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>


              {showIDFRoles && (
                <div className="space-y-1.5">

                  <Label>IDF Role</Label>

                  <Popover>

                    <PopoverTrigger asChild>

                      <Button variant="outline" className="w-full justify-between">
                        {formData.idfRoles.length
                          ? formData.idfRoles.join(", ")
                          : "Select role"}
                      </Button>

                    </PopoverTrigger>

                    <PopoverContent className="w-[--radix-popover-trigger-width] p-2">

                      {idfRoles.map((role) => {

                        const checked = formData.idfRoles.includes(role);

                        return (
                          <div
                            key={role}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                idfRoles: checked
                                  ? prev.idfRoles.filter((r) => r !== role)
                                  : [...prev.idfRoles, role],
                              }))
                            }
                          >
                            <Checkbox checked={checked} />
                            <span className="text-sm">{role}</span>
                          </div>
                        );
                      })}

                    </PopoverContent>

                  </Popover>

                </div>
              )}

            </CardContent>

          </Card>

        </motion.div>

        {/* Requested Applications */}
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
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {requestedApps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications requested yet. Click "Add" to add one.
                </p>
              ) : (
                <div className="space-y-2">
                  {requestedApps.map((r, idx) => (
                    <div
                      key={`${r.applicationId}-${r.projectKey}-${r.roleId}-${idx}`}
                      className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm text-foreground">
                          {r.applicationName}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Project: {r.projectKey}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Role: {r.roleName}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setRequestedApps((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <RequestedApplicationDialog
          open={showRequestDialog}
          onOpenChange={setShowRequestDialog}
          onSubmitted={(entry) =>
            setRequestedApps((prev) => [...prev, entry])
          }
        />

        {/* Actions */}



        <motion.div variants={itemVariants} className="flex justify-end gap-3">

          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>

          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Creating..." : "Create User"}
          </Button>

        </motion.div>

      </form>

    </motion.div>
  );
};

/* Helper */

const InputField = ({ label, value, onChange, type = "text", error }: any) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <Input
      value={value}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={!!error}
    />
    <p className="text-sm text-red-500 min-h-[1.25rem] leading-5">
      {error || "\u00A0"}
    </p>
  </div>
);