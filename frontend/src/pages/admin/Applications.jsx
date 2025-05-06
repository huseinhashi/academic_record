import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, Users, Clock, Calendar, Eye, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/axios";

export const AdminApplications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetailsDialog, setShowApplicationDetailsDialog] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/applications/admin/all${activeTab !== "all" ? `?status=${activeTab}` : ""}`);
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      accepted: "success",
      rejected: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  // Filter applications based on search query
  const filteredApplications = applications.filter(app => 
    app.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.jobId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.jobId?.companyId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetailsDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Job Applications</h2>
        <p className="text-muted-foreground">
          View and manage all job applications in the system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications by student name, job title, or company..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No matching applications found" : "No applications found"}
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
                      {getStatusBadge(application.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        Applied: {formatDate(application.createdAt)}
                      </div>
                      
                      <div className="text-sm mt-2">
                        <p className="font-medium">Company:</p>
                        <p className="text-muted-foreground mt-1">
                          {application.jobId?.companyId?.name}
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
                <h4 className="font-medium">Job</h4>
                <p className="text-sm">
                  {selectedApplication.jobId?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.jobId?.companyId?.name}
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
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Document
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No academic records provided</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 