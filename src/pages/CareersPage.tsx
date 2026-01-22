import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Briefcase,
  MapPin,
  Clock,
  Heart,
  Coffee,
  Globe,
  Zap,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const openings = [
  {
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "San Francisco, CA",
    type: "Full-time",
  },
  {
    title: "Security Engineer",
    department: "Security",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "New York, NY",
    type: "Full-time",
  },
  {
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Austin, TX",
    type: "Full-time",
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health, dental, and vision coverage for you and your family.",
  },
  {
    icon: Coffee,
    title: "Flexible Work",
    description: "Work from anywhere with flexible hours that fit your lifestyle.",
  },
  {
    icon: Globe,
    title: "Unlimited PTO",
    description: "Take the time you need to recharge and maintain work-life balance.",
  },
  {
    icon: Zap,
    title: "Learning Budget",
    description: "$2,000 annual budget for courses, conferences, and professional development.",
  },
  {
    icon: Users,
    title: "Team Events",
    description: "Regular team gatherings, offsites, and virtual social events.",
  },
  {
    icon: Briefcase,
    title: "Equity Package",
    description: "Competitive equity package so you share in our success.",
  },
];

const values = [
  "We embrace diversity and inclusion",
  "We value work-life balance",
  "We encourage continuous learning",
  "We celebrate wins together",
];

export const CareersPage = () => {
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
              Join Our <span className="text-primary">Team</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Help us build the future of identity management. We're looking for
              passionate people who want to make a difference.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {values.map((value, index) => (
                <Badge key={index} variant="outline" className="px-4 py-2">
                  {value}
                </Badge>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Work With Us</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {openings.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{job.department}</Badge>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0">
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))",
            }}
          >
            <h2 className="text-2xl font-bold mb-4">Don't See a Perfect Fit?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              We're always looking for talented people. Send us your resume and we'll
              keep you in mind for future opportunities.
            </p>
            <Button variant="hero" size="lg">
              Send Your Resume
            </Button>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CareersPage;
