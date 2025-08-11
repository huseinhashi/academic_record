import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Briefcase, 
  Users, 
  Clock, 
  Calendar, 
  ArrowUpDown,
  Eye,
  FileText,
  DollarSign,
  Award,
  Building,
  MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

export const AdminJobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [jobCategories, setJobCategories] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    fetchJobs();
    fetchJobCategories();
  }, [activeTab]);

  const fetchJobCategories = async () => {
    try {
      const response = await api.get("/jobs/categories");
      if (response.data.success) {
        setJobCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching job categories:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/admin/all${activeTab !== "all" ? `?status=${activeTab}` : ""}`);
      if (response.data.success) {
        setJobs(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: "success",
      closed: "warning",
      filled: "default",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  // Handle viewing job details
  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setShowJobDialog(true);
  };

  // Handle viewing document
  const handleViewDocument = (doc) => {
    if (!doc?.signedUrl) {
      toast({
        title: "Error",
        description: "Document is not available for viewing",
        variant: "destructive"
      });
      return;
    }
    
    // Try to open the file in a new tab
    const newWindow = window.open(doc.signedUrl, '_blank');
    
    // If the window was blocked or failed to open
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = doc.signedUrl;
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || 
      job.category === categoryFilter ||
      (job.category === "Other" && job.customCategory?.toLowerCase().includes(categoryFilter.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

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

  // Request sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Job Postings</h2>
        <p className="text-muted-foreground">
          View and manage all job postings in the system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="filled">Filled</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, description, location, or company..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter || "ALL"}
              onValueChange={(value) => setCategoryFilter(value === "ALL" ? "" : value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {jobCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : sortedJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No matching jobs found" : "No jobs found"}
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
                      <th className="h-12 px-4 text-left align-middle font-medium">Company</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Salary</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Deadline</th>
                      <th 
                        className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                        onClick={() => requestSort("createdAt")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Posted On</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Hired Graduate</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">TOR</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {sortedJobs.map((job) => (
                      <tr key={job._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">{job.title}</td>
                        <td className="p-4 align-middle">{job.companyId?.name}</td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline">
                            {job.category === "Other" && job.customCategory ? job.customCategory : job.category || "Uncategorized"}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">{job.location}</td>
                        <td className="p-4 align-middle">{job.salary}</td>
                        <td className="p-4 align-middle">
                          <div className="text-sm">
                            {job.deadline ? formatDate(job.deadline) : "No deadline"}
                          </div>
                          {job.deadline && new Date(job.deadline) <= new Date() && (
                            <div className="text-xs text-red-600 font-medium">Expired</div>
                          )}
                        </td>
                        <td className="p-4 align-middle">{formatDate(job.createdAt)}</td>
                        <td className="p-4 align-middle">{getStatusBadge(job.status)}</td>
                        <td className="p-4 align-middle">
                          {job.hiredApplicant ? (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {job.hiredApplicant.name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {job.documents?.length || 0}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center space-x-2">
                            {job.documents && job.documents.length > 0 && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewDocument(job.documents[0])}
                                title="View TOR"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewJobDetails(job)}
                              title="View Job Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center mt-1">
                <Building className="h-3.5 w-3.5 mr-1" />
                {selectedJob?.companyId?.name || "Unknown Company"}
              </div>
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedJob.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {selectedJob.salary}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Posted: {formatDate(selectedJob.createdAt)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  Deadline: {selectedJob.deadline ? formatDate(selectedJob.deadline) : "No deadline"}
                  {selectedJob.deadline && new Date(selectedJob.deadline) <= new Date() && (
                    <span className="ml-2 text-red-600 font-medium">(Expired)</span>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Award className="h-4 w-4 mr-1" />
                  Required Certificates: {selectedJob.certificateRequirements?.join(", ")}
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Category:</span>
                  <Badge variant="outline">
                    {selectedJob.category === "Other" && selectedJob.customCategory 
                      ? selectedJob.customCategory 
                      : selectedJob.category || "Uncategorized"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedJob.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requirements?.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedJob.documents && selectedJob.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">TOR</h4>
                  <div className="space-y-2">
                    {selectedJob.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">TOR</span>
                            <span className="text-xs text-muted-foreground">
                              Uploaded: {formatDate(doc.uploadedAt)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(doc)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.hiredApplicant && (
                <div className="space-y-2">
                  <h4 className="font-medium">Hired Graduate</h4>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {selectedJob.hiredApplicant.name}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 