import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Errors = Partial<Record<
  | "companyName"
  | "location"
  | "phoneNumber"
  | "contactFirstName"
  | "contactLastName"
  | "contactPhone"
  | "contactEmail"
  | "contactDob"
  | "contactSsn",
  string
>>;

export const CreateCompanyPage = () => {
  const API_BASE_URL = "https://identity-api.ndashdigital.com/api";
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [approverId, setApproverId] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  // Primary Contact Information
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactDob, setContactDob] = useState("");
  const [contactSsn, setContactSsn] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fieldRefs = {
    companyName: useRef<HTMLInputElement>(null),
    location: useRef<HTMLInputElement>(null),
    phoneNumber: useRef<HTMLInputElement>(null),
    contactFirstName: useRef<HTMLInputElement>(null),
    contactLastName: useRef<HTMLInputElement>(null),
    contactPhone: useRef<HTMLInputElement>(null),
    contactEmail: useRef<HTMLInputElement>(null),
    contactDob: useRef<HTMLInputElement>(null),
    contactSsn: useRef<HTMLInputElement>(null),
  };

  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name: keyof Errors, value: string): string | undefined => {
    const v = (value ?? "").trim();
    switch (name) {
      case "companyName":
        if (!v) return "Company Name is required.";
        if (v.length < 2) return "Company Name must be at least 2 characters.";
        if (v.length > 100) return "Company Name must be at most 100 characters.";
        return;
      case "location":
        if (!v) return "Location is required.";
        if (v.length > 100) return "Location must be at most 100 characters.";
        return;
      case "phoneNumber":
        if (!v) return "Phone Number is required.";
        if (!/^\d{10}$/.test(v)) return "Phone Number must contain exactly 10 digits.";
        return;
      case "contactFirstName":
        if (!v) return "First Name is required.";
        if (!nameRegex.test(v)) return "First Name can contain only letters.";
        if (v.length < 2) return "First Name must be at least 2 characters.";
        if (v.length > 50) return "First Name must be at most 50 characters.";
        return;
      case "contactLastName":
        if (!v) return "Last Name is required.";
        if (!nameRegex.test(v)) return "Last Name can contain only letters.";
        if (v.length < 2) return "Last Name must be at least 2 characters.";
        if (v.length > 50) return "Last Name must be at most 50 characters.";
        return;
      case "contactPhone":
        if (!v) return "Phone Number is required.";
        if (!/^\d{10}$/.test(v)) return "Phone Number must contain exactly 10 digits.";
        return;
      case "contactEmail":
        if (!v) return "Email is required.";
        if (!emailRegex.test(v)) return "Please enter a valid email address.";
        return;
      case "contactDob": {
        if (!v) return "Date of Birth is required.";
        const dob = new Date(v);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dob.getTime() > today.getTime()) return "Date of Birth cannot be a future date.";
        return;
      }
      case "contactSsn":
        if (!v) return "SSN is required.";
        if (!/^\d+$/.test(v)) return "SSN must contain only numbers.";
        if (v.length !== 9) return "SSN must be exactly 9 digits.";
        return;
    }
  };

  const values: Record<keyof Errors, string> = {
    companyName,
    location,
    phoneNumber,
    contactFirstName,
    contactLastName,
    contactPhone,
    contactEmail,
    contactDob,
    contactSsn,
  };

  const runValidation = (): Errors => {
    const next: Errors = {};
    (Object.keys(values) as (keyof Errors)[]).forEach((k) => {
      const msg = validateField(k, values[k]);
      if (msg) next[k] = msg;
    });
    return next;
  };

  const updateField = (name: keyof Errors, value: string, setter: (v: string) => void) => {
    setter(value);
    if (touched[name] || errors[name]) {
      const msg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleBlur = (name: keyof Errors) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const msg = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const digitsOnlyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "Tab", "Escape", "Enter", "Home", "End", "ArrowLeft", "ArrowRight"];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const lettersOnlyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "Tab", "Escape", "Enter", "Home", "End", "ArrowLeft", "ArrowRight"];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^[A-Za-z ]$/.test(e.key)) e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const next = runValidation();
    setErrors(next);
    setTouched({
      companyName: true, location: true, phoneNumber: true,
      contactFirstName: true, contactLastName: true, contactPhone: true,
      contactEmail: true, contactDob: true, contactSsn: true,
    });

    const firstInvalid = (Object.keys(values) as (keyof Errors)[]).find((k) => next[k]);
    if (firstInvalid) {
      fieldRefs[firstInvalid]?.current?.focus();
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");

      const res = await fetch(`${API_BASE_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          name: companyName,
          location,
          phoneNumber,
          approverId: approverId ? Number(approverId) : null,
          contact: {
            firstName: contactFirstName,
            lastName: contactLastName,
            phoneNumber: contactPhone,
            email: contactEmail,
            dob: contactDob,
            ssn: contactSsn,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Company created successfully");
      navigate("/company/manage");

    } catch (err) {
      console.error(err);
      toast.error("Failed to create company");
    }
  };


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(`${API_BASE_URL}/users/managers`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        const list = data.data || data;
        setUsers(list);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    fetchUsers();
  }, []);

  const errorText = (name: keyof Errors) =>
    errors[name] ? (
      <p className="text-xs text-destructive mt-1">{errors[name]}</p>
    ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Create Company</h1>
          <p className="text-muted-foreground">Add a new company to your organization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl" noValidate>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent>

            <div className="space-y-2">
              <Label htmlFor="approver">Approver</Label>
              <select
                id="approver"
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select approver</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>


            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  ref={fieldRefs.companyName}
                  placeholder="Enter company name"
                  value={companyName}
                  maxLength={100}
                  onChange={(e) => updateField("companyName", e.target.value, setCompanyName)}
                  onBlur={() => handleBlur("companyName")}
                  aria-invalid={!!errors.companyName}
                />
                {errorText("companyName")}
              </div>


              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  ref={fieldRefs.location}
                  placeholder="Enter location"
                  value={location}
                  maxLength={100}
                  onChange={(e) => updateField("location", e.target.value, setLocation)}
                  onBlur={() => handleBlur("location")}
                  aria-invalid={!!errors.location}
                />
                {errorText("location")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  ref={fieldRefs.phoneNumber}
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  maxLength={10}
                  onKeyDown={digitsOnlyKeyDown}
                  onChange={(e) =>
                    updateField("phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10), setPhoneNumber)
                  }
                  onBlur={() => handleBlur("phoneNumber")}
                  aria-invalid={!!errors.phoneNumber}
                />
                {errorText("phoneNumber")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Primary Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="contactFirstName">First Name</Label>
                <Input
                  id="contactFirstName"
                  ref={fieldRefs.contactFirstName}
                  placeholder="Enter first name"
                  value={contactFirstName}
                  maxLength={50}
                  onKeyDown={lettersOnlyKeyDown}
                  onChange={(e) =>
                    updateField("contactFirstName", e.target.value.replace(/[^A-Za-z ]/g, ""), setContactFirstName)
                  }
                  onBlur={() => handleBlur("contactFirstName")}
                  aria-invalid={!!errors.contactFirstName}
                />
                {errorText("contactFirstName")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactLastName">Last Name</Label>
                <Input
                  id="contactLastName"
                  ref={fieldRefs.contactLastName}
                  placeholder="Enter last name"
                  value={contactLastName}
                  maxLength={50}
                  onKeyDown={lettersOnlyKeyDown}
                  onChange={(e) =>
                    updateField("contactLastName", e.target.value.replace(/[^A-Za-z ]/g, ""), setContactLastName)
                  }
                  onBlur={() => handleBlur("contactLastName")}
                  aria-invalid={!!errors.contactLastName}
                />
                {errorText("contactLastName")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  ref={fieldRefs.contactPhone}
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter phone number"
                  value={contactPhone}
                  maxLength={10}
                  onKeyDown={digitsOnlyKeyDown}
                  onChange={(e) =>
                    updateField("contactPhone", e.target.value.replace(/\D/g, "").slice(0, 10), setContactPhone)
                  }
                  onBlur={() => handleBlur("contactPhone")}
                  aria-invalid={!!errors.contactPhone}
                />
                {errorText("contactPhone")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  ref={fieldRefs.contactEmail}
                  type="email"
                  placeholder="Enter email address"
                  value={contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value, setContactEmail)}
                  onBlur={() => handleBlur("contactEmail")}
                  aria-invalid={!!errors.contactEmail}
                />
                {errorText("contactEmail")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactDob">Date of Birth</Label>
                <Input
                  id="contactDob"
                  ref={fieldRefs.contactDob}
                  type="date"
                  value={contactDob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => updateField("contactDob", e.target.value, setContactDob)}
                  onBlur={() => handleBlur("contactDob")}
                  aria-invalid={!!errors.contactDob}
                />
                {errorText("contactDob")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactSsn">SSN</Label>
                <Input
                  id="contactSsn"
                  ref={fieldRefs.contactSsn}
                  inputMode="numeric"
                  placeholder="Enter SSN"
                  value={contactSsn}
                  maxLength={9}
                  onKeyDown={digitsOnlyKeyDown}
                  onChange={(e) =>
                    updateField("contactSsn", e.target.value.replace(/\D/g, "").slice(0, 9), setContactSsn)
                  }
                  onBlur={() => handleBlur("contactSsn")}
                  aria-invalid={!!errors.contactSsn}
                />
                {errorText("contactSsn")}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Create Company</Button>
        </div>
      </form>
    </motion.div>
  );
};
