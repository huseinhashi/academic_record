//src/components/layouts/DashboardLayout.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  FileText,
  Building,
  GraduationCap,
  BookOpen,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get base path based on user type
  const getBasePath = () => {
    if (user?.userType === "Admin") {
      return "/admin";
    } else if (user?.userType === "Student") {
      return "/student";
    } else if (user?.userType === "Institution") {
      return "/institution";
    } else if (user?.userType === "Company") {
      return "/company";
    } else {
      return "/dashboard";
    }
  };

  const basePath = getBasePath();

  // Define navigation items based on user type
  const getNavItems = () => {
    // Default dashboard item
    const items = [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: `${basePath}/dashboard`,
        description: "Overview of your account",
      }
    ];

    // Admin-specific items
    if (user?.userType === "Admin") {
      items.push(
        {
          title: "Users",
          icon: Users,
          href: `${basePath}/users`,
          description: "Manage all system users",
        }
      );
    } 
    // Student-specific items
    else if (user?.userType === "Student") {
      items.push(
        {
          title: "Academic Records",
          icon: FileText,
          href: `${basePath}/records`,
          description: "View your academic records",
        },
        // {
        //   title: "Academic Details",
        //   icon: BookOpen,
        //   href: `${basePath}/academic`,
        //   description: "View detailed academic credentials",
        // },
        {
          title: "Job Opportunities",
          icon: Briefcase,
          href: `${basePath}/jobs`,
          description: "Find and apply to job opportunities",
        }
      );
    }
    // Institution-specific items
    else if (user?.userType === "Institution") {
      items.push(
        // {
        //   title: "Students",
        //   icon: GraduationCap,
        //   href: `${basePath}/students`,
        //   description: "Manage your students",
        // },
        {
          title: "Academic Records",
          icon: FileText,
          href: `${basePath}/records`,
          description: "Manage academic records",
        }
      );
    }
    // Company-specific items
    else if (user?.userType === "Company") {
      items.push(
        {
          title: "Job Postings",
          icon: Briefcase,
          href: `${basePath}/jobs`,
          description: "Manage job postings and applications",
        }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  const shortenWallet = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 lg:hidden z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 bg-card border-r transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20",
          "lg:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn(
          "flex h-16 items-center px-4 border-b",
          isSidebarOpen ? "justify-between" : "justify-center"
        )}>
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Academic Records</h1>
            </div>
          )}
          {!isSidebarOpen && (
            <BookOpen className="h-6 w-6 text-primary" />
          )}
          <button
            onClick={() => {
              if (windowWidth >= 1024) {
                setIsSidebarOpen(!isSidebarOpen);
              } else {
                setIsMobileMenuOpen(false);
              }
            }}
            className="p-1 rounded-full hover:bg-muted transition-colors hidden lg:flex"
          >
            {isSidebarOpen ? 
              <ChevronLeft className="h-5 w-5 text-foreground" /> : 
              <ChevronRight className="h-5 w-5 text-foreground" />
            }
          </button>
        </div>

        <div className="py-4 flex flex-col h-[calc(100%-4rem)] justify-between">
          <TooltipProvider delayDuration={isSidebarOpen ? 700 : 0}>
            <nav className="px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className={cn(
                          "flex-shrink-0",
                          isSidebarOpen ? "h-5 w-5" : "h-6 w-6"
                        )} />
                        {isSidebarOpen && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {!isSidebarOpen && (
                      <TooltipContent side="right" className="max-w-xs">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>

          <div className="px-3 mt-auto">
            {isSidebarOpen && (
              <div className="mb-4 p-3 rounded-lg bg-muted">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{shortenWallet(user?.wallet)}</p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase">
                    {user?.userType || "User"}
                  </p>
                </div>
              </div>
            )}
            
            <TooltipProvider delayDuration={isSidebarOpen ? 700 : 0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center gap-3 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive",
                      !isSidebarOpen && "justify-center px-0"
                    )}
                    onClick={() => logout()}
                  >
                    <LogOut className="h-5 w-5" />
                    {isSidebarOpen && <span>Logout</span>}
                  </Button>
                </TooltipTrigger>
                {!isSidebarOpen && (
                  <TooltipContent side="right">
                    <p className="font-medium">Logout</p>
                    <p className="text-xs text-muted-foreground">Sign out of your account</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
      )}>
        <header className="sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur-sm px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="text-lg font-semibold">
              {user?.userType} Portal
            </div>
          </div>
          
          <div className="flex items-center">
            {!isSidebarOpen && (
              <div className="hidden md:block mr-4">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{shortenWallet(user?.wallet)}</div>
              </div>
            )}
            
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </header>
        
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};