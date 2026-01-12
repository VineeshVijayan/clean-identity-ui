import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Home,
  ShieldCheck,
  Database,
  ClipboardList,
  ShoppingCart,
  X,
  Key,
  UserMinus,
  UserX,
  Cog,
  Link as LinkIcon,
  Palette,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  roles: string[];
  onLogout: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  submenu?: { label: string; href: string; icon?: React.ElementType }[];
}

export const DashboardSidebar = ({ open, onClose, roles, onLogout }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [dynamicIcon, setDynamicIcon] = useState<string | null>(null);

  useEffect(() => {
    const savedIcon = localStorage.getItem("sidebarIcon");
    if (savedIcon) setDynamicIcon(savedIcon);
  }, []);

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasRole = (role: string) => roles.includes(role);
  const hasAllRoles = (required: string[]) => required.every((r) => roles.includes(r));

  // Base menu items
  const dashboardItem: MenuItem = {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  };

  const userManagementItem: MenuItem = {
    label: "User Management",
    icon: Home,
    submenu: [
      { label: "All Users", href: "/users", icon: Users },
      { label: "Create New User", href: "/users/create", icon: UserPlus },
      { label: "Request App Access", href: "/users/request", icon: FileText },
      { label: "Remove App Access", href: "/users/remove", icon: UserMinus },
    ],
  };

  const userManagementBasic: MenuItem = {
    label: "User Management",
    icon: Home,
    submenu: [
      { label: "All Users", href: "/users", icon: Users },
      { label: "Create New User", href: "/users/create", icon: UserPlus },
    ],
  };

  const roleBasedAccess: MenuItem = {
    label: "Role-Based Access",
    icon: ShieldCheck,
    submenu: [
      { label: "Create New Role", href: "/roles/new", icon: Key },
      { label: "Manage Existing Role", href: "/roles/manage", icon: Settings },
    ],
  };

  const idfAdministration: MenuItem = {
    label: "IDF Administration",
    icon: Database,
    submenu: [
      { label: "User Administration", href: "/admin/users", icon: Users },
      { label: "Permission", href: "/admin/permissions", icon: ShieldCheck },
      { label: "Manage Auth Sources", href: "/admin/auth-sources", icon: LinkIcon },
      { label: "Manage Outbound Connectors", href: "/admin/connectors", icon: Database },
      { label: "IDF Settings", href: "/admin/settings", icon: Cog },
    ],
  };

  const reporting: MenuItem = {
    label: "Reporting",
    icon: ClipboardList,
    submenu: [
      { label: "Create New Report", href: "/reports/new", icon: FileText },
      { label: "Run Report", href: "/reports/run", icon: ClipboardList },
    ],
  };

  const checkout: MenuItem = {
    label: "Checkout",
    icon: ShoppingCart,
    href: "/checkout",
  };

  // Build menu based on roles
  let menuItems: MenuItem[] = [];

  if (hasAllRoles(["super_admin", "user"])) {
    menuItems = [
      dashboardItem,
      userManagementItem,
      roleBasedAccess,
      idfAdministration,
      reporting,
      checkout,
    ];
  } else if (hasRole("administration") && hasRole("user") && !hasRole("super_admin")) {
    menuItems = [
      userManagementBasic,
      roleBasedAccess,
      reporting,
      checkout,
    ];
  } else if (hasRole("manager") && hasRole("user") && !hasRole("super_admin") && !hasRole("administration")) {
    menuItems = [
      userManagementBasic,
      reporting,
      checkout,
    ];
  } else if (hasRole("user")) {
    menuItems = [
      dashboardItem,
      checkout,
    ];
  } else {
    menuItems = [dashboardItem];
  }

  const isActiveRoute = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const handleNavigate = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            {dynamicIcon ? (
              <img src={dynamicIcon} alt="Logo" className="w-8 h-8 rounded" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            )}
            <span className="text-lg font-bold text-sidebar-foreground">
              Identity<span className="text-primary">Framework</span>
            </span>
          </Link>
          <button
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {openMenus[item.label] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openMenus[item.label] && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-4 mt-1 space-y-1"
                      >
                        {item.submenu.map((subItem) => (
                          <li key={subItem.label}>
                            <button
                              onClick={() => handleNavigate(subItem.href)}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                                isActiveRoute(subItem.href)
                                  ? "bg-primary/10 text-primary"
                                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                              )}
                            >
                              {subItem.icon && <subItem.icon className="h-4 w-4" />}
                              {subItem.label}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => item.href && handleNavigate(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActiveRoute(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowLogoutDialog(false);
                onLogout();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
