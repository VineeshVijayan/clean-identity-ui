import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage, requestPasswordReset } from "@/services/auth-service";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const validateEmail = (value: string): string => {
    if (!value.trim()) return "Email is required.";
    if (!emailRegex.test(value)) return "Please enter a valid email.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateEmail(email);
    if (validation) {
      setEmailError(validation);
      return;
    }
    setEmailError("");
    setIsLoading(true);

    try {
      const message = await requestPasswordReset(email.trim());
      setSubmitted(true);
      toast({
        title: "Check your email",
        description: message,
      });
    } catch (err: unknown) {
      toast({
        title: "Unable to send reset instructions",
        description: getAuthErrorMessage(err, "Something went wrong. Please try again."),
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
              <h1 className="text-2xl font-bold mb-2">Forgot password</h1>
              <p className="text-muted-foreground">
                {submitted
                  ? "If an account exists for that email, we sent password reset instructions."
                  : "Enter your email and we will send a link to reset your password."}
              </p>
            </div>

            {submitted ? (
              <div className="space-y-5">
                <Button variant="hero" className="w-full" size="lg" asChild>
                  <Link to="/login">
                    Back to sign in
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-12"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                      aria-invalid={!!emailError}
                      required
                    />
                  </div>
                  {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Sending...
                    </div>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {!submitted && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                Remembered your password?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
