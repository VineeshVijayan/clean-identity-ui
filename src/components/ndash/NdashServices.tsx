import { motion } from "framer-motion";
import { 
  Globe, 
  Brain, 
  Shield, 
  RefreshCw, 
  Headphones, 
  Cloud, 
  Smartphone, 
  Settings 
} from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Web Application Development",
    description: "We create intuitive, effective web apps that are suited to your company's requirements. Custom solutions to bring your ideas to life."
  },
  {
    icon: Brain,
    title: "AI Services",
    description: "Unlock the potential of AI with our cutting-edge solutions designed to transform your business and drive efficiency."
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Our QA team ensures the highest standards for every project, delivering flawless performance and reliability."
  },
  {
    icon: RefreshCw,
    title: "App Modernization",
    description: "Transform your legacy apps into modern, high-performance solutions with enhanced functionality and security."
  },
  {
    icon: Headphones,
    title: "App Support",
    description: "Our dedicated support team ensures seamless performance and resolves any issues swiftly with proactive solutions."
  },
  {
    icon: Cloud,
    title: "Cloud Solutions",
    description: "Unlock the full potential of your business with our secure, scalable cloud solutions and seamless migration."
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description: "Transform your ideas into innovative digital solutions with our expert mobile app development services."
  },
  {
    icon: Settings,
    title: "DevOps Management",
    description: "Our DevOps services facilitate better collaboration between development and operations teams for faster delivery."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const
    }
  }
};

export const NdashServices = () => {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pattern-grid opacity-30" />
      
      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            What We Do
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We specialize in crafting AI-powered, automation-driven solutions tailored to your unique business challenges. 
            Our expert team ensures seamless technology integration to drive innovation.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={itemVariants}
                className="group relative bg-card rounded-2xl p-6 border border-border/50 card-hover cursor-pointer"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
