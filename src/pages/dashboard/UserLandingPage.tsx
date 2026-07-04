import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const UserLandingPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <div className="glass-card p-10 max-w-2xl text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">
          This is your personal landing page. More features and updates will be
          available here soon.
        </p>
      </div>
    </motion.div>
  );
};

export default UserLandingPage;
