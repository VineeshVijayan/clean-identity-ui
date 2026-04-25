import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !location || !phoneNumber) {
      toast.error("Please fill in all company fields");
      return;
    }

    if (
      !contactFirstName ||
      !contactLastName ||
      !contactPhone ||
      !contactEmail ||
      !contactDob ||
      !contactSsn
    ) {
      toast.error("Please fill in all primary contact fields");
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

        const res = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();

        // adjust based on your API response
        const list = data.data || data;

        setUsers(list);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    fetchUsers();
  }, []);

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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent>

            {/* Approver (Right top aligned) */}
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
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
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
                  placeholder="Enter first name"
                  value={contactFirstName}
                  onChange={(e) => setContactFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactLastName">Last Name</Label>
                <Input
                  id="contactLastName"
                  placeholder="Enter last name"
                  value={contactLastName}
                  onChange={(e) => setContactLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactDob">Date of Birth</Label>
                <Input
                  id="contactDob"
                  type="date"
                  value={contactDob}
                  onChange={(e) => setContactDob(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactSsn">SSN</Label>
                <Input
                  id="contactSsn"
                  placeholder="Enter SSN"
                  value={contactSsn}
                  onChange={(e) => setContactSsn(e.target.value)}
                />
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
