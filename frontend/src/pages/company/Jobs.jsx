import { useState, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Briefcase,
  Users,
  Clock,
  Calendar,
  Edit,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

export const CompanyJobs = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showApplicationDetailsDialog, setShowApplicationDetailsDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [currentAction, setCurrentAction] = useState("add"); // "add" or "edit"
  
  // Job form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    status: "open",
  });
  
  // Selected job for editing
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  
  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [processingApplication, setProcessingApplication] = useState(false);
  
  // Fetch company's jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/jobs/my-jobs");
      
      if (response.data.success) {
        setJobs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load job listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch job applications
  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await api.get("/applications/company-applications");
      
      if (response.data.success) {
        setApplications(response.data.data);
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
  
  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle job creation
  const handleSubmitJob = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.requirements.trim() || !formData.location.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      let response;
      
      if (currentAction === "add") {
        response = await api.post("/jobs", formData);
        toast({
          title: "Job Posted",
          description: "Your job listing has been published successfully",
        });
      } else {
        response = await api.put(`/jobs/${selectedJob._id}`, formData);
        toast({
          title: "Job Updated",
          description: "Your job listing has been updated successfully",
        });
      }
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        requirements: "",
        location: "",
        status: "open",
      });
      
      setShowJobDialog(false);
      setSelectedJob(null);
      
      // Refresh jobs
      fetchJobs();
    } catch (error) {
      console.error("Error submitting job:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit job listing",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle job deletion
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    setDeleting(true);
    
    try {
      await api.delete(`/jobs/${jobToDelete._id}`);
      
      toast({
        title: "Job Deleted",
        description: "Your job listing has been removed successfully",
      });
      
      setShowDeleteDialog(false);
      setJobToDelete(null);
      
      // Refresh jobs
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.message || "Failed to delete job listing",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };
  
  // Handle job status toggle
  const handleToggleJobStatus = async (job) => {
    const newStatus = job.status === "open" ? "closed" : "open";
    
    try {
      await api.put(`/jobs/${job._id}/status`, { status: newStatus });
      
      toast({
        title: "Status Updated",
        description: `Job listing is now ${newStatus}`,
      });
      
      // Refresh jobs
      fetchJobs();
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update job status",
        variant: "destructive",
      });
    }
  };
  
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
  
  // Edit a job
  const handleEditJob = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements || "",
      location: job.location || "",
      status: job.status || "open",
    });
    setCurrentAction("edit");
    setShowJobDialog(true);
  };
  
  // Open application details
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetailsDialog(true);
  };
  
  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
  
  // Filter applications for a specific job
  const getApplicationsForJob = (jobId) => {
    return applications.filter(app => app.jobId?._id === jobId);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Request sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  
  // Get application status badge
  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Accepted
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground">
            Create and manage job opportunities for students
          </p>
        </div>
        <Button onClick={() => {
          setCurrentAction("add");
          setFormData({
            title: "",
            description: "",
            requirements: "",
            location: "",
            status: "open",
          });
          setShowJobDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>
      
      <Tabs defaultValue="jobs">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs">Job Listings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        
        {/* Job Listings Tab */}
        <TabsContent value="jobs" className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search job listings..."
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
          ) : sortedJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No matching jobs found" : "You haven't posted any jobs yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th 
                        className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                        onClick={() => requestSort("title")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Title</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                      <th 
                        className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                        onClick={() => requestSort("createdAt")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Posted On</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Applications</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {sortedJobs.map((job) => {
                      const jobApplications = getApplicationsForJob(job._id);
                      return (
                        <tr key={job._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">{job.title}</td>
                          <td className="p-4 align-middle">
                            {job.description?.length > 75 
                              ? `${job.description.substring(0, 75)}...` 
                              : job.description}
                          </td>
                          <td className="p-4 align-middle">{job.location}</td>
                          <td className="p-4 align-middle">{formatDate(job.createdAt)}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {jobApplications.length}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge variant={job.status === "open" ? "outline" : "secondary"}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditJob(job)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setJobToDelete(job);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleToggleJobStatus(job)}
                              >
                                {job.status === "open" ? "Close" : "Reopen"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4 pt-4">
          {loadingApplications ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No applications received yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((application) => (
                <Card key={application._id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>
                          {application.studentId?.firstName} {application.studentId?.lastName}
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
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={application.status !== "pending"}
                      onClick={() => handleViewApplication(application)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Application
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Job Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentAction === "add" ? "Post a New Job" : "Edit Job Posting"}</DialogTitle>
            <DialogDescription>
              {currentAction === "add" 
                ? "Create a new job listing for students to apply to" 
                : "Update the details of your job listing"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitJob}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Software Engineer Intern"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the job role and responsibilities..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-32"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="List the job requirements..."
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="min-h-24"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    {currentAction === "add" ? "Posting..." : "Updating..."}
                  </>
                ) : (
                  currentAction === "add" ? "Post Job" : "Update Job"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {jobToDelete && (
              <div className="space-y-2">
                <p className="font-medium">{jobToDelete.title}</p>
                <p className="text-sm text-muted-foreground">{jobToDelete.location}</p>
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
              onClick={handleDeleteJob}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Job"
              )}
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
                  {selectedApplication.studentId?.firstName} {selectedApplication.studentId?.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.studentId?.email}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Job</h4>
                <p className="text-sm">
                  {selectedApplication.jobId?.title}
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
                    onClick={() => handleProcessApplication("accepted")}
                  >
                    {processingApplication ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Accept
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 