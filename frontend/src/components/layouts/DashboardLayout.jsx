//src/components/layouts/DashboardLayout.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Briefcase,
  ClipboardList,
  BarChart3,
  Shield,
  User,
  School,
  Building2,
  Settings,
  Bell,
  KeyRound,
  Trash2,
  CheckCheck,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  History,
  UserCircle,
  HelpCircle,
  Clock1,
  Search,
  Grid3X3,
  List,
  Plus,
  Upload,
  Monitor,
  Users as UsersIcon,
  Clock as ClockIcon,
  Trash,
  Star,
  RotateCcw,
  Cloud,
  Image as ImageIcon,
  ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { LoaderCircle } from "@/components/LoaderCircle";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "../theme/ThemeToggle";

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const { 
    notifications, 
    allNotifications,
    unreadCount, 
    loading: notificationsLoading,
    loadingAll,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchAllNotifications
  } = useNotifications();
  const { toast } = useToast();

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
          icon: Shield,
          href: `${basePath}/users/admins`,
          description: "Manage system administrators",
        },
        {
          title: "Graduates",
          icon: User,
          href: `${basePath}/users/students`,
          description: "Manage graduate students",
        },
        {
          title: "Institutions",
          icon: School,
          href: `${basePath}/users/institutions`,
          description: "Manage educational institutions",
        },
        {
          title: "Companies",
          icon: Building2,
          href: `${basePath}/users/companies`,
          description: "Manage company accounts",
        },
        {
          title: "Academic Records",
          icon: FileText,
          href: `${basePath}/records`,
          description: "View and manage academic records",
        },
        {
          title: "Skills",
          icon: Star,
          href: `${basePath}/skills`,
          description: "Manage skills for students and companies",
        },
        {
          title: "Jobs",
          icon: Briefcase,
          href: `${basePath}/jobs`,
          description: "View and manage job postings",
        },
        {
          title: "Applications",
          icon: ClipboardList,
          href: `${basePath}/applications`,
          description: "View and manage job applications",
        },
        {
          title: "Reports",
          icon: BarChart3,
          href: `${basePath}/reports`,
          description: "View and export system reports",
          subItems: [
            {
              title: "User Registration",
              icon: Users,
              href: `${basePath}/reports/users`,
              description: "User registration and activity reports",
            },
            {
              title: "Academic Records",
              icon: FileText,
              href: `${basePath}/reports/records`,
              description: "Academic records and verification reports",
            },
            {
              title: "Job Applications",
              icon: ClipboardList,
              href: `${basePath}/reports/applications`,
              description: "Job application and hiring reports",
            },
            {
              title: "Job Postings",
              icon: Briefcase,
              href: `${basePath}/reports/jobs`,
              description: "Job posting and recruitment reports",
            },
            {
              title: "Verification Status",
              icon: CheckCircle,
              href: `${basePath}/reports/verifications`,
              description: "Account and record verification reports",
            },
          ],
        },
        {
          title: "Profile",
          icon: UserCircle,
          href: "/profile",
          description: "Manage your account profile",
        },
        {
          title: "Help & Support",
          icon: HelpCircle,
          href: "/help-support",
          description: "Get help and contact support",
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
        {
          title: "Job Opportunities",
          icon: Briefcase,
          href: `${basePath}/jobs`,
          description: "Find and apply to job opportunities",
        },
        {
          title: "Notifications",
          icon: Bell,
          href: `${basePath}/notifications`,
          description: "View and manage your notifications",
        },
        {
          title: "Reports",
          icon: BarChart3,
          href: `${basePath}/reports`,
          description: "Generate and export reports",
          subItems: [
            {
              title: "Academic Records",
              icon: FileText,
              href: `${basePath}/reports/records`,
              description: "Academic records and verification reports",
            },
            {
              title: "Job Applications",
              icon: Briefcase,
              href: `${basePath}/reports/applications`,
              description: "Job application and hiring reports",
            },
            {
              title: "Interview History",
              icon: Calendar,
              href: `${basePath}/reports/interviews`,
              description: "Interview history and feedback reports",
            },
            {
              title: "Academic Progress",
              icon: GraduationCap,
              href: `${basePath}/reports/progress`,
              description: "Academic progress and achievement reports",
            },
          ],
        },
        {
          title: "Profile",
          icon: UserCircle,
          href: "/profile",
          description: "Manage your account profile",
        },
        {
          title: "Help & Support",
          icon: HelpCircle,
          href: "/help-support",
          description: "Get help and contact support",
        }
      );
    }
    // Institution-specific items
    else if (user?.userType === "Institution") {
      items.push(
        {
          title: "Academic Records",
          icon: FileText,
          href: `${basePath}/records`,
          description: "Manage academic records",
          subItems: [
            {
              title: "Pending Records",
              icon: Clock1,
              href: `${basePath}/records`,
              description: "View your pending academic records",
            },
            {
              title: "Verified Records",
              icon: FileText,
              href: `${basePath}/records`,
              description: "View your verified academic records",
            },
          ],
        },
        {
          title: "Notifications",
          icon: Bell,
          href: `${basePath}/notifications`,
          description: "View and manage your notifications",
        },
        {
          title: "Reports",
          icon: BarChart3,
          href: `${basePath}/reports`,
          description: "Generate and export reports",
          subItems: [
            {
              title: "Student Registration",
              icon: Users,
              href: `${basePath}/reports/students`,
              description: "Student registration and activity reports",
            },
            {
              title: "Academic Records",
              icon: FileText,
              href: `${basePath}/reports/records`,
              description: "Academic records and verification reports",
            },
            {
              title: "Verification Status",
              icon: CheckCircle,
              href: `${basePath}/reports/verifications`,
              description: "Record verification status reports",
            },
            {
              title: "Graduation Analytics",
              icon: GraduationCap,
              href: `${basePath}/reports/graduations`,
              description: "Graduation and completion reports",
            },
          ],
        },
        {
          title: "Profile",
          icon: UserCircle,
          href: "/profile",
          description: "Manage your account profile",
        },
        {
          title: "Help & Support",
          icon: HelpCircle,
          href: "/help-support",
          description: "Get help and contact support",
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
        },
        {
          title: "Interviews",
          icon: Calendar,
          href: `${basePath}/interviews/schedule`,
          description: "Manage interview process",
          subItems: [
            {
              title: "Schedule Interview",
              icon: Calendar,
              href: `${basePath}/interviews/schedule`,
              description: "Schedule new interviews",
            },
            {
              title: "Upcoming Interviews",
              icon: Clock,
              href: `${basePath}/interviews/upcoming`,
              description: "View and manage upcoming interviews",
            },
            {
              title: "Past Interviews",
              icon: History,
              href: `${basePath}/interviews/past`,
              description: "View completed interviews",
            },
          ],
        },
        {
          title: "Notifications",
          icon: Bell,
          href: `${basePath}/notifications`,
          description: "View and manage your notifications",
        },
        {
          title: "Reports",
          icon: BarChart3,
          href: `${basePath}/reports`,
          description: "Generate and export reports",
          subItems: [
            {
              title: "Job Postings",
              icon: Briefcase,
              href: `${basePath}/reports/jobs`,
              description: "Job posting and recruitment reports",
            },
            {
              title: "Job Applications",
              icon: Users,
              href: `${basePath}/reports/applications`,
              description: "Job application and hiring reports",
            },
            {
              title: "Interviews",
              icon: Calendar,
              href: `${basePath}/reports/interviews`,
              description: "Interview scheduling and feedback reports",
            },
            {
              title: "Hiring Analytics",
              icon: BarChart3,
              href: `${basePath}/reports/hiring`,
              description: "Hiring success and analytics reports",
            },
          ],
        },
        {
          title: "Profile",
          icon: UserCircle,
          href: "/profile",
          description: "Manage your account profile",
        },
        {
          title: "Help & Support",
          icon: HelpCircle,
          href: "/help-support",
          description: "Get help and contact support",
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ACCOUNT_APPROVED':
      case 'ACCOUNT_REJECTED':
        return <AlertCircle className="h-4 w-4" />;
      case 'RECORD_VERIFIED':
      case 'RECORD_REJECTED':
        return <FileText className="h-4 w-4" />;
      case 'JOB_APPLICATION_RECEIVED':
      case 'JOB_APPLICATION_APPROVED':
      case 'JOB_APPLICATION_REJECTED':
      case 'JOB_HIRED':
        return <Briefcase className="h-4 w-4" />;
      case 'NEW_USER_REGISTERED':
        return <User className="h-4 w-4" />;
      case 'NEW_COMPANY_REGISTERED':
        return <Building2 className="h-4 w-4" />;
      case 'NEW_INSTITUTION_REGISTERED':
        return <School className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Get color based on notification type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'ACCOUNT_APPROVED':
      case 'RECORD_VERIFIED':
      case 'JOB_APPLICATION_APPROVED':
      case 'JOB_HIRED':
        return 'bg-green-500';
      case 'ACCOUNT_REJECTED':
      case 'RECORD_REJECTED':
      case 'JOB_APPLICATION_REJECTED':
        return 'bg-red-500';
      case 'JOB_APPLICATION_RECEIVED':
      case 'NEW_USER_REGISTERED':
      case 'NEW_COMPANY_REGISTERED':
      case 'NEW_INSTITUTION_REGISTERED':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // Add this function to handle opening the all notifications dialog
  const handleViewAllNotifications = async () => {
    setShowAllNotifications(true);
    await fetchAllNotifications();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 lg:hidden z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 bg-primary transition-all duration-300 ease-in-out shadow-lg",
          isSidebarOpen ? "w-64" : "w-20",
          "lg:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ borderRadius: '0 20px 20px 0' }}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "flex h-20 items-center px-4 border-b border-primary/20 pt-4",
          isSidebarOpen ? "justify-between" : "justify-center"
        )}>
          {isSidebarOpen ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-foreground rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-primary-foreground">Hiigsi Forum</h1>
            </div>
          ) : (
            <div className="w-12 h-12 bg-primary-foreground rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
          )}
          
          <button
            onClick={() => {
              if (windowWidth >= 1024) {
                setIsSidebarOpen(!isSidebarOpen);
              } else {
                setIsMobileMenuOpen(false);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors hidden lg:flex text-primary-foreground hover:text-primary-foreground"
          >
            {isSidebarOpen ? 
              <ChevronLeft className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </button>
        </div>

        {/* Upload Button
        {isSidebarOpen && (
          <div className="p-4">
            <Button className="w-full bg-primary-foreground hover:bg-primary-foreground/90 text-primary border border-primary rounded-lg shadow-sm font-medium transition-all duration-200 hover:shadow-md">
              <Upload className="h-4 w-4 mr-2" />
              Upload New Files
            </Button>
          </div>
        )} */}

        <div className="py-4 flex flex-col h-[calc(100%-4rem)] justify-between">
          <TooltipProvider delayDuration={isSidebarOpen ? 700 : 0}>
            <nav className="px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.subItems && item.subItems.some(subItem => location.pathname === subItem.href));
                
                return (
                  <div key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group hover:bg-primary/20 hover:text-primary-foreground",
                            isActive
                              ? "bg-primary/20 text-primary-foreground"
                              : "text-primary-foreground hover:text-primary-foreground"
                          )}
                        >
                          <item.icon className={cn(
                            "flex-shrink-0 transition-colors",
                            isSidebarOpen ? "h-5 w-5" : "h-6 w-6",
                            isActive ? "text-primary-foreground" : "text-primary-foreground group-hover:text-primary-foreground"
                          )} />
                          {isSidebarOpen && (
                            <span className="truncate">{item.title}</span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {!isSidebarOpen && (
                        <TooltipContent side="right" className="max-w-xs bg-card text-card-foreground border border-border shadow-lg">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            {item.description && (
                              <p className="text-xs text-gray-600">{item.description}</p>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    
                    {/* Render sub-items if they exist */}
                    {item.subItems && isSidebarOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.href;
                          return (
                            <Tooltip key={subItem.href}>
                              <TooltipTrigger asChild>
                                <Link
                                  to={subItem.href}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group hover:bg-primary/20 hover:text-primary-foreground",
                                    isSubActive
                                      ? "bg-primary/20 text-primary-foreground"
                                      : "text-primary-foreground hover:text-primary-foreground"
                                  )}
                                >
                                  <subItem.icon className="h-4 w-4 flex-shrink-0 transition-colors" />
                                  <span className="truncate">{subItem.title}</span>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs bg-card text-card-foreground border border-border shadow-lg">
                                <div>
                                  <p className="font-medium">{subItem.title}</p>
                                  {subItem.description && (
                                    <p className="text-xs text-gray-600">{subItem.description}</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </TooltipProvider>

          
          <div className="px-3">
            {isSidebarOpen && (
              <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-sm truncate text-primary-foreground">{user?.name}</p>
                  <p className="text-xs text-primary-foreground/80">{shortenWallet(user?.wallet)}</p>
                  <p className="text-xs text-primary-foreground/80 mt-1 uppercase font-medium">
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
                      "w-full flex items-center gap-3 justify-start text-primary-foreground hover:bg-primary/20 hover:text-primary-foreground",
                      !isSidebarOpen && "justify-center px-0"
                    )}
                    onClick={() => logout()}
                  >
                    <LogOut className="h-5 w-5" />
                    {isSidebarOpen && <span>Logout</span>}
                  </Button>
                </TooltipTrigger>
                {!isSidebarOpen && (
                  <TooltipContent side="right" className="bg-card text-card-foreground border border-border shadow-lg">
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
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-card border-b border-border px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden hover:bg-muted text-foreground" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold text-card-foreground">Hiigsi Forum</h1>
            </div> */}
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl ml-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search in Hiigsi Forum"
                  className="pl-10 pr-4 py-2 w-full bg-muted border-0 rounded-lg focus:bg-background focus:ring-2 focus:ring-primary transition-all duration-200"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* View Toggle */}
            <div className="hidden md:flex items-center bg-muted rounded-lg p-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-background text-foreground">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-background text-foreground">
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Notification Button */}
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted text-foreground">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border border-border shadow-lg">
                <div className="flex items-center justify-between px-4 py-2">
                  <DropdownMenuLabel className="text-card-foreground">Notifications</DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-primary hover:bg-primary/10"
                      onClick={() => markAllAsRead()}
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Mark all read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteAllNotifications()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <>
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification._id}
                          className={cn(
                            "flex flex-col items-start p-3 cursor-pointer hover:bg-muted/50",
                            !notification.isRead && "bg-primary/5"
                          )}
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsRead(notification._id);
                            }
                            if (notification.data?.recordId) {
                              navigate(`/student/records/${notification.data.recordId}`);
                            } else if (notification.data?.applicationId) {
                              navigate(`/company/jobs/applications/${notification.data.applicationId}`);
                            }
                          }}
                        >
                          <div className="flex items-start gap-2 w-full">
                            <div className={cn(
                              "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                              getNotificationColor(notification.type)
                            )} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium truncate text-card-foreground">
                                  {notification.title}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0 hover:bg-muted"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification._id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {notifications.length > 0 && (
                        <DropdownMenuItem
                          className="flex items-center justify-center p-2 text-sm text-primary hover:bg-primary/10"
                          onClick={handleViewAllNotifications}
                        >
                          View all notifications
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted text-foreground">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border border-border shadow-lg">
                <DropdownMenuLabel className="text-card-foreground">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings/terms")} className="hover:bg-muted/50">
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Terms and Conditions</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 md:pl-3 md:pr-2 hover:bg-muted text-foreground">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none mb-1 text-card-foreground">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground leading-none">{shortenWallet(user?.wallet)}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border border-border shadow-lg">
                <DropdownMenuLabel className="text-card-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center hover:bg-muted/50">
                  <User className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-card-foreground">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">{shortenWallet(user?.wallet)}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings/terms")} className="hover:bg-muted/50">
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Terms and Conditions</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive hover:bg-destructive/10 focus:text-destructive"
                  onClick={() => setShowLogoutAlert(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
              <AlertDialogContent className="max-w-sm bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-card-foreground">Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Your session will end and you will be redirected to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="hover:bg-muted">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>
        
        <main className="p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>

      {/* All Notifications Dialog */}
      <Dialog open={showAllNotifications} onOpenChange={setShowAllNotifications}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-card-foreground">
              <span>All Notifications</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-primary hover:bg-primary/10"
                  onClick={() => markAllAsRead()}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    deleteAllNotifications();
                    setShowAllNotifications(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {loadingAll ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading all notifications...
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="space-y-2">
                {allNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-lg cursor-pointer hover:bg-muted/50 border border-border",
                      !notification.isRead && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification._id);
                      }
                      if (notification.data?.recordId) {
                        navigate(`/student/records/${notification.data.recordId}`);
                        setShowAllNotifications(false);
                      } else if (notification.data?.applicationId) {
                        navigate(`/company/jobs/applications/${notification.data.applicationId}`);
                        setShowAllNotifications(false);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <div className={cn(
                        "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                        getNotificationColor(notification.type)
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate text-card-foreground">
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};