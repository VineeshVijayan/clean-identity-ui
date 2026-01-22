import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Book,
  Code,
  FileText,
  Rocket,
  Shield,
  Key,
  Database,
  Link as LinkIcon,
  Search,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const quickStartGuides = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Set up your Identity Framework instance in minutes",
    href: "#getting-started",
  },
  {
    icon: Shield,
    title: "Authentication",
    description: "Configure authentication methods and policies",
    href: "#authentication",
  },
  {
    icon: Key,
    title: "Authorization",
    description: "Set up roles, permissions, and access control",
    href: "#authorization",
  },
  {
    icon: Database,
    title: "Data Sources",
    description: "Connect to identity providers and directories",
    href: "#data-sources",
  },
];

const apiDocs = [
  {
    title: "REST API Reference",
    description: "Complete REST API documentation with examples",
    icon: Code,
  },
  {
    title: "SDKs & Libraries",
    description: "Official SDKs for JavaScript, Python, Java, and more",
    icon: FileText,
  },
  {
    title: "Webhooks",
    description: "Real-time event notifications for your applications",
    icon: LinkIcon,
  },
];

const resources = [
  { title: "User Management", count: 12 },
  { title: "Authentication", count: 8 },
  { title: "Authorization", count: 15 },
  { title: "Connectors", count: 6 },
  { title: "Security", count: 10 },
  { title: "Troubleshooting", count: 5 },
];

export const DocsPage = () => {
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
            <Book className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Documentation
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Comprehensive guides and API references to help you integrate and
              use Identity Framework effectively.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-12 h-14 text-lg"
              />
            </div>
          </motion.div>
        </section>

        {/* Quick Start Guides */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold mb-6">Quick Start Guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStartGuides.map((guide, index) => (
              <motion.a
                key={index}
                href={guide.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-5 hover:border-primary/30 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <guide.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {guide.title}
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  {guide.description}
                </p>
              </motion.a>
            ))}
          </div>
        </section>

        {/* API Documentation */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold mb-6">API Documentation</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {apiDocs.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary/30 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                      <doc.icon className="h-5 w-5 text-accent" />
                    </div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Resources by Category */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-between"
              >
                <span className="font-medium">{resource.title}</span>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                  {resource.count} articles
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Help Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                Join Community
              </a>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DocsPage;
