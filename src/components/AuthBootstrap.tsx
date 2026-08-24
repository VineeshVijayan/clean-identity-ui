import { initializeAuthSession } from "@/services/jwt-service";
import { useEffect } from "react";

/**
 * Restores/refreshes auth session on app load before route guards run.
 */
export const AuthBootstrap = () => {
  useEffect(() => {
    void initializeAuthSession();
  }, []);

  return null;
};
