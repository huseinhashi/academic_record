import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  ArrowLeft,
  Search,
  Briefcase,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  MapPin,
  DollarSign,
  Award,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

export const JobDetails = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showApplicationDetailsDialog, setShowApplicationDetailsDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [processingApplication, setProcessingApplication] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [interviews, setInterviews] = useState({});
  const [loadingInterviews, setLoadingInterviews] = useState({});
  
  // Add verification check
  const isVerified = user?.isVerifiedByAdmin;
  
  // Fetch job details
  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/jobs/${jobId}`);
      
      if (response.data.success) {
        setJob(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
      navigate("/company/jobs");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch job applications
  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await api.get(`/jobs/${jobId}/applications`);
      
      if (response.data.success) {
        setApplications(response.data.data);
        
        // Fetch interviews for each application
        const applicationIds = response.data.data.map(app => app._id);
        await Promise.all(applicationIds.map(fetchInterviewsForApplication));
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load job applications",
        variant: "destructive",
      });
    } finally {
      setLoadingApplications(false);
    }
  };
  
  // Fetch interviews for a specific application
  const fetchInterviewsForApplication = async (applicationId) => {
    setLoadingInterviews(prev => ({ ...prev, [applicationId]: true }));
    try {
      const response = await api.get(`/interviews/application/${applicationId}`);
      
      if (response.data.success) {
        setInterviews(prev => ({
          ...prev,
          [applicationId]: response.data.data
        }));
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoadingInterviews(prev => ({ ...prev, [applicationId]: false }));
    }
  };
  
  useEffect(() => {
    if (jobId) {
      fetchJob();
      fetchApplications();
    }
  }, [jobId]);
  
  // Handle application processing
  const handleProcessApplication = async (status) => {
    if (!selectedApplication) return;
    
    setProcessingApplication(true);
    
    try {
      await api.put(`/applications/${selectedApplication._id}/status`, { status });
      
      toast({
        title: "Application Processed",
        description: `The application has been ${status === "accepted" ? "accepted" : "rejected"}`,
      });
      
      setShowApplicationDetailsDialog(false);
      setSelectedApplication(null);
      
      // Refresh applications
      fetchApplications();
    } catch (error) {
      console.error("Error processing application:", error);
      toast({
        title: "Processing Failed",
        description: error.response?.data?.message || "Failed to process application",
        variant: "destructive",
      });
    } finally {
      setProcessingApplication(false);
    }
  };
  
  // Handle job deletion
  const handleDeleteJob = async () => {
    try {
      await api.delete(`/jobs/${jobId}`);
      
      toast({
        title: "Job Deleted",
        description: "The job has been deleted successfully",
      });
      
      navigate("/company/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  };
  
  // Handle job status toggle
  const handleToggleJobStatus = async () => {
    const newStatus = job.status === "open" ? "closed" : "open";
    
    try {
      await api.put(`/jobs/${jobId}/status`, { status: newStatus });
      
      toast({
        title: "Status Updated",
        description: `Job is now ${newStatus}`,
      });
      
      // Refresh job
      fetchJob();
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update job status",
        variant: "destructive",
      });
    }
  };
  
  // Open application details
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetailsDialog(true);
  };
  
  // Filter applications based on search query
  const filteredApplications = applications.filter(application => 
    application.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    application.studentId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    application.coverLetter?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get application status badge
  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case 'hired':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Hired
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
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
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
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
  
  // Handle view document
  const handleViewDocument = (document) => {
    if (!document?.signedUrl) {
      toast({
        title: "Error",
        description: "Document is not available for viewing",
        variant: "destructive"
      });
      return;
    }
    
    window.open(document.signedUrl, '_blank');
  };

  // Interview management functions
  const handleCreateInterview = async (applicationId, interviewData) => {
    try {
      const response = await api.post('/interviews', {
        applicationId,
        ...interviewData
      });
      
      if (response.data.success) {
        toast({
          title: "Interview Created",
          description: "Interview has been scheduled successfully",
        });
        
        // Refresh interviews for this application
        await fetchInterviewsForApplication(applicationId);
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast({
        title: "Interview Creation Failed",
        description: error.response?.data?.message || "Failed to create interview",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInterview = async (interviewId, interviewData) => {
    try {
      const response = await api.put(`/interviews/${interviewId}`, interviewData);
      
      if (response.data.success) {
        toast({
          title: "Interview Updated",
          description: "Interview has been updated successfully",
        });
        
        // Refresh interviews for this application
        await fetchInterviewsForApplication(selectedInterview.applicationId);
      }
    } catch (error) {
      console.error("Error updating interview:", error);
      toast({
        title: "Interview Update Failed",
        description: error.response?.data?.message || "Failed to update interview",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    try {
      await api.delete(`/interviews/${interviewId}`);
      
      toast({
        title: "Interview Deleted",
        description: "Interview has been deleted successfully",
      });
      
      // Refresh interviews for this application
      await fetchInterviewsForApplication(selectedInterview.applicationId);
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast({
        title: "Interview Deletion Failed",
        description: error.response?.data?.message || "Failed to delete interview",
        variant: "destructive",
      });
    }
  };

  const handleHireApplicant = async (applicationId) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status: 'hired' });
      
      toast({
        title: "Applicant Hired",
        description: "The applicant has been hired successfully",
      });
      
      // Refresh applications
      fetchApplications();
    } catch (error) {
      console.error("Error hiring applicant:", error);
      toast({
        title: "Hiring Failed",
        description: error.response?.data?.message || "Failed to hire applicant",
        variant: "destructive",
      });
    }
  };

  // Check if applicant can be hired (has passed interviews)
  const canHireApplicant = (applicationId) => {
    const applicationInterviews = interviews[applicationId] || [];
    return applicationInterviews.some(interview => interview.result === 'pass');
  };

  // Get interview status for an application
  const getInterviewStatus = (applicationId) => {
    const applicationInterviews = interviews[applicationId] || [];
    if (applicationInterviews.length === 0) return 'no_interviews';
    if (applicationInterviews.some(interview => interview.result === 'pass')) return 'passed';
    if (applicationInterviews.some(interview => interview.result === 'fail')) return 'failed';
    return 'pending';
  };

  // Open interview dialog
  const handleOpenInterviewDialog = (application, interview = null) => {
    if (interview) {
      // Edit existing interview
      setSelectedInterview({
        _id: interview._id,
        applicationId: application._id,
        interviewStage: interview.interviewStage,
        interviewDate: interview.interviewDate ? new Date(interview.interviewDate).toISOString().slice(0, 16) : '',
        interviewerName: interview.interviewerName,
        feedback: interview.feedback,
        result: interview.result,
        notes: interview.notes
      });
    } else {
      // Create new interview
      setSelectedInterview({
        applicationId: application._id,
        interviewStage: 'phone_screen',
        interviewDate: '',
        interviewerName: '',
        feedback: '',
        result: 'pending',
        notes: ''
      });
    }
    setShowInterviewDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Job not found</p>
        <Button onClick={() => navigate("/company/jobs")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/company/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-muted-foreground">
              Job Details and Applications
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleJobStatus}
          >
            {job.status === "open" ? "Close Job" : "Reopen Job"}
          </Button>
          {/* <Button
            variant="outline"
            onClick={() => navigate(`/company/jobs/edit/${jobId}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button> */}
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Job
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>
        
        {/* Job Details Tab */}
        <TabsContent value="details" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{job.title}</CardTitle>
                <Badge variant={job.status === "open" ? "outline" : "secondary"}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>
                Posted on {formatDate(job.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{job.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Required: {job.certificateRequirements?.join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{applications.length} applications</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Required Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {job.requirements?.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {job.documents && job.documents.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Job Documents</Label>
                  <div className="space-y-2">
                    {job.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{doc.documentName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4 pt-4">
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
          
          {loadingApplications ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No matching applications found" : "No applications received yet"}
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
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          Applied: {formatDate(application.createdAt)}
                        </CardDescription>
                      </div>
                      {getApplicationStatusBadge(application.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium">Cover Letter:</p>
                        <p className="text-muted-foreground mt-1">
                          {application.coverLetter?.length > 150 
                            ? `${application.coverLetter.substring(0, 150)}...` 
                            : application.coverLetter}
                        </p>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium">Academic Records: {application.academicRecords?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex flex-col gap-2 w-full">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleViewApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Application
                      </Button>
                      
                      {/* Interview Status and Actions */}
                      <div className="flex gap-2">
                        {application.status === "pending" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                              onClick={() => handleProcessApplication("rejected")}
                              disabled={processingApplication}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button 
                              size="sm"
                              className="flex-1"
                              onClick={() => handleProcessApplication("interviewing")}
                              disabled={processingApplication}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Start Interview
                            </Button>
                          </>
                        )}
                        
                        {application.status === "interviewing" && (
                          <Button 
                            size="sm"
                            className="flex-1"
                            onClick={() => handleProcessApplication("interviewed")}
                            disabled={processingApplication}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete Interview
                          </Button>
                        )}
                        
                        {canHireApplicant(application._id) && application.status !== "hired" && (
                          <Button 
                            size="sm"
                            className="flex-1"
                            onClick={() => handleHireApplicant(application._id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Hire
                          </Button>
                        )}
                      </div>
                      
                      {/* Interview Status Display */}
                      {interviews[application._id] && interviews[application._id].length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Interviews: {interviews[application._id].length} 
                          ({interviews[application._id].filter(i => i.result === 'pass').length} passed)
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p className="font-medium">{job.title}</p>
              <p className="text-sm text-muted-foreground">{job.location}</p>
            </div>
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
              onClick={handleDeleteJob}
            >
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Application Details Dialog */}
      <Dialog open={showApplicationDetailsDialog} onOpenChange={setShowApplicationDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the applicant's information and academic records
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {selectedApplication.studentId?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.studentId?.email}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Cover Letter</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  {selectedApplication.coverLetter}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Academic Records</h4>
                {selectedApplication.academicRecords?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApplication.academicRecords.map((record) => (
                      <div key={record._id} className="bg-muted p-3 rounded-md">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-sm">{record.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.recordType} - {record.institutionId?.name}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Verified
                          </Badge>
                        </div>
                        
                        <Button 
                          variant="link" 
                          className="p-0 h-auto mt-1"
                          onClick={() => {
                            if (record.signedUrl) {
                              window.open(record.signedUrl, '_blank');
                            } else if (record.fileUrl) {
                              window.open(record.fileUrl, '_blank');
                            } else if (record.documentUrl) {
                              window.open(record.documentUrl, '_blank');
                            } else {
                              toast({
                                title: "Error",
                                description: "Document is not available for viewing",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          View Document
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No academic records provided</p>
                )}
              </div>
              
              {/* Interview Management Section */}
              <div className="space-y-2">
                <h4 className="font-medium">Interview Management</h4>
                <div className="space-y-3">
                  {/* Interview List */}
                  {interviews[selectedApplication._id] && interviews[selectedApplication._id].length > 0 ? (
                    <div className="space-y-2">
                      {interviews[selectedApplication._id].map((interview) => (
                        <div key={interview._id} className="bg-muted p-3 rounded-md">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm capitalize">
                                {interview.interviewStage.replace('_', ' ')} - {interview.interviewerName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(interview.interviewDate)}
                              </p>
                              {interview.feedback && (
                                <p className="text-xs mt-1">{interview.feedback}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={
                                  interview.result === 'pass' ? 'bg-green-50 text-green-700 border-green-200' :
                                  interview.result === 'fail' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }
                              >
                                {interview.result}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenInterviewDialog(selectedApplication, interview)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No interviews scheduled yet</p>
                  )}
                  
                  {/* Add Interview Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenInterviewDialog(selectedApplication)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                </div>
              </div>
              
              {selectedApplication.status === "pending" && (
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={processingApplication}
                    onClick={() => handleProcessApplication("rejected")}
                  >
                    {processingApplication ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button 
                    className="w-full"
                    disabled={processingApplication}
                    onClick={() => handleProcessApplication("interviewing")}
                  >
                    {processingApplication ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Start Interview Process
                  </Button>
                </div>
              )}
              
              {selectedApplication.status === "interviewing" && (
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={processingApplication}
                    onClick={() => handleProcessApplication("rejected")}
                  >
                    {processingApplication ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button 
                    className="w-full"
                    disabled={processingApplication}
                    onClick={() => handleProcessApplication("interviewed")}
                  >
                    {processingApplication ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Complete Interview Process
                  </Button>
                </div>
              )}
              
              {canHireApplicant(selectedApplication._id) && selectedApplication.status !== "hired" && (
                <div className="pt-4">
                  <Button 
                    className="w-full"
                    onClick={() => handleHireApplicant(selectedApplication._id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Hire Applicant
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Interview Management Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Interviews</DialogTitle>
            <DialogDescription>
              Schedule and manage interviews for this applicant
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="interviewStage">Interview Stage</Label>
                <Select
                  value={selectedInterview.interviewStage}
                  onValueChange={(value) => setSelectedInterview(prev => ({ ...prev, interviewStage: value }))}
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
                <Label htmlFor="interviewDate">Interview Date</Label>
                <Input
                  type="datetime-local"
                  value={selectedInterview.interviewDate}
                  onChange={(e) => setSelectedInterview(prev => ({ ...prev, interviewDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interviewerName">Interviewer Name</Label>
                <Input
                  value={selectedInterview.interviewerName}
                  onChange={(e) => setSelectedInterview(prev => ({ ...prev, interviewerName: e.target.value }))}
                  placeholder="Enter interviewer name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  value={selectedInterview.feedback}
                  onChange={(e) => setSelectedInterview(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Enter interview feedback"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="result">Interview Result</Label>
                <Select
                  value={selectedInterview.result}
                  onValueChange={(value) => setSelectedInterview(prev => ({ ...prev, result: value }))}
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
                  value={selectedInterview.notes}
                  onChange={(e) => setSelectedInterview(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowInterviewDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => {
                    if (selectedInterview._id) {
                      handleUpdateInterview(selectedInterview._id, selectedInterview);
                    } else {
                      handleCreateInterview(selectedInterview.applicationId, selectedInterview);
                    }
                    setShowInterviewDialog(false);
                  }}
                >
                  {selectedInterview._id ? "Update Interview" : "Create Interview"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 