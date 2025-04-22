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
  Search, 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import api from "@/lib/axios";

export const StudentJobs = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [verifiedRecords, setVerifiedRecords] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applying, setApplying] = useState(false);
  
  // Application form state
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedRecords, setSelectedRecords] = useState([]);
  
  // Fetch all open jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/jobs");
      
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
  
  // Fetch student's applications
  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await api.get("/applications/my-applications");
      
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load your applications",
        variant: "destructive",
      });
    } finally {
      setLoadingApplications(false);
    }
  };
  
  // Fetch student's verified academic records
  const fetchVerifiedRecords = async () => {
    setLoadingRecords(true);
    try {
      const response = await api.get("/records/my-records");
      
      if (response.data.success) {
        // Filter only verified records
        const verified = response.data.data.filter(record => record.status === 'verified');
        setVerifiedRecords(verified);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast({
        title: "Error",
        description: "Failed to load your verified records",
        variant: "destructive",
      });
    } finally {
      setLoadingRecords(false);
    }
  };
  
  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchVerifiedRecords();
  }, []);
  
  // Handle job application
  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!selectedJob) {
      return;
    }
    
    if (!coverLetter.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a cover letter",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedRecords.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one academic record",
        variant: "destructive",
      });
      return;
    }
    
    setApplying(true);
    
    try {
      const response = await api.post(`/applications/job/${selectedJob._id}`, {
        coverLetter,
        academicRecordIds: selectedRecords
      });
      
      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully",
      });
      
      // Reset form
      setCoverLetter("");
      setSelectedRecords([]);
      setSelectedJob(null);
      setShowApplyDialog(false);
      
      // Refresh applications
      fetchApplications();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };
  
  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.companyId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Check if user already applied to a job
  const hasApplied = (jobId) => {
    return applications.some(app => app.jobId?._id === jobId);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
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

  // Add a function to view academic record documents
  const handleViewDocument = (record) => {
    if (record?.signedUrl) {
      window.open(record.signedUrl, '_blank');
    } else if (record?.fileUrl) {
      window.open(record.fileUrl, '_blank');
    } else if (record?.documentUrl) {
      window.open(record.documentUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Document is not available for viewing",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Opportunities</h1>
        <p className="text-muted-foreground">
          Explore and apply to jobs that value your academic achievements
        </p>
      </div>
      
      <Tabs defaultValue="jobs">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs">Available Jobs</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>
        
        {/* Available Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or location"
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
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No matching jobs found" : "No jobs available at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <Card key={job._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Building className="h-3.5 w-3.5 mr-1" />
                          {job.companyId?.name || "Unknown Company"}
                        </CardDescription>
                      </div>
                      <Badge variant={job.status === "open" ? "outline" : "secondary"}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      
                      <div className="text-sm mt-2">
                        <p className="font-medium">Requirements:</p>
                        <p className="text-muted-foreground mt-1">
                          {job.requirements?.length > 150 
                            ? `${job.requirements.substring(0, 150)}...` 
                            : job.requirements}
                        </p>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        Posted: {formatDate(job.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full" 
                      variant={job.status !== "open" ? "outline" : "default"}
                      disabled={job.status !== "open" || hasApplied(job._id) || verifiedRecords.length === 0}
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplyDialog(true);
                      }}
                    >
                      {hasApplied(job._id) 
                        ? "Already Applied" 
                        : job.status !== "open" 
                          ? "No Longer Available" 
                          : verifiedRecords.length === 0
                            ? "Need Verified Records"
                            : "Apply Now"
                      }
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* My Applications Tab */}
        <TabsContent value="applications" className="space-y-4 pt-4">
          {loadingApplications ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">You haven't applied to any jobs yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((application) => (
                <Card key={application._id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{application.jobId?.title || "Unknown Job"}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Building className="h-3.5 w-3.5 mr-1" />
                          {application.jobId?.companyId?.name || "Unknown Company"}
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
                        <p className="font-medium">Records Submitted: {application.academicRecords?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={application.status !== "pending"}
                      onClick={async () => {
                        try {
                          // Show confirmation before withdrawing
                          if (!window.confirm("Are you sure you want to withdraw this application?")) {
                            return;
                          }
                          
                          const response = await api.delete(`/applications/${application._id}`);
                          
                          if (response.data.success) {
                            toast({
                              title: "Application Withdrawn",
                              description: "Your job application has been withdrawn successfully"
                            });
                            
                            // Refresh applications list
                            fetchApplications();
                          }
                        } catch (error) {
                          console.error("Error withdrawing application:", error);
                          toast({
                            title: "Error",
                            description: error.response?.data?.message || "Failed to withdraw application",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      {application.status === "pending" ? "Withdraw Application" : "Application Processed"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Apply to Job Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply to {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Submit your application with verified academic records
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApply}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea 
                  id="coverLetter"
                  placeholder="Explain why you're a good fit for this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="min-h-32"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Select Academic Records to Include</Label>
                {loadingRecords ? (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : verifiedRecords.length === 0 ? (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    You don't have any verified academic records yet. Please submit your records and wait for verification before applying to jobs.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {verifiedRecords.map((record) => (
                      <div key={record._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`record-${record._id}`}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={selectedRecords.includes(record._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecords([...selectedRecords, record._id]);
                            } else {
                              setSelectedRecords(selectedRecords.filter(id => id !== record._id));
                            }
                          }}
                        />
                        <label htmlFor={`record-${record._id}`} className="text-sm font-medium flex-1">
                          {record.title} ({record.recordType}) - {record.institutionId?.name}
                        </label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-6 ml-auto"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent checkbox triggering
                            handleViewDocument(record);
                          }}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={applying || verifiedRecords.length === 0}>
                {applying ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 