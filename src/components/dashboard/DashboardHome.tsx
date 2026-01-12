import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  FileText,
  ThumbsUp,
  Users,
  Activity,
  TrendingUp,
  Shield,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Chart data matching original repo
const donutData = [
  { name: "Active Users", value: 4000 },
  { name: "Pending Requests", value: 6000 },
  { name: "Approved Requests", value: 2000 },
  { name: "Roles Assigned", value: 8000 },
];

const COLORS = ["hsl(var(--primary))", "#56C596", "#379683", "#05386B"];

const barData = [
  { month: "Jan", Users: 10, Requests: 8, Approvals: 5 },
  { month: "Feb", Users: 20, Requests: 15, Approvals: 18 },
  { month: "Mar", Users: 15, Requests: 12, Approvals: 14 },
  { month: "Apr", Users: 10, Requests: 9, Approvals: 7 },
  { month: "May", Users: 18, Requests: 20, Approvals: 22 },
  { month: "Jun", Users: 12, Requests: 10, Approvals: 8 },
  { month: "Jul", Users: 20, Requests: 18, Approvals: 25 },
  { month: "Aug", Users: 15, Requests: 16, Approvals: 18 },
  { month: "Sep", Users: 8, Requests: 7, Approvals: 6 },
  { month: "Oct", Users: 18, Requests: 20, Approvals: 22 },
  { month: "Nov", Users: 10, Requests: 9, Approvals: 8 },
  { month: "Dec", Users: 14, Requests: 15, Approvals: 18 },
];

const stats = [
  { label: "Total Users", value: "12,847", change: "+12%", icon: Users, color: "bg-primary/10 text-primary" },
  { label: "Active Sessions", value: "1,243", change: "+8%", icon: Activity, color: "bg-green-500/10 text-green-500" },
  { label: "API Calls Today", value: "89.2K", change: "+24%", icon: TrendingUp, color: "bg-cyan-500/10 text-cyan-500" },
  { label: "Auth Success Rate", value: "99.8%", change: "+0.2%", icon: Shield, color: "bg-emerald-500/10 text-emerald-500" },
];

export const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Quick Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        <button
          onClick={() => navigate("/users/create")}
          className="glass-card p-6 flex items-center gap-4 hover:bg-primary/5 transition-colors group"
          style={{ background: "linear-gradient(135deg, hsl(280 60% 40% / 0.3), hsl(280 60% 30% / 0.2))" }}
        >
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">Create New User</span>
        </button>

        <button
          onClick={() => navigate("/users/request")}
          className="glass-card p-6 flex items-center gap-4 hover:bg-primary/5 transition-colors group"
          style={{ background: "linear-gradient(135deg, hsl(20 90% 45% / 0.3), hsl(20 90% 35% / 0.2))" }}
        >
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">My Requests</span>
        </button>

        <button
          onClick={() => navigate("/approvals")}
          className="glass-card p-6 flex items-center gap-4 hover:bg-primary/5 transition-colors group"
          style={{ background: "linear-gradient(135deg, hsl(240 80% 50% / 0.3), hsl(240 80% 40% / 0.2))" }}
        >
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
            <ThumbsUp className="h-7 w-7 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">My Approvals</span>
        </button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <div key={index} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5" />
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

      {/* Charts Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Current Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Application Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Bar dataKey="Users" stackId="a" fill="#2F9E44" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Requests" stackId="a" fill="#FAB005" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Approvals" stackId="a" fill="#15AABF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* App Access Overview & Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        {/* App Access Overview */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Application Access Overview</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Total Applications Integrated</span>
                <span className="font-semibold">8,374</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Top 5 Apps by Number of Users</span>
                <span className="font-semibold">9,714</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "14%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Pending App Access Requests</span>
                <span className="font-semibold">6,871</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "28%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Audit */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Security & Audit Logs</h3>
          <p className="text-4xl font-bold mb-6">1,650</p>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Failed Logins (last 7 days)</span>
              <span className="font-semibold">87</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Password Reset Requests</span>
              <span className="font-semibold">200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">MFA Enabled Users</span>
              <span className="font-semibold">160</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="flex-1" variant="default">
              Request
            </Button>
            <Button className="flex-1" variant="outline">
              Transfer
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
