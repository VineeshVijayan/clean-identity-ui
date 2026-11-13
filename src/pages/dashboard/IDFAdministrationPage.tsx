import { Cloud, Database, LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthSourcesPage } from "./AuthSourcesPage";

export const IDFAdministrationPage = () => {
  const [activeTab, setActiveTab] = useState("auth-source");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <LinkIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Connectors
          </h1>
          <p className="text-muted-foreground">
            Manage the identity directory used for authentication and the HR source used for employee data
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="auth-source" className="gap-2">
            <Cloud className="h-4 w-4" />
            Auth Source
          </TabsTrigger>
          <TabsTrigger value="hr-tool" className="gap-2">
            <Database className="h-4 w-4" />
            HR Tool
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auth-source" className="mt-6">
          <AuthSourcesPage type="DIRECTORY" embedded />
        </TabsContent>

        <TabsContent value="hr-tool" className="mt-6">
          <AuthSourcesPage type="HR" embedded />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
