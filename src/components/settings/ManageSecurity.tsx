import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";
// const API_BASE_URL = "http://localhost:8082/api";

export const ManageSecurity = () => {

  const [timeoutValue, setTimeoutValue] = useState("1");
  const [timeoutUnit, setTimeoutUnit] = useState("HOURS");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {

      const token = localStorage.getItem("auth-token");

      const res = await fetch(`${API_BASE_URL}/settings/security`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setTimeoutValue(data.value);
      setTimeoutUnit(data.unit);

    } catch {
      toast.error("Failed to load security settings");
    }
  };

  const handleSave = async () => {
    if (!timeoutValue || Number(timeoutValue) <= 0) {
      toast.error("Please enter a valid session timeout.");
      return;
    }
  
    try {
      setLoading(true);
  
      const token = localStorage.getItem("auth-token");
  
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          "jwt.session.timeout": timeoutValue,
          "jwt.session.timeout.unit": timeoutUnit,
        }),
      });
  
      if (!response.ok) {
        throw new Error();
      }
  
      toast.success("Security settings updated successfully.");
    } catch {
      toast.error("Failed to update security settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Session Security
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          <div>
            <h3 className="font-medium">
              Session Timeout
            </h3>

            <p className="text-sm text-muted-foreground">
              Configure how long a user session remains valid before the user
              is required to sign in again.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">

            <div className="space-y-2">

              <Label>Timeout</Label>

              <Input
                type="number"
                min={1}
                value={timeoutValue}
                onChange={(e) => setTimeoutValue(e.target.value)}
              />

            </div>

            <div className="space-y-2">

              <Label>Unit</Label>

              <Select
                value={timeoutUnit}
                onValueChange={setTimeoutUnit}
              >

                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="SECONDS">Seconds</SelectItem>
                  <SelectItem value="MINUTES">Minutes</SelectItem>
                  <SelectItem value="HOURS">Hours</SelectItem>
                </SelectContent>

              </Select>

            </div>

          </div>

          <div className="rounded-md border bg-muted/30 p-4">

            <p className="text-sm">
              <strong>Current Configuration:</strong>{" "}
              {timeoutValue}{" "}
              {timeoutUnit.toLowerCase()}
            </p>

          </div>

          <div className="flex justify-end">

            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>

          </div>

        </CardContent>

      </Card>

    </div>
  );
};