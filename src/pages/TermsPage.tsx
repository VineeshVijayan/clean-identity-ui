import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileText, Calendar } from "lucide-react";

export const TermsPage = () => {
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
              <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
              <p className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last updated: January 15, 2025
              </p>
            </div>

            <div className="glass-card p-8 prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing or using Identity Framework services, you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                Identity Framework provides identity and access management solutions including but
                not limited to user authentication, authorization, single sign-on, and identity governance.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring your account information is accurate and current</li>
              </ul>

              <h2 className="text-xl font-semibold mt-6 mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to any systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Transmit malware or other harmful code</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>

              <h2 className="text-xl font-semibold mt-6 mb-4">5. Service Level Agreement</h2>
              <p className="text-muted-foreground mb-4">
                We strive to maintain 99.99% uptime for our services. Specific SLA terms may be
                outlined in your service agreement. Scheduled maintenance windows will be
                communicated in advance.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                All content, features, and functionality of Identity Framework are owned by us
                and are protected by international copyright, trademark, and other intellectual
                property laws.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">7. Payment Terms</h2>
              <p className="text-muted-foreground mb-4">
                Subscription fees are billed in advance. All fees are non-refundable except as
                expressly stated in these terms. We reserve the right to modify pricing with
                30 days notice.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                To the maximum extent permitted by law, Identity Framework shall not be liable
                for any indirect, incidental, special, consequential, or punitive damages resulting
                from your use of the service.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">9. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We may terminate or suspend your account at any time for violation of these terms.
                Upon termination, your right to use the service will immediately cease.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. We will notify users of
                material changes via email or through the service. Continued use after changes
                constitutes acceptance of the new terms.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">11. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at:<br />
                Email: legal@identityframework.com<br />
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

export default TermsPage;
