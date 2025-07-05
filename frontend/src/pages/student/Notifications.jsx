import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Bell, Trash2, CheckCheck, AlertCircle, FileText, Briefcase, User, Building2, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const StudentNotifications = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const {
    allNotifications,
    unreadCount,
    loading: notificationsLoading,
    loadingAll,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchAllNotifications,
  } = useNotifications();

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      await fetchAllNotifications();
      setLoading(false);
    };
    loadNotifications();
  }, [fetchAllNotifications]);

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
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

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
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'ACCOUNT_APPROVED':
        return 'Account Approved';
      case 'ACCOUNT_REJECTED':
        return 'Account Rejected';
      case 'RECORD_VERIFIED':
        return 'Record Verified';
      case 'RECORD_REJECTED':
        return 'Record Rejected';
      case 'JOB_APPLICATION_RECEIVED':
        return 'Job Application';
      case 'JOB_APPLICATION_APPROVED':
        return 'Application Approved';
      case 'JOB_APPLICATION_REJECTED':
        return 'Application Rejected';
      case 'JOB_HIRED':
        return 'Job Offer';
      default:
        return type;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Navigate based on notification data
    if (notification.data?.recordId) {
      navigate(`/student/records/${notification.data.recordId}`);
    } else if (notification.data?.applicationId) {
      navigate(`/student/jobs/applications/${notification.data.applicationId}`);
    }
  };

  const handleDeleteNotification = async () => {
    if (!deleteTarget) return;
    
    try {
      await deleteNotification(deleteTarget._id);
      toast({
        title: "Notification Deleted",
        description: "The notification has been deleted successfully",
      });
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      toast({
        title: "All Notifications Deleted",
        description: "All notifications have been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete all notifications",
        variant: "destructive",
      });
    }
  };

  const filteredNotifications = allNotifications.filter(notification => {
    // Filter by read status
    if (filter === "unread" && notification.isRead) return false;
    if (filter === "read" && !notification.isRead) return false;
    
    // Filter by type
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications ({unreadCount} unread)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteAll}
            disabled={allNotifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            View and manage your notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="read">Read Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ACCOUNT_APPROVED">Account Approved</SelectItem>
                <SelectItem value="ACCOUNT_REJECTED">Account Rejected</SelectItem>
                <SelectItem value="RECORD_VERIFIED">Record Verified</SelectItem>
                <SelectItem value="RECORD_REJECTED">Record Rejected</SelectItem>
                <SelectItem value="JOB_APPLICATION_RECEIVED">Job Applications</SelectItem>
                <SelectItem value="JOB_APPLICATION_APPROVED">Application Approved</SelectItem>
                <SelectItem value="JOB_APPLICATION_REJECTED">Application Rejected</SelectItem>
                <SelectItem value="JOB_HIRED">Job Offers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {notificationsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Bell className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No notifications found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => (
                    <TableRow 
                      key={notification._id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        !notification.isRead && "bg-muted/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            getNotificationColor(notification.type)
                          )} />
                          <span className="text-sm font-medium">
                            {getNotificationTypeLabel(notification.type)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{notification.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {notification.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.isRead ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Read
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unread
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(notification);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotification}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 