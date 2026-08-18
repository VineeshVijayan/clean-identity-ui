import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { identityFetch } from "@/services/api-config";
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AppWindow, Globe, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Application {
  id: number;
  name: string;
  description: string;
  appUrl: string;
  integrationName: string;
  active: boolean;
}

export const ManageApplicationPage = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!Array.isArray(applications)) return [];

    const q = search.toLowerCase().trim();

    if (!q) return applications;

    return applications.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.integrationName?.toLowerCase().includes(q)
    );
  }, [applications, search]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await identityFetch("/applications");

        if (!res.ok) {
          const body = await readResponseBody(res);
          toast({
            title: "Error",
            description: getApiErrorMessage(body, "Failed to load applications"),
            variant: "destructive",
          });
          return;
        }

        const data = await res.json();
        const list =
          data?.data?.content ||
          data?.data?.applications ||
          data?.data ||
          [];
        setApplications(list);
      } catch (err) {
        console.error("Failed to load applications", err);
        toast({
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load applications"),
          variant: "destructive",
        });
      } finally {
        setLoaded(true);
      }
    };

    fetchApplications();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <AppWindow className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Manage Applications</h1>
            <p className="text-muted-foreground">
              View all available applications in your organization
            </p>
          </div>
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {!loaded ? null : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <AppWindow className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No applications found</p>
              <p className="text-sm">
                {search
                  ? "Try adjusting your search terms"
                  : "No applications are currently available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((app) => (
                <Card
                  key={app.id}
                  className="group border border-border hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {app.name}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {app.integrationName}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={app.active ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {app.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {app.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
