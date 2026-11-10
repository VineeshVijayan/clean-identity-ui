import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { confirmPasswordReset, getAuthErrorMessage } from "@/services/auth-service";
import { motion } from "framer-motion";
import { ArrowRight, Check, Eye, EyeOff, Lock, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const passwordRequirements = [
  { id: "length", label: "At least 8 characters", check: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter", check: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", check: (p: string) => /\d/.test(p) },
  { id: "special", label: "One special character", check: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const ResetPasswordWithTokenPage = () => {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") ?? "").trim();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";
  const allRequirementsMet = passwordRequirements.every((req) => req.check(newPassword));
  const canSubmit = Boolean(token) && allRequirementsMet && passwordsMatch;

  const strength = useMemo(() => {
    const passed = passwordRequirements.filter((req) => req.check(newPassword)).length;
    if (passed === 0) return { label: "", color: "", width: "0%" };
    if (passed <= 2) return { label: "Weak", color: "bg-destructive", width: "33%" };
    if (passed <= 4) return { label: "Medium", color: "bg-warning", width: "66%" };
    return { label: "Strong", color: "bg-success", width: "100%" };
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);

    try {
      const message = await confirmPasswordReset(token, newPassword);
      toast({
        title: "Password updated",
        description: message,
      });
      navigate("/login");
    } catch (err: unknown) {
      toast({
        title: "Unable to reset password",
        description: getAuthErrorMessage(
          err,
          "This reset link is invalid or has expired. Request a new one."
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="fixed inset-0 hero-glow pointer-events-none" />
        <div className="fixed inset-0 pattern-grid opacity-20 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <div className="glass-card p-8 sm:p-10 animated-border">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <img
                  src="/assets/Identity.png"
                  alt="Identity Framework"
                  className="relative w-16 h-16 rounded-2xl object-contain border border-primary/20 bg-white p-2"
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Choose a new password</h1>
              <p className="text-muted-foreground">
                {token
                  ? "Create a strong password for your Identity Framework account."
                  : "This reset link is missing a token. Request a new password reset email."}
              </p>
            </div>

            {token ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-12 pr-12"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {newPassword && (
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
                  )}
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-3">Password requirements:</p>
                  <div className="grid gap-2">
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
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-12 pr-12"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
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

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  size="lg"
                  disabled={!canSubmit || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Updating...
                    </div>
                  ) : (
                    <>
                      Update password
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <Button variant="hero" className="w-full" size="lg" asChild>
                <Link to="/forgot-password">Request a new link</Link>
              </Button>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Back to sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResetPasswordWithTokenPage;
