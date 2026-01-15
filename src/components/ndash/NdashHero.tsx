import { motion } from "framer-motion";
import { ArrowRight, Code2, Cloud, Brain, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingIcons = [
  { Icon: Code2, delay: 0, position: "top-20 left-[10%]" },
  { Icon: Cloud, delay: 0.2, position: "top-32 right-[15%]" },
  { Icon: Brain, delay: 0.4, position: "bottom-32 left-[15%]" },
  { Icon: Smartphone, delay: 0.6, position: "bottom-20 right-[10%]" },
];

export const NdashHero = () => {
  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, delay, position }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} hidden lg:block`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: [0.4, 0.7, 0.4],
            y: [0, -15, 0],
          }}
          transition={{ 
            duration: 4,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
      ))}

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-medium text-accent-foreground">
              Empowering Digital Transformation
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Crafting{" "}
            <span className="text-gradient">Scalable Solutions</span>
            <br />
            for a Smarter Future
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            At Ndash, we revolutionize the digital world with tailored app development solutions. 
            We specialize in web and mobile applications, seamlessly integrating AI and cloud technologies.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={scrollToContact}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-full text-lg group"
            >
              Contact Us
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <a href="#services">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 rounded-full text-lg border-2 hover:bg-secondary"
              >
                Explore Services
              </Button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "50+", label: "Projects Delivered" },
              { value: "30+", label: "Happy Clients" },
              { value: "5+", label: "Years Experience" },
              { value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
