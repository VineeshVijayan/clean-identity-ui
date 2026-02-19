import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save, Trash2, Upload, User } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Try to pre-fill from localStorage
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    employeeId: storedUser.employeeId || "",
    firstName: storedUser.firstName || storedUser.name?.split(" ")[0] || "",
    lastName: storedUser.lastName || storedUser.name?.split(" ")[1] || "",
    phone: "",
    dob: "",
    ssn: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.employeeId.trim()) newErrors.employeeId = "Employee ID is required.";
    if (!form.firstName.trim()) newErrors.firstName = "First Name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last Name is required.";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone Number is required.";
    } else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid phone number.";
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
    // Simulate save
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
  };

  const handleClear = () => {
    setForm({ employeeId: "", firstName: "", lastName: "", phone: "", dob: "", ssn: "" });
    setPhotoPreview(null);
    setErrors({});
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

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
            <p className="text-muted-foreground text-sm">Update your personal information</p>
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
                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
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
                  <p className="text-sm text-muted-foreground">Upload a profile photo (JPG, PNG)</p>
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
                        className="text-destructive border-destructive/30 hover:bg-destructive/5"
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

        {/* Info Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Employee ID */}
              <div className="space-y-1.5">
                <Label htmlFor="employeeId">
                  Employee ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="employeeId"
                  value={form.employeeId}
                  onChange={(e) => set("employeeId", e.target.value)}
                  placeholder="e.g. EMP-001"
                  className={errors.employeeId ? "border-destructive focus:ring-destructive/30" : ""}
                />
                {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId}</p>}
              </div>

              {/* Name row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="John"
                    className={errors.firstName ? "border-destructive focus:ring-destructive/30" : ""}
                  />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Doe"
                    className={errors.lastName ? "border-destructive focus:ring-destructive/30" : ""}
                  />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  className={errors.phone ? "border-destructive focus:ring-destructive/30" : ""}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* DOB + SSN */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dob">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob", e.target.value)}
                    className={errors.dob ? "border-destructive focus:ring-destructive/30" : ""}
                  />
                  {errors.dob && <p className="text-xs text-destructive">{errors.dob}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ssn">
                    Last 4 SSN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ssn"
                    value={form.ssn}
                    onChange={(e) => set("ssn", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="e.g. 1234"
                    maxLength={4}
                    className={errors.ssn ? "border-destructive focus:ring-destructive/30" : ""}
                  />
                  {errors.ssn && <p className="text-xs text-destructive">{errors.ssn}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex items-center justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
