import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Shield,
  Lock,
  Key,
  Users,
  Database,
  Settings,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Shield,
    title: "Multi-Factor Authentication",
    description:
      "Secure your applications with SMS, email, authenticator apps, and hardware tokens for maximum security.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Lock,
    title: "Single Sign-On (SSO)",
    description:
      "Enable seamless access across multiple applications with SAML 2.0 and OAuth 2.0 integration.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Key,
    title: "Role-Based Access Control",
    description:
      "Define granular permissions and roles to control who can access what within your organization.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Users,
    title: "User Lifecycle Management",
    description:
      "Automate user provisioning, deprovisioning, and access reviews throughout the employee lifecycle.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Database,
    title: "Identity Governance",
    description:
      "Ensure compliance with automated access certifications, segregation of duties, and audit trails.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: Settings,
    title: "API Integration",
    description:
      "Connect with your existing systems through RESTful APIs and pre-built connectors for popular platforms.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const highlights = [
  "Enterprise-grade security",
  "99.99% uptime SLA",
  "SOC 2 Type II compliant",
  "GDPR ready",
  "24/7 support available",
  "Custom integrations",
];

export const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Powerful Features for{" "}
              <span className="text-primary">Modern Identity</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Everything you need to secure, manage, and govern digital identities
              at scale. Built for enterprises, loved by developers.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  <CheckCircle className="h-4 w-4" />
                  {highlight}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 sm:p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))",
            }}
          >
            <Zap className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of organizations that trust Identity Framework for
              their identity and access management needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/docs">View Documentation</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
