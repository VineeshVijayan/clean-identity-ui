import { motion } from "framer-motion";
import { 
  Shield, 
  Key, 
  Fingerprint, 
  Users, 
  Lock, 
  Zap,
  Globe,
  RefreshCw 
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption with SOC 2 Type II compliance and regular security audits.",
  },
  {
    icon: Key,
    title: "Single Sign-On",
    description: "Integrate with Google, Microsoft, Okta, and any SAML or OIDC provider.",
  },
  {
    icon: Fingerprint,
    title: "Multi-Factor Auth",
    description: "Add extra security layers with TOTP, SMS, biometrics, and hardware keys.",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Complete user lifecycle management with roles, permissions, and groups.",
  },
  {
    icon: Lock,
    title: "Passwordless Login",
    description: "Magic links, passkeys, and biometric authentication for frictionless access.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Edge-optimized infrastructure with sub-50ms authentication responses.",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Multi-region deployment with automatic failover and data residency controls.",
  },
  {
    icon: RefreshCw,
    title: "Session Management",
    description: "Advanced session controls with refresh tokens and concurrent session limits.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-6"
          >
            <span className="text-sm font-medium text-muted-foreground">Features</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
          >
            Everything You Need for
            <br />
            <span className="text-gradient">Secure Authentication</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            A complete identity platform with all the tools to secure your users 
            and scale with confidence.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative glass-card p-6 hover:bg-card/80 transition-all duration-300 animated-border"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
