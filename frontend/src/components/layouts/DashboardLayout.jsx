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
  CheckCircle2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  History,
  UserCircle,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";

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
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
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
        },
        {
          title: "Notifications",
          icon: Bell,
          href: `${basePath}/notifications`,
          description: "View and manage your notifications",
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
        },
        {
          title: "Notifications",
          icon: Bell,
          href: `${basePath}/notifications`,
          description: "View and manage your notifications",
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

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (changingPassword) return;

    // Validate passwords
    const { currentPassword, newPassword, confirmPassword } = changePasswordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "All password fields are required",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast({
        title: "Invalid password",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      await api.post("/users/change-password", {
        currentPassword,
        newPassword,
      });

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setShowChangePasswordModal(false);
      setChangePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
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
                const isActive = location.pathname === item.href || 
                  (item.subItems && item.subItems.some(subItem => location.pathname === subItem.href));
                
                return (
                  <div key={item.href}>
                    <Tooltip>
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
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative group",
                                    isSubActive
                                      ? "bg-primary/20 text-primary"
                                      : "text-muted-foreground hover:bg-muted/50"
                                  )}
                                >
                                  <subItem.icon className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{subItem.title}</span>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <div>
                                  <p className="font-medium">{subItem.title}</p>
                                  {subItem.description && (
                                    <p className="text-xs text-muted-foreground">{subItem.description}</p>
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
          
          <div className="flex items-center gap-2">
            {/* Notification Button */}
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => markAllAsRead()}
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Mark all read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-destructive hover:text-destructive"
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
                            "flex flex-col items-start p-3 cursor-pointer",
                            !notification.isRead && "bg-muted/50"
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
                                <p className="text-sm font-medium truncate">
                                  {notification.title}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0"
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
                          className="flex items-center justify-center p-2 text-sm text-muted-foreground hover:text-foreground"
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
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
              
               
                <DropdownMenuItem onClick={() => navigate("/settings/terms")}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Terms and Conditions</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Change Password Button - Only show for non-admin users */}
            {user?.userType !== "Admin" && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowChangePasswordModal(true)}
                title="Change Password"
              >
                <KeyRound className="h-5 w-5" />
              </Button>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 md:pl-3 md:pr-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none mb-1">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground leading-none">{shortenWallet(user?.wallet)}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-muted-foreground">{shortenWallet(user?.wallet)}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings/terms")}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Terms and Conditions</span>
                </DropdownMenuItem>
               
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowLogoutAlert(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
              <AlertDialogContent className="max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your session will end and you will be redirected to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
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
        
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* All Notifications Dialog */}
      <Dialog open={showAllNotifications} onOpenChange={setShowAllNotifications}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>All Notifications</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => markAllAsRead()}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-destructive hover:text-destructive"
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
                      "flex flex-col items-start p-3 rounded-lg cursor-pointer hover:bg-muted/50",
                      !notification.isRead && "bg-muted/50"
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
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
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

      {/* Change Password Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={changePasswordData.currentPassword}
                  onChange={(e) => setChangePasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={changePasswordData.newPassword}
                  onChange={(e) => setChangePasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={changePasswordData.confirmPassword}
                  onChange={(e) => setChangePasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChangePasswordModal(false)}
                disabled={changingPassword}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};