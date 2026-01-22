import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Bell,
  ChevronRight,
  Clock,
  Key,
  LogOut,
  Menu,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const mockStats = [
  { label: "Total Users", value: "12,847", change: "+12%", icon: Users, color: "text-primary" },
  { label: "Active Sessions", value: "1,243", change: "+8%", icon: Activity, color: "text-green-400" },
  { label: "API Calls Today", value: "89.2K", change: "+24%", icon: TrendingUp, color: "text-cyan-400" },
  { label: "Auth Success Rate", value: "99.8%", change: "+0.2%", icon: UserCheck, color: "text-emerald-400" },
];

const mockActivity = [
  { user: "john@acme.com", action: "Logged in", time: "2 min ago", icon: UserCheck },
  { user: "sarah@startup.io", action: "Password reset", time: "15 min ago", icon: Key },
  { user: "mike@corp.com", action: "MFA enabled", time: "1 hour ago", icon: Shield },
  { user: "emma@tech.co", action: "New registration", time: "2 hours ago", icon: Plus },
  { user: "alex@dev.org", action: "Session expired", time: "3 hours ago", icon: Clock },
];

const sidebarItems = [
  { label: "Dashboard", icon: Activity, href: "/dashboard", active: true },
  { label: "Users", icon: Users, href: "/dashboard/users" },
  { label: "Authentication", icon: Key, href: "/dashboard/auth" },
  { label: "Security", icon: Shield, href: "/dashboard/security" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/Identity.png"
              alt="Identity Framework"
              className="h-7 w-7 object-contain rounded"
            />
            <span className="text-lg font-bold">
              Identity<span className="text-primary">Framework</span>
            </span>
          </Link>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users, logs..."
                className="h-10 w-64 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <Avatar className="h-9 w-9 hidden sm:flex">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, John</h1>
            <p className="text-muted-foreground">Here's what's happening with your identity platform.</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
          >
            {mockStats.map((stat, index) => (
              <div key={index} className="glass-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 glass-card p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-4">
                {mockActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <activity.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      <button className="p-1 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5 sm:p-6"
            >
              <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Plus className="h-4 w-4 mr-3" />
                  Add New User
                </Button>
                <Button variant="outline" className="w-full justify-start h-12">
                  <Key className="h-4 w-4 mr-3" />
                  Generate API Key
                </Button>
                <Button variant="outline" className="w-full justify-start h-12">
                  <Shield className="h-4 w-4 mr-3" />
                  Security Audit
                </Button>
                <Button variant="outline" className="w-full justify-start h-12">
                  <Settings className="h-4 w-4 mr-3" />
                  Configure SSO
                </Button>
              </div>

              {/* Alert */}
              <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Security Alert</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      3 failed login attempts detected from suspicious IP addresses.
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-primary">
                      Review now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
