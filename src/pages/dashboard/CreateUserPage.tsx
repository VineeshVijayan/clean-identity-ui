import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

export const CreateUserPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [roles, setRoles] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    ssn: "",
    dob: "",
    role: "user",
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
        if (!res.ok) throw new Error("Failed to load roles");
        return res.json();
      })
      .then((data) => {
        const roleList = Array.isArray(data)
          ? data
          : data.roles || data.data || [];

        setRoles(roleList.map((r: any) => r.name));
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load roles",
        });
      });
  }, []);

  /* ---------------- PHOTO HANDLER ---------------- */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ---------------- SUBMIT USER ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("auth-token");

    const payload = {
      username: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      ssn: formData.ssn,
      dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      roles: [formData.role],
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

      if (!res.ok) throw new Error("Create failed");

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New User</h1>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {/* Photo Upload */}
        <div className="flex flex-col items-center gap-4 pb-6 border-b">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={photoPreview || ""} />
              <AvatarFallback>
                {formData.firstName.charAt(0) || "U"}
                {formData.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" /> Upload Photo
          </Button>
        </div>

        {/* Fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField label="First Name" value={formData.firstName}
            onChange={(v) => setFormData({ ...formData, firstName: v })} />
          <InputField label="Last Name" value={formData.lastName}
            onChange={(v) => setFormData({ ...formData, lastName: v })} />
        </div>

        <InputField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(v) => setFormData({ ...formData, email: v })}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField label="SSN" value={formData.ssn}
            onChange={(v) => setFormData({ ...formData, ssn: v })} />

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : <><Save className="h-4 w-4 mr-2" />Create User</>}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

/* ---------- Small helper (UI unchanged) ---------- */
const InputField = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
  </div>
);
