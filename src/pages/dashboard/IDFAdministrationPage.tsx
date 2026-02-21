import { motion } from "framer-motion";
import { Database, LinkIcon, AppWindow } from "lucide-react";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthSourcesPage } from "./AuthSourcesPage";
import { ConnectorsPage } from "./ConnectorsPage";

export const IDFAdministrationPage = () => {
  const [activeTab, setActiveTab] = useState("auth-sources");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <AppWindow className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            IDF Administration
          </h1>
          <p className="text-muted-foreground">
            Manage authentication sources and outbound connectors
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="auth-sources" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Manage Auth Sources
          </TabsTrigger>
          <TabsTrigger value="connectors" className="gap-2">
            <Database className="h-4 w-4" />
            Outbound Connectors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auth-sources" className="mt-6">
          <AuthSourcesPage />
        </TabsContent>

        <TabsContent value="connectors" className="mt-6">
          <ConnectorsPage />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
