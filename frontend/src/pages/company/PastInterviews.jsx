import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar,
  Clock,
  User,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

export const PastInterviews = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [interviewToView, setInterviewToView] = useState(null);
  
  // Interview form state
  const [interviewData, setInterviewData] = useState({
    interviewStage: "",
    interviewDate: "",
    interviewerName: "",
    feedback: "",
    result: "",
    notes: ""
  });
  
  // Fetch past interviews
  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const response = await api.get("/interviews/company");
      
      if (response.data.success) {
        // Filter for past interviews (completed or past date)
        const pastInterviews = response.data.data.filter(
          interview => interview.result !== "pending" || new Date(interview.interviewDate) < new Date()
        );
        setInterviews(pastInterviews);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast({
        title: "Error",
        description: "Failed to load interviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInterviews();
  }, []);
  
  // Handle interview update
  const handleUpdateInterview = async (e) => {
    e.preventDefault();
    
    if (!selectedInterview) return;
    
    // Prevent editing passed interviews
    if (selectedInterview.result === "pass") {
      toast({
        title: "Cannot Edit",
        description: "Cannot edit interviews that have passed",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await api.put(`/interviews/${selectedInterview._id}`, interviewData);
      
      if (response.data.success) {
        toast({
          title: "Interview Updated",
          description: "Interview has been updated successfully",
        });
        
        setShowInterviewDialog(false);
        setSelectedInterview(null);
        
        // Refresh interviews
        fetchInterviews();
      }
    } catch (error) {
      console.error("Error updating interview:", error);
      
      // Handle specific validation errors
      let errorMessage = error.response?.data?.message || "Failed to update interview";
      
      if (error.response?.status === 400) {
        if (errorMessage.includes("Cannot complete interview")) {
          errorMessage = "Please ensure the interview is properly scheduled with date and interviewer, and the interview date has passed before marking as pass/fail.";
        }
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle interview deletion
  const handleDeleteInterview = async () => {
    if (!interviewToDelete) return;
    
    // Prevent deleting passed interviews
    if (interviewToDelete.result === "pass") {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete interviews that have passed",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
      return;
    }
    
    setDeleting(true);
    
    try {
      await api.delete(`/interviews/${interviewToDelete._id}`);
      
      toast({
        title: "Interview Deleted",
        description: "Interview has been deleted successfully",
      });
      
      setShowDeleteDialog(false);
      setInterviewToDelete(null);
      
      // Refresh interviews
      fetchInterviews();
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.message || "Failed to delete interview",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };
  
  // Open interview dialog for editing
  const handleEditInterview = (interview) => {
    // Prevent editing passed interviews
    if (interview.result === "pass") {
      toast({
        title: "Cannot Edit",
        description: "Cannot edit interviews that have passed",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedInterview(interview);
    setInterviewData({
      interviewStage: interview.interviewStage,
      interviewDate: interview.interviewDate ? new Date(interview.interviewDate).toISOString().slice(0, 16) : "",
      interviewerName: interview.interviewerName,
      feedback: interview.feedback,
      result: interview.result,
      notes: interview.notes
    });
    setShowInterviewDialog(true);
  };
  
  // Open interview dialog for viewing
  const handleViewInterview = (interview) => {
    setInterviewToView(interview);
    setShowViewDialog(true);
  };
  
  // Filter interviews based on search query
  const filteredInterviews = interviews.filter(interview => 
    interview.applicationId?.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.applicationId?.jobId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.interviewerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get interview stage badge
  const getInterviewStageBadge = (stage) => {
    const stageLabels = {
      'phone_screen': 'Phone Screen',
      'technical': 'Technical',
      'onsite': 'Onsite',
      'final': 'Final'
    };
    
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {stageLabels[stage] || stage}
      </Badge>
    );
  };
  
  // Get interview result badge
  const getInterviewResultBadge = (result) => {
    switch (result) {
      case 'pass':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Passed
          </Badge>
        );
      case 'fail':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Past Interviews</h1>
          <p className="text-muted-foreground">
            View completed and past interviews
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interviews..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No matching interviews found" : "No past interviews found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInterviews.map((interview) => (
            <Card key={interview._id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>
                      {interview.applicationId?.studentId?.name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Briefcase className="h-3.5 w-3.5 mr-1" />
                      {interview.applicationId?.jobId?.title || "Unknown Job"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getInterviewStageBadge(interview.interviewStage)}
                    {getInterviewResultBadge(interview.result)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Scheduled: {formatDate(interview.interviewDate)}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    Interviewer: {interview.interviewerName}
                  </div>
                  
                  {interview.feedback && (
                    <div className="text-sm">
                      <p className="font-medium">Feedback:</p>
                      <p className="text-muted-foreground mt-1">
                        {interview.feedback.length > 100 
                          ? `${interview.feedback.substring(0, 100)}...` 
                          : interview.feedback}
                      </p>
                    </div>
                  )}
                  
                  {interview.notes && (
                    <div className="text-sm">
                      <p className="font-medium">Notes:</p>
                      <p className="text-muted-foreground mt-1">
                        {interview.notes.length > 100 
                          ? `${interview.notes.substring(0, 100)}...` 
                          : interview.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewInterview(interview)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/company/jobs/${interview.applicationId?.jobId?._id}`)}
                  >
                    <Briefcase className="h-4 w-4 mr-1" />
                    View Job
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditInterview(interview)}
                    disabled={interview.result === "pass"}
                    title={interview.result === "pass" ? "Cannot edit passed interviews" : ""}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setInterviewToDelete(interview);
                      setShowDeleteDialog(true);
                    }}
                    disabled={interview.result === "pass"}
                    title={interview.result === "pass" ? "Cannot delete passed interviews" : ""}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Interview Edit Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
            <DialogDescription>
              Update interview details for {selectedInterview?.applicationId?.studentId?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateInterview}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="interviewStage">Interview Stage</Label>
                <Select
                  value={interviewData.interviewStage}
                  onValueChange={(value) => setInterviewData(prev => ({ ...prev, interviewStage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone_screen">Phone Screen</SelectItem>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="onsite">Onsite Interview</SelectItem>
                    <SelectItem value="final">Final Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interviewDate">Interview Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={interviewData.interviewDate}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, interviewDate: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interviewerName">Interviewer Name</Label>
                <Input
                  value={interviewData.interviewerName}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, interviewerName: e.target.value }))}
                  placeholder="Enter interviewer name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  value={interviewData.feedback}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Enter interview feedback"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="result">Interview Result</Label>
                <Select
                  value={interviewData.result}
                  onValueChange={(value) => setInterviewData(prev => ({ ...prev, result: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInterviewDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Interview"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Interview View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>
              Complete interview information for {interviewToView?.applicationId?.studentId?.name}
            </DialogDescription>
          </DialogHeader>
          {interviewToView && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {interviewToView.applicationId?.studentId?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {interviewToView.applicationId?.jobId?.title}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Interview Stage</Label>
                  <p className="text-sm">{interviewToView.interviewStage.replace('_', ' ')}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Result</Label>
                  <div>{getInterviewResultBadge(interviewToView.result)}</div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Interview Date</Label>
                  <p className="text-sm">{formatDate(interviewToView.interviewDate)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Interviewer</Label>
                  <p className="text-sm">{interviewToView.interviewerName}</p>
                </div>
              </div>
              
              {interviewToView.feedback && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Feedback</Label>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {interviewToView.feedback}
                  </div>
                </div>
              )}
              
              {interviewToView.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notes</Label>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {interviewToView.notes}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/company/jobs/${interviewToView.applicationId?.jobId?._id}`)}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  View Job
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowViewDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interview? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {interviewToDelete && (
              <div className="space-y-2">
                <p className="font-medium">
                  {interviewToDelete.applicationId?.studentId?.name} - {interviewToDelete.interviewStage}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(interviewToDelete.interviewDate)}
                </p>
                {interviewToDelete.result === "pass" && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    Cannot delete passed interviews
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteInterview}
              disabled={deleting || interviewToDelete?.result === "pass"}
            >
              {deleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Interview"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 