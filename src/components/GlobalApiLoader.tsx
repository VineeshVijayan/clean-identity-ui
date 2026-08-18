import { loadingStore } from "@/services/loading-store";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const GlobalApiLoader = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => loadingStore.subscribe(setPendingCount), []);

  if (pendingCount === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-5 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};
