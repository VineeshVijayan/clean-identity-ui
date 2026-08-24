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
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import {
  getAuthErrorMessage,
  resetSessionTimeout,
  updateSessionTimeout,
} from "@/services/auth-service";
import type { SessionTimeoutUnit } from "@/services/auth-types";
import { identityFetch } from "@/services/api-config";
import { getLoggedInUserId } from "@/services/jwt-service";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DEFAULT_TIMEOUT_VALUE = "30";
const DEFAULT_TIMEOUT_UNIT: SessionTimeoutUnit = "MINUTES";

export const ManageSecurity = () => {
  const [timeoutValue, setTimeoutValue] = useState(DEFAULT_TIMEOUT_VALUE);
  const [timeoutUnit, setTimeoutUnit] = useState<SessionTimeoutUnit>(DEFAULT_TIMEOUT_UNIT);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await identityFetch("/settings/security", { skipLoader: true });

      if (!res.ok) {
        const body = await readResponseBody(res);
        toast.error(getApiErrorMessage(body, "Failed to load security settings"));
        return;
      }

      const data = await res.json();
      const settings = data?.data ?? data;

      setTimeoutValue(
        settings?.value != null ? String(settings.value) : DEFAULT_TIMEOUT_VALUE
      );
      setTimeoutUnit((settings?.unit as SessionTimeoutUnit) ?? DEFAULT_TIMEOUT_UNIT);
    } catch (err) {
      toast.error(getErrorFromCatch(err, "Failed to load security settings"));
    }
  };

  const handleSave = async () => {
    const value = Number(timeoutValue);
    const userId = getLoggedInUserId();

    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Please enter a valid session timeout.");
      return;
    }

    if (!userId) {
      toast.error("Unable to determine the signed-in user.");
      return;
    }

    try {
      setLoading(true);

      const identityResponse = await identityFetch("/settings", {
        method: "POST",
        body: JSON.stringify({
          "jwt.session.timeout": timeoutValue,
          "jwt.session.timeout.unit": timeoutUnit,
        }),
      });

      if (!identityResponse.ok) {
        const body = await readResponseBody(identityResponse);
        toast.error(getApiErrorMessage(body, "Failed to update security settings."));
        return;
      }

      try {
        await updateSessionTimeout({ userId, value, unit: timeoutUnit });
      } catch (error) {
        toast.error(
          getAuthErrorMessage(
            error,
            "Global settings saved, but failed to update your session duration."
          )
        );
        return;
      }

      toast.success("Session security settings updated successfully.");
    } catch (err) {
      toast.error(getErrorFromCatch(err, "Failed to update security settings."));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const userId = getLoggedInUserId();

    if (!userId) {
      toast.error("Unable to determine the signed-in user.");
      return;
    }

    try {
      setResetting(true);
      await resetSessionTimeout(userId);
      setTimeoutValue(DEFAULT_TIMEOUT_VALUE);
      setTimeoutUnit(DEFAULT_TIMEOUT_UNIT);
      await loadSettings();
      toast.success("Session timeout reset to default.");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "Failed to reset session timeout."));
    } finally {
      setResetting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Session Security
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Configure how long a user session remains valid before sign-in is required.
          Saving applies the global policy and updates your personal session duration.
        </p>

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
              onValueChange={(value) => setTimeoutUnit(value as SessionTimeoutUnit)}
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
            <strong>Current configuration:</strong> {timeoutValue}{" "}
            {timeoutUnit.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={resetting || loading}
          >
            {resetting ? "Resetting..." : "Reset to Default"}
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading || resetting}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
