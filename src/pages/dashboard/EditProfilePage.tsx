import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save, Trash2, Upload, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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


  const tokenUser = getUserFromToken();

  const userId = tokenUser?.userId;
  const userEmail = tokenUser?.sub;
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- GET USER FROM LOCAL STORAGE ---------------- */

  /* ---------------- STATES ---------------- */

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    dob: "",
    ssn: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

        setForm({
          employeeId: user.id || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          email: user.email || "",
          dob: user.dob ? user.dob.substring(0, 10) : "",
          ssn: user.maskedSsn ? user.maskedSsn.slice(-4) : "", // ✅ FIX

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

  const validate = () => {

    const newErrors: Record<string, string> = {};

    if (!form.employeeId) newErrors.employeeId = "Employee ID is required.";
    if (!form.firstName.trim()) newErrors.firstName = "First Name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last Name is required.";

    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "phoneNumber Number is required.";
    } else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid phoneNumber number.";
    }

    if (!form.dob) newErrors.dob = "Date of Birth is required.";

    if (!form.ssn.trim()) {
      newErrors.ssn = "Last 4 SSN is required.";
    } else if (!/^\d{4}$/.test(form.ssn)) {
      newErrors.ssn = "SSN must be exactly 4 digits.";
    }

    setErrors(newErrors);

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
      username: userEmail,
      email: userEmail,
      firstName: form.firstName,
      lastName: form.lastName,

      phoneNumber: form.phoneNumber,
      ssn: form.ssn,
      dob: form.dob ? new Date(form.dob).toISOString() : null,
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

      navigate("/users");

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
      email: "",
      dob: "",
      ssn: "",
    });
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
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
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
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                  />
                </div>

              </div>

              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => set("phoneNumber", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  value={userEmail || ""}
                  disabled
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Last 4 SSN</Label>
                  <Input
                    value={form.ssn}
                    onChange={(e) =>
                      set("ssn", e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                  />
                </div>

              </div>

            </CardContent>

          </Card>

        </motion.div>

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