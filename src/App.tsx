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
import { ApplicationManagementPage } from "./pages/dashboard/ApplicationManagementPage";
import { NewRolePage } from "./pages/dashboard/NewRolePage";
import { ManageRolesPage } from "./pages/dashboard/ManageRolesPage";
import { AuthSourcesPage } from "./pages/dashboard/AuthSourcesPage";
import { ConnectorsPage } from "./pages/dashboard/ConnectorsPage";
import { CheckoutPage } from "./pages/dashboard/CheckoutPage";
import { IDFSettingsPage } from "./pages/dashboard/IDFSettingsPage";
import { ChangePasswordPage } from "./pages/dashboard/ChangePasswordPage";
import { DetailedReportPage } from "./pages/dashboard/DetailedReportPage";
import FeaturesPage from "./pages/FeaturesPage";
import DocsPage from "./pages/DocsPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import CareersPage from "./pages/CareersPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SecurityPage from "./pages/SecurityPage";

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
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          
          {/* Dashboard Routes with Layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersListPage />} />
          </Route>
          
          {/* User Management Routes */}
          <Route path="/users" element={<DashboardLayout />}>
            <Route index element={<UsersListPage />} />
            <Route path="create" element={<CreateUserPage />} />
            <Route path="applications" element={<ApplicationManagementPage />} />
          </Route>

          {/* Role Management Routes */}
          <Route path="/roles" element={<DashboardLayout />}>
            <Route path="new" element={<NewRolePage />} />
            <Route path="manage" element={<ManageRolesPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="users" element={<UsersListPage />} />
            <Route path="permissions" element={<DashboardHome />} />
            <Route path="auth-sources" element={<AuthSourcesPage />} />
            <Route path="connectors" element={<ConnectorsPage />} />
            <Route path="settings" element={<IDFSettingsPage />} />
          </Route>

          {/* Other Routes */}
          <Route path="/reports" element={<DashboardLayout />}>
            <Route path="new" element={<DashboardHome />} />
            <Route path="run" element={<DashboardHome />} />
            <Route path="detailed" element={<DetailedReportPage />} />
          </Route>
          
          <Route path="/checkout" element={<DashboardLayout />}>
            <Route index element={<CheckoutPage />} />
          </Route>
          
          <Route path="/profile" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>
          
          <Route path="/settings" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>
          
          <Route path="/change-password" element={<DashboardLayout />}>
            <Route index element={<ChangePasswordPage />} />
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
