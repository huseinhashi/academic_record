import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Check, X, Eye, Download, ClockIcon, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/axios";

export const InstitutionRecords = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewRecordDialog, setViewRecordDialog] = useState(false);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchRecords = async () => {
      setLoading(true);
      try {
      // API call to get records issued by this institution
      const response = await api.get("/records/institution");
      
      if (response.data.success) {
        setRecords(response.data.data);
      }
      } catch (error) {
      console.error("Error fetching records:", error);
        toast({
          title: "Error",
        description: "Failed to load academic records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewRecordDialog(true);
  };

  const handleVerifyRecord = async () => {
    if (!selectedRecord) return;
    
    setProcessing(true);
    
    try {
      const response = await api.put(`/records/verify/${selectedRecord._id}`, {
        action: "verify"
      });
      
      if (response.data.success) {
        toast({
          title: "Record Verified",
          description: "The academic record has been verified successfully",
        });
        
        // Close dialog and refresh records
        setVerifyDialog(false);
        setSelectedRecord(null);
        fetchRecords();
      }
    } catch (error) {
      console.error("Error verifying record:", error);
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Failed to verify the record",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRecord = async () => {
    if (!selectedRecord || !rejectionReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      const response = await api.put(`/records/verify/${selectedRecord._id}`, {
        action: "reject",
        rejectionReason: rejectionReason
      });
      
      if (response.data.success) {
        toast({
          title: "Record Rejected",
          description: "The academic record has been rejected",
        });
        
        // Close dialog and refresh records
        setRejectDialog(false);
        setSelectedRecord(null);
        setRejectionReason("");
        fetchRecords();
      }
    } catch (error) {
      console.error("Error rejecting record:", error);
      toast({
        title: "Rejection Failed",
        description: error.response?.data?.message || "Failed to reject the record",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadRecord = (record) => {
    if (!record?.signedUrl) {
      toast({
        title: "Error",
        description: "Secure download link not available",
        variant: "destructive",
      });
      return;
    }
    
    // Just open the URL in a new tab - the browser will handle the rest
    window.open(record.signedUrl, '_blank');
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  // Filter records based on search query and active tab
  const filteredRecords = records
    .filter(record => 
      (record.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       record.studentId?.wallet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       record.recordType?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(record => {
      if (activeTab === "all") return true;
      return record.status === activeTab;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
        <p className="text-muted-foreground">
          Verify and manage academic records submitted by your students
        </p>
      </div>

      <Tabs 
        defaultValue="pending" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
              placeholder="Search records by student name, title, or type"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        </div>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Records</CardTitle>
              <CardDescription>
                Review and verify academic records submitted by students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending records found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Record Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">
                          {record.studentId?.name}
                          <div className="text-xs text-muted-foreground">
                            {record.studentId?.wallet?.substring(0, 6)}...{record.studentId?.wallet?.substring(record.studentId?.wallet?.length - 4)}
                          </div>
                        </TableCell>
                        <TableCell>{record.recordType}</TableCell>
                        <TableCell>{record.title}</TableCell>
                        <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewRecord(record)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                              onClick={() => {
                                setSelectedRecord(record);
                                setVerifyDialog(true);
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Verify
            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                              onClick={() => {
                                setSelectedRecord(record);
                                setRejectDialog(true);
                              }}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
              </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified" className="mt-4">
      <Card>
        <CardHeader>
              <CardTitle>Verified Records</CardTitle>
          <CardDescription>
                Academic records that have been verified by your institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No verified records found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                      <TableHead>Record Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Verified On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">
                          {record.studentId?.name}
                          <div className="text-xs text-muted-foreground">
                            {record.studentId?.wallet?.substring(0, 6)}...{record.studentId?.wallet?.substring(record.studentId?.wallet?.length - 4)}
                          </div>
                    </TableCell>
                      <TableCell>{record.recordType}</TableCell>
                        <TableCell>{record.title}</TableCell>
                        <TableCell>{new Date(record.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                              onClick={() => handleViewRecord(record)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                              onClick={() => handleDownloadRecord(record)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                              Download
                          </Button>
                        </div>
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Records</CardTitle>
              <CardDescription>
                Complete list of all academic records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No records found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Record Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">
                          {record.studentId?.name}
                          <div className="text-xs text-muted-foreground">
                            {record.studentId?.wallet?.substring(0, 6)}...{record.studentId?.wallet?.substring(record.studentId?.wallet?.length - 4)}
                          </div>
                        </TableCell>
                        <TableCell>{record.recordType}</TableCell>
                        <TableCell>{record.title}</TableCell>
                        <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewRecord(record)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {record.status === "verified" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadRecord(record)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* View Record Dialog */}
      <Dialog open={viewRecordDialog} onOpenChange={setViewRecordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
            <DialogDescription>
              View the details of this academic record
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Student</Label>
                <div className="mt-1">
                  <div className="font-medium">{selectedRecord.studentId?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRecord.studentId?.wallet}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Record Type</Label>
                <div className="mt-1 font-medium">{selectedRecord.recordType}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <div className="mt-1 font-medium">{selectedRecord.title}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
              </div>
              
              {selectedRecord.status === "rejected" && (
                <div>
                  <Label className="text-sm font-medium">Rejection Reason</Label>
                  <div className="mt-1 text-sm text-red-600">{selectedRecord.rejectionReason}</div>
                </div>
              )}
              
              <div className="pt-2">
                <Button 
                  className="w-full"
                  onClick={() => handleDownloadRecord(selectedRecord)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Document
                </Button>
              </div>
              
              {selectedRecord.status === "pending" && (
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline"
                    className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                    onClick={() => {
                      setViewRecordDialog(false);
                      setVerifyDialog(true);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                    onClick={() => {
                      setViewRecordDialog(false);
                      setRejectDialog(true);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Verify Dialog */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to verify this academic record?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRecord && (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Student:</span> {selectedRecord.studentId?.name}
                </div>
                <div>
                  <span className="font-medium">Title:</span> {selectedRecord.title}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedRecord.recordType}
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              This action will verify the academic record and make it available to the student for sharing with companies.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setVerifyDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyRecord}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Verify Record
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Record</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this academic record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRecord && (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Student:</span> {selectedRecord.studentId?.name}
                </div>
                <div>
                  <span className="font-medium">Title:</span> {selectedRecord.title}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedRecord.recordType}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please explain why this record is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRejectRecord}
              disabled={processing || !rejectionReason.trim()}
              variant="destructive"
            >
              {processing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Record
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 