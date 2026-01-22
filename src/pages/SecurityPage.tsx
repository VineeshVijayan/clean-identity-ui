import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Shield,
  Lock,
  Server,
  Eye,
  CheckCircle,
  Award,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Hosted on SOC 2 Type II certified cloud providers with 99.99% uptime SLA.",
  },
  {
    icon: Eye,
    title: "Zero-Knowledge Architecture",
    description: "Your sensitive data is never accessible to our employees in plaintext.",
  },
  {
    icon: Shield,
    title: "Multi-Factor Authentication",
    description: "Enforce MFA across your organization with multiple authentication methods.",
  },
];

const certifications = [
  { name: "SOC 2 Type II", status: "Certified" },
  { name: "ISO 27001", status: "Certified" },
  { name: "GDPR", status: "Compliant" },
  { name: "HIPAA", status: "Compliant" },
  { name: "PCI DSS", status: "Certified" },
  { name: "CCPA", status: "Compliant" },
];

const practices = [
  "Regular penetration testing by third-party security firms",
  "Bug bounty program for responsible vulnerability disclosure",
  "24/7 security monitoring and incident response",
  "Employee security training and background checks",
  "Regular security audits and compliance reviews",
  "Disaster recovery and business continuity planning",
];

export const SecurityPage = () => {
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
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Security at <span className="text-primary">Identity Framework</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We take security seriously. Learn about the measures we take to protect
              your data and ensure compliance with industry standards.
            </p>
          </motion.div>
        </section>

        {/* Security Features */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">
              Certifications & Compliance
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              We maintain the highest standards of security certifications and compliance
              to give you confidence in our platform.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-4 text-center"
                >
                  <Award className="h-8 w-8 text-warning mx-auto mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{cert.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {cert.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Security Practices */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <FileCheck className="h-12 w-12 text-primary mb-6" />
              <h2 className="text-3xl font-bold mb-6">Our Security Practices</h2>
              <ul className="space-y-4">
                {practices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{practice}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-center mb-4">
                Report a Vulnerability
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                Found a security issue? We appreciate responsible disclosure.
                Please report vulnerabilities through our bug bounty program.
              </p>
              <Button className="w-full" variant="outline">
                Submit a Report
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Security Whitepaper CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))",
            }}
          >
            <h2 className="text-2xl font-bold mb-4">Want to Learn More?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Download our comprehensive security whitepaper for detailed information
              about our security architecture, practices, and compliance standards.
            </p>
            <Button variant="hero" size="lg">
              Download Security Whitepaper
            </Button>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SecurityPage;
