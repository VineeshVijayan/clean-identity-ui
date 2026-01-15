import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardHome } from "./components/dashboard/DashboardHome";
import { UsersListPage } from "./pages/dashboard/UsersListPage";
import { CreateUserPage } from "./pages/dashboard/CreateUserPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes with Layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersListPage />} />
          </Route>
          
          {/* User Management Routes */}
          <Route path="/users" element={<DashboardLayout />}>
            <Route index element={<UsersListPage />} />
            <Route path="create" element={<CreateUserPage />} />
            <Route path="request" element={<DashboardHome />} />
            <Route path="remove" element={<DashboardHome />} />
          </Route>

          {/* Role Management Routes */}
          <Route path="/roles" element={<DashboardLayout />}>
            <Route path="new" element={<DashboardHome />} />
            <Route path="manage" element={<DashboardHome />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="users" element={<UsersListPage />} />
            <Route path="permissions" element={<DashboardHome />} />
            <Route path="auth-sources" element={<DashboardHome />} />
            <Route path="connectors" element={<DashboardHome />} />
            <Route path="settings" element={<DashboardHome />} />
          </Route>

          {/* Other Routes */}
          <Route path="/reports" element={<DashboardLayout />}>
            <Route path="new" element={<DashboardHome />} />
            <Route path="run" element={<DashboardHome />} />
          </Route>
          
          <Route path="/checkout" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>
          
          <Route path="/profile" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>
          
          <Route path="/settings" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>
          
          <Route path="/change-password" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>
          
          <Route path="/approvals" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
