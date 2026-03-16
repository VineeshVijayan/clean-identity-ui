import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CountryCodeSelect } from "@/components/ui/country-code-select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save, Upload, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

export const CreateUserPage = () => {

  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState("US:+1");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ssn: "",
    dob: "",
    role: [] as string[],
  });

  /* ---------------- FETCH ROLES ---------------- */

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

  /* ---------------- PHOTO ---------------- */

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("auth-token");

    const payload = {
      username: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      ssn: formData.ssn,
      dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      roles: formData.role,
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

      if (!res.ok) throw new Error();

      toast({
        title: "User Created",
        description: `${formData.firstName} ${formData.lastName} created successfully`,
      });

      navigate("/users");

    } catch {

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user",
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
              Create New Team Member
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
                    setFormData({ ...formData, firstName: v })
                  }
                />

                <InputField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(v: string) =>
                    setFormData({ ...formData, lastName: v })
                  }
                />

              </div>

              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(v: string) =>
                  setFormData({ ...formData, email: v })
                }
              />

              <div className="grid sm:grid-cols-2 gap-4">

                <InputField
                  label="Last 4 SSN"
                  value={formData.ssn}
                  onChange={(v: string) =>
                    setFormData({ ...formData, ssn: v })
                  }
                />

                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                  />
                </div>

              </div>

              <InputField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(v: string) =>
                  setFormData({ ...formData, phone: v })
                }
              />

              {/* Roles */}

              <div className="space-y-1.5">

                <Label>Blueprint</Label>

                <Popover>

                  <PopoverTrigger asChild>

                    <Button variant="outline" className="w-full justify-between">
                      {formData.role.length
                        ? formData.role.join(", ")
                        : "Select role"}
                    </Button>

                  </PopoverTrigger>

                  <PopoverContent className="w-[--radix-popover-trigger-width] p-2">

                    {roles.map((role) => {

                      const checked = formData.role.includes(role);

                      return (
                        <div
                          key={role}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              role: checked
                                ? prev.role.filter((r) => r !== role)
                                : [...prev.role, role],
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

            </CardContent>

          </Card>

        </motion.div>

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

const InputField = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <Input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
  </div>
);