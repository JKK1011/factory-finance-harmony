
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  PieChart, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Building
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Contacts", path: "/contacts", icon: <Users className="w-5 h-5" /> },
  { label: "Transactions", path: "/transactions", icon: <CreditCard className="w-5 h-5" /> },
  { label: "Reports", path: "/reports", icon: <FileText className="w-5 h-5" /> },
  { label: "Analytics", path: "/analytics", icon: <PieChart className="w-5 h-5" /> },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Navigation */}
      <header className="flex h-16 items-center px-6 border-b transition-all duration-300 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Building className="h-6 w-6 text-primary" />
            <span>Factory Finance</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside 
          className={cn(
            "w-64 border-r bg-secondary/40 backdrop-blur-sm flex-shrink-0 flex flex-col transition-all duration-300",
            isMobile && "fixed inset-y-0 left-0 z-50 transform",
            isMobile && (isSidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full")
          )}
        >
          {isMobile && (
            <div className="h-16 flex items-center px-6 justify-between">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary hover:text-foreground"
                )}
                onClick={isMobile ? () => setIsSidebarOpen(false) : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
