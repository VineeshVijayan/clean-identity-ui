import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AppWindow, Globe, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

interface Application {
  id: number;
  name: string;
  description: string;
  appUrl: string;
  integrationName: string;
  active: boolean;
}

export const ManageApplicationPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return applications;
    return applications.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.integrationName.toLowerCase().includes(q)
    );
  }, [applications, search]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(
          "https://identity-api.ndashdigital.com/api/applications",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch applications");

        const data = await res.json();
        const list = data.data || data;
        setApplications(list);
      } catch (err) {
        console.error("Failed to load applications", err);
      } finally {
        setLoading(false);
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
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

                    {app.appUrl && (
                      <a
                        href={app.appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        Visit Application
                      </a>
                    )}
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
