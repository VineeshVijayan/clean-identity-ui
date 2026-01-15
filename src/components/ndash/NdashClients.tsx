import { motion } from "framer-motion";

const clients = [
  {
    name: "Uja App",
    logo: "https://cdn.sanity.io/images/liehngtt/production/dc97878efe6d4ce78ed58d4d84eb77a35fceb22c-883x344.png"
  },
  {
    name: "Kakariki",
    logo: "https://cdn.sanity.io/images/liehngtt/production/4f12eb2d9392c318b26e9023ab62d5017655aa21-3123x3123.png"
  },
  {
    name: "The Federal Bank Ltd",
    logo: "https://cdn.sanity.io/images/liehngtt/production/7bcd405b7447879bce5aab77e717bada01add8f0-2560x791.png"
  }
];

export const NdashClients = () => {
  return (
    <section id="clients" className="py-24 bg-secondary/30">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Trusted By
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Our <span className="text-gradient">Clients</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We serve a wide range of companies, from startups to multinational corporations. 
            We take great satisfaction in offering customized IT solutions that promote growth and innovation.
          </p>
        </motion.div>

        {/* Client Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
        >
          {clients.map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              className="bg-card rounded-2xl p-8 border border-border/50 flex items-center justify-center min-h-[120px] card-hover"
            >
              <img
                src={client.logo}
                alt={client.name}
                className="max-h-20 w-auto object-contain filter dark:brightness-0 dark:invert opacity-70 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-6">
            Trusted by leading companies across various industries
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            {["Banking", "Healthcare", "E-Commerce", "Education", "Logistics"].map((industry) => (
              <span key={industry} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {industry}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
