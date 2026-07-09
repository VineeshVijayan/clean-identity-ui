import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { RequestedApplicationDialog } from "@/components/dashboard/RequestedApplicationDialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

export const CreateUserPage = () => {

  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [idfRoles, setIDFRoles] = useState<string[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

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

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,15}$/;

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (!nameRegex.test(value)) return "First name cannot contain numbers";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (!nameRegex.test(value)) return "Last name cannot contain numbers";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Enter a valid email address";
        return "";
      case "phoneNumber":
        if (!value.trim()) return "Phone number is required";
        if (!phoneRegex.test(value)) return "Enter a valid phone number";
        return "";
      case "ssn":
        if (value && !/^\d{9}$/.test(value)) return "SSN must be 9 digits";
        return "";
      case "dob":
        if (value) {
          const d = new Date(value);
          const today = new Date();
          d.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          if (d > today) return "Future date is not allowed";
        }
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };
  useEffect(() => {

    const tokenUser = getUserFromToken();

    const userRoles: string[] = tokenUser?.roles || [];

    const isSuperAdmin =
      userRoles.includes("super_admin");

    const hasAccess =
      isSuperAdmin ||
      userRoles.includes("Company");

    setShowCompanyDropdown(hasAccess);

    // Show IDF Role only if the user has ONLY the Super Admin role
    // Show IDF Role only if the logged-in user has the Super Admin role
    const canViewIDFRoles = userRoles.includes("super_admin");

    setShowIDFRoles(canViewIDFRoles);
    if (!hasAccess) return;

    const token = localStorage.getItem("auth-token");

    const companyApi = isSuperAdmin
      ? `${API_BASE_URL}/companies`
      : `${API_BASE_URL}/companies/my`;

    fetch(companyApi, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {

        const list = Array.isArray(data)
          ? data
          : data?.data || [];

        setCompanies(
          list.map((company: any) => ({
            id: company.id,
            name: company.name,
          }))
        );
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load companies",
        });
      });

  }, []);

  /* ---------------- FETCH ROLES ---------------- */

  useEffect(() => {

    const token = localStorage.getItem("auth-token");

    fetch(`${API_BASE_URL}/blueprints`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.roles || [];
        setRoles(list.map((r: any) => r.name));
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load roles",
        });
      });

  }, []);


  useEffect(() => {

    const token = localStorage.getItem("auth-token");

    fetch(`${API_BASE_URL}/roles`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.roles || [];
        setIDFRoles(list.map((r: any) => r.name));
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load roles",
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

  const fieldOrder = ["firstName", "lastName", "email", "ssn", "dob", "phoneNumber"];

  const validateForm = () => {
    const newErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      phoneNumber: validateField("phoneNumber", formData.phoneNumber),
      countryCode: "",
      dob: validateField("dob", formData.dob),
      ssn: validateField("ssn", formData.ssn),
      address: "",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const focusFirstInvalid = (errs: Record<string, string>) => {
    for (const f of fieldOrder) {
      if (errs[f]) {
        document.getElementById(`user-${f}`)?.focus();
        return;
      }
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!validateForm()) {
      // Compute errors again for focus (state is async)
      const errs = {
        firstName: validateField("firstName", formData.firstName),
        lastName: validateField("lastName", formData.lastName),
        email: validateField("email", formData.email),
        phoneNumber: validateField("phoneNumber", formData.phoneNumber),
        dob: validateField("dob", formData.dob),
        ssn: validateField("ssn", formData.ssn),
      };
      focusFirstInvalid(errs);
      return;
    }


    setIsLoading(true);

    const token = localStorage.getItem("auth-token");

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
      ...(showCompanyDropdown &&
        formData.companyId && {
        companyId: Number(formData.companyId),
      }),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json();

      if (!res.ok) {
        if (typeof response.error === "string") {
          const errorMessage = response.error.toLowerCase();

          setErrors((prev) => ({
            ...prev,
            email: errorMessage.includes("email") ? response.error : "",
            ssn: errorMessage.includes("ssn") ? response.error : "",
          }));

          toast({
            variant: "destructive",
            title: "Validation Error",
            description: response.error,
          });

          return;
        }

        toast({
          variant: "destructive",
          title: "Error",
          description: response.statusMessage || "Failed to create user",
        });

        return;
      }

      toast({
        title: "User Created",
        description: `${formData.firstName} ${formData.lastName} created successfully`,
      });

      navigate("/users");

    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
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
                  id="user-firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={(v: string) =>
                    setFormData({ ...formData, firstName: v.replace(/[^A-Za-z\s]/g, "") })
                  }
                  onBlur={() => handleBlur("firstName", formData.firstName)}
                />

                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}

                <InputField
                  id="user-lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(v: string) =>
                    setFormData({ ...formData, lastName: v.replace(/[^A-Za-z\s]/g, "") })
                  }
                  onBlur={() => handleBlur("lastName", formData.lastName)}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}

              </div>

              <InputField
                id="user-email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(v: string) =>
                  setFormData({ ...formData, email: v })
                }
                onBlur={() => handleBlur("email", formData.email)}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}

              <div className="grid sm:grid-cols-2 gap-4">

                <InputField
                  id="user-ssn"
                  label="SSN"
                  value={formData.ssn}
                  onChange={(v: string) =>
                    setFormData({ ...formData, ssn: v.replace(/\D/g, "").slice(0, 9) })
                  }
                  onBlur={() => handleBlur("ssn", formData.ssn)}
                />

                {errors.ssn && (
                  <p className="text-sm text-red-500">{errors.ssn}</p>
                )}

                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input
                    id="user-dob"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    onBlur={() => handleBlur("dob", formData.dob)}
                  />
                  {errors.dob && (
                    <p className="text-sm text-red-500">{errors.dob}</p>
                  )}
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
                    id="user-phoneNumber"
                    value={formData.phoneNumber}
                    type="tel"
                    maxLength={10}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    onBlur={() => handleBlur("phoneNumber", formData.phoneNumber)}
                    placeholder="Enter 10-digit phone number"
                    className="flex-2"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
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
                Requested Application
              </CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowRequestDialog(true)}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Requested Application
              </Button>
            </CardHeader>
            <CardContent>
              {requestedApps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications requested yet. Click "Requested Application" to add one.
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

const InputField = ({ label, value, onChange, onBlur, id, type = "text" }: any) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      value={value}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  </div>
);