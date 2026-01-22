import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, Users, Target, Award, Globe, Heart } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "We believe security should never be compromised. Every feature we build starts with security at its core.",
  },
  {
    icon: Users,
    title: "Customer Success",
    description: "Your success is our success. We're committed to helping our customers achieve their identity management goals.",
  },
  {
    icon: Target,
    title: "Innovation",
    description: "We continuously push the boundaries of what's possible in identity and access management.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description: "We maintain the highest standards of integrity in everything we do, from code to customer relationships.",
  },
];

const stats = [
  { value: "10K+", label: "Organizations" },
  { value: "50M+", label: "Identities Managed" },
  { value: "99.99%", label: "Uptime" },
  { value: "150+", label: "Countries" },
];

const team = [
  { name: "Sarah Chen", role: "CEO & Co-founder", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" },
  { name: "Michael Ross", role: "CTO & Co-founder", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael" },
  { name: "Emily Johnson", role: "VP of Engineering", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily" },
  { name: "David Park", role: "VP of Product", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=david" },
];

export const AboutPage = () => {
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
              About <span className="text-primary">Identity Framework</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We're on a mission to make identity management simple, secure, and accessible
              for organizations of all sizes.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Story */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Identity Framework was founded in 2020 with a simple vision: to make
                  enterprise-grade identity management accessible to organizations of all sizes.
                </p>
                <p>
                  Our founders, having experienced firsthand the complexity and cost of traditional
                  IAM solutions, set out to build something better—a platform that combines
                  powerful security features with an intuitive user experience.
                </p>
                <p>
                  Today, we're proud to serve thousands of organizations worldwide, from
                  fast-growing startups to Fortune 500 enterprises, helping them secure and
                  manage millions of digital identities.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <Globe className="h-24 w-24 text-primary/20 mx-auto mb-6" />
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Global Presence</h3>
                <p className="text-muted-foreground">
                  Serving customers in over 150 countries with data centers across
                  North America, Europe, and Asia-Pacific.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Leadership Team */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Awards */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center"
          >
            <Award className="h-12 w-12 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Award-Winning Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Recognized as a Leader in the Gartner Magic Quadrant for Identity Governance
              and Administration. Awarded "Best Identity Management Solution" by InfoSec Awards.
            </p>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
