import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import { identityFetch } from "@/services/api-config";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, RefreshCw, Shield, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const passwordRequirements = [
  { id: "length", label: "At least 8 characters", check: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter", check: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", check: (p: string) => /\d/.test(p) },
  {
    id: "special",
    label: "One special character",
    check: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

const generatePassword = (length = 16) => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const all = upper + lower + numbers + special;

  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  for (let i = chars.length; i < length; i++) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }

  return chars.sort(() => Math.random() - 0.5).join("");
};

type ResetPasswordLocationState = {
  userId?: string | number;
  user?: {
    id?: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  from?: string;
};

export const ResetPasswordPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ResetPasswordLocationState | null) ?? {};

  const userId = state.userId ?? state.user?.id;
  const fromPage = state.from || "/admin/user-administration";
  const userLabel = useMemo(() => {
    const name = `${state.user?.firstName ?? ""} ${state.user?.lastName ?? ""}`.trim();
    if (name && state.user?.email) return `${name} (${state.user.email})`;
    return name || state.user?.email || "Selected user";
  }, [state.user]);

  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getPasswordStrength = () => {
    const passed = passwordRequirements.filter((req) => req.check(newPassword)).length;
    if (passed === 0) return { label: "", color: "", width: "0%" };
    if (passed <= 2) return { label: "Weak", color: "bg-destructive", width: "33%" };
    if (passed <= 4) return { label: "Medium", color: "bg-warning", width: "66%" };
    return { label: "Strong", color: "bg-success", width: "100%" };
  };

  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";
  const allRequirementsMet = passwordRequirements.every((req) => req.check(newPassword));
  const canSubmit = Boolean(userId) && allRequirementsMet && passwordsMatch;

  const handleSuggestPassword = () => {
    const password = generatePassword(16);
    setSuggestedPassword(password);
  };

  const handleUseSuggestedPassword = () => {
    if (!suggestedPassword) return;
    setNewPassword(suggestedPassword);
    setConfirmPassword(suggestedPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !userId) return;

    setIsLoading(true);

    try {
      const res = await identityFetch("/users/admin-reset-password", {
        method: "POST",
        body: JSON.stringify({
          userId: Number(userId),
          newPassword,
        }),
      });

      if (!res.ok) {
        const body = await readResponseBody(res);
        toast({
          variant: "destructive",
          title: "Error",
          description: getApiErrorMessage(body, "Failed to reset password"),
        });
        return;
      }

      toast({
        title: "Password Reset",
        description: `Password updated successfully for ${userLabel}.`,
      });

      navigate(fromPage);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorFromCatch(err, "Failed to reset password"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(fromPage)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No user selected. Choose a user from User Administration to reset their password.
          </CardContent>
        </Card>
      </div>
    );
  }

  const strength = getPasswordStrength();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(fromPage)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <KeyRound className="h-8 w-8 text-primary" />
            Reset Password
          </h1>
          <p className="text-muted-foreground mt-1">{userLabel}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Set New Password
          </CardTitle>
          <CardDescription>
            Enter a new password or use the suggested 16-character password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Suggested password</p>
                  <p className="text-xs text-muted-foreground">
                    16 characters with uppercase, lowercase, number, and symbol
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={handleSuggestPassword}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Suggest Password
                </Button>
              </div>

              {suggestedPassword && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <code className="flex-1 rounded-md bg-background px-3 py-2 text-sm font-mono break-all border border-border">
                    {suggestedPassword}
                  </code>
                  <Button type="button" onClick={handleUseSuggestedPassword}>
                    Use Suggested Password
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        strength.label === "Strong"
                          ? "text-success"
                          : strength.label === "Medium"
                            ? "text-warning"
                            : "text-destructive"
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-3">Password Requirements:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {passwordRequirements.map((req) => {
                  const passed = req.check(newPassword);
                  return (
                    <div
                      key={req.id}
                      className={`flex items-center gap-2 text-sm ${
                        passed ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      {req.label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && (
                <p
                  className={`text-sm flex items-center gap-1 ${
                    passwordsMatch ? "text-success" : "text-destructive"
                  }`}
                >
                  {passwordsMatch ? (
                    <>
                      <Check className="h-4 w-4" /> Passwords match
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" /> Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate(fromPage)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResetPasswordPage;
