import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, Calendar } from "lucide-react";

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last updated: January 15, 2025
              </p>
            </div>

            <div className="glass-card p-8 prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold mt-6 mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Identity Framework ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our identity management platform and services.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Account information (name, email, password)</li>
                <li>Profile information (job title, organization)</li>
                <li>Usage data and analytics</li>
                <li>Communication preferences</li>
              </ul>

              <h2 className="text-xl font-semibold mt-6 mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve user experience</li>
              </ul>

              <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational measures to protect your
                personal data against unauthorized access, alteration, disclosure, or destruction.
                This includes encryption, access controls, and regular security assessments.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">5. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes
                for which it was collected, including to satisfy legal, accounting, or reporting requirements.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have certain rights regarding your personal data, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to request deletion of your data</li>
                <li>Right to restrict or object to processing</li>
                <li>Right to data portability</li>
              </ul>

              <h2 className="text-xl font-semibold mt-6 mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to collect and track information
                about your browsing activities. You can control cookie preferences through your browser settings.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">8. Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">
                Our services may contain links to third-party websites or integrate with third-party
                services. We are not responsible for the privacy practices of these third parties.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-muted-foreground">
                Email: privacy@identityframework.com<br />
                Address: 123 Innovation Drive, San Francisco, CA 94105
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
