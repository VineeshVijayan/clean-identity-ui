import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  Database,
  FileText,
  Folder,
  Globe,
  Heart,
  Home,
  Key,
  Layers,
  Lock,
  Mail,
  Settings,
  Shield,
  UserCog,
  Users,
  Zap,
} from "lucide-react";

export const SIDEBAR_ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "Home", icon: Home },
  { name: "Users", icon: Users },
  { name: "Shield", icon: Shield },
  { name: "Settings", icon: Settings },
  { name: "FileText", icon: FileText },
  { name: "Database", icon: Database },
  { name: "Key", icon: Key },
  { name: "BarChart3", icon: BarChart3 },
  { name: "Briefcase", icon: Briefcase },
  { name: "Globe", icon: Globe },
  { name: "Lock", icon: Lock },
  { name: "UserCog", icon: UserCog },
  { name: "Folder", icon: Folder },
  { name: "Bell", icon: Bell },
  { name: "Mail", icon: Mail },
  { name: "Calendar", icon: Calendar },
  { name: "Layers", icon: Layers },
  { name: "Zap", icon: Zap },
  { name: "Heart", icon: Heart },
];

const ICON_BY_NAME = Object.fromEntries(
  SIDEBAR_ICON_OPTIONS.map((item) => [item.name, item.icon])
) as Record<string, LucideIcon>;

export const sidebarIcon = (name: string | undefined, fallback: LucideIcon): LucideIcon =>
  (name && ICON_BY_NAME[name]) || fallback;
