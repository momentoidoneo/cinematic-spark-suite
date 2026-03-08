import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Panel de Administración</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <ChangePasswordDialog />
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
