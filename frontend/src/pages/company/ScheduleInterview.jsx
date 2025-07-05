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
  Plus,
  Edit,
  Trash2,
  FileText
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

export const ScheduleInterview = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState([]);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Interview form state
  const [interviewData, setInterviewData] = useState({
    interviewStage: "phone_screen",
    interviewDate: "",
    interviewerName: "",
    feedback: "",
    notes: ""
  });
  
  // Fetch applications that can be interviewed
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/applications/company-applications");
      
      if (response.data.success) {
        // Filter applications that are in interviewing or interviewed status
        const interviewableApplications = response.data.data.filter(
          app => app.status === "interviewing" || app.status === "interviewed"
        );
        setApplications(interviewableApplications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchApplications();
  }, []);
  
  // Handle interview creation
  const handleCreateInterview = async (e) => {
    e.preventDefault();
    
    if (!selectedApplication) return;
    
    // Validation
    if (!interviewData.interviewDate || !interviewData.interviewerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await api.post("/interviews", {
        applicationId: selectedApplication._id,
        ...interviewData
      });
      
      if (response.data.success) {
        toast({
          title: "Interview Scheduled",
          description: "Interview has been scheduled successfully",
        });
        
        setShowInterviewDialog(false);
        setSelectedApplication(null);
        setInterviewData({
          interviewStage: "phone_screen",
          interviewDate: "",
          interviewerName: "",
          feedback: "",
          notes: ""
        });
        
        // Refresh applications
        fetchApplications();
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast({
        title: "Scheduling Failed",
        description: error.response?.data?.message || "Failed to schedule interview",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Open interview dialog
  const handleScheduleInterview = (application) => {
    setSelectedApplication(application);
    setInterviewData({
      interviewStage: "phone_screen",
      interviewDate: "",
      interviewerName: "",
      feedback: "",
      notes: ""
    });
    setShowInterviewDialog(true);
  };
  
  // Filter applications based on search query
  const filteredApplications = applications.filter(application => 
    application.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    application.jobId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get application status badge
  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case 'interviewing':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Interviewing
          </Badge>
        );
      case 'interviewed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Interviewed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
          <h1 className="text-3xl font-bold tracking-tight">Schedule Interviews</h1>
          <p className="text-muted-foreground">
            Schedule interviews for job applications
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
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
      ) : filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No matching applications found" : "No applications available for interview scheduling"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApplications.map((application) => (
            <Card key={application._id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>
                      {application.studentId?.name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Briefcase className="h-3.5 w-3.5 mr-1" />
                      {application.jobId?.title || "Unknown Job"}
                    </CardDescription>
                  </div>
                  {getApplicationStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Applied: {formatDate(application.createdAt)}
                  </div>
                  
                  <div className="text-sm mt-2">
                    <p className="font-medium">Cover Letter:</p>
                    <p className="text-muted-foreground mt-1">
                      {application.coverLetter?.length > 150 
                        ? `${application.coverLetter.substring(0, 150)}...` 
                        : application.coverLetter}
                    </p>
                  </div>
                  
                  <div className="text-sm mt-2">
                    <p className="font-medium">Academic Records: {application.academicRecords?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/company/jobs/${application.jobId?._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Job
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleScheduleInterview(application)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Interview Scheduling Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview for {selectedApplication?.studentId?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInterview}>
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
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the interview"
                  rows={3}
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
                    Scheduling...
                  </>
                ) : (
                  "Schedule Interview"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 