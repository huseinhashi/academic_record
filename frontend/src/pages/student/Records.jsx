import { useState, useEffect, useRef } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  Check, 
  X, 
  Eye, 
  Download, 
  Share2, 
  Upload, 
  PlusCircle, 
  AlertCircle,
  UploadCloud,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

export const StudentRecords = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showReuploadDialog, setShowReuploadDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // State for new record form
  const [recordType, setRecordType] = useState("");
  const [title, setTitle] = useState("");
  const [document, setDocument] = useState(null);
  const fileInputRef = useRef(null);
  const reuploadFileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setDocument(e.target.files[0]);
    }
  };

  const handleReuploadFileChange = (e) => {
    if (e.target.files.length > 0) {
      setDocument(e.target.files[0]);
    }
  };

  const handleViewRecord = (id) => {
    // In a real app, you would navigate to a detailed view or show a modal with the record details
    toast({
      title: "Viewing Record",
      description: `Viewing record ID: ${id}`,
    });
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
    
    // Determine file extension based on file URL
    let extension = 'pdf';
    if (record.fileUrl?.toLowerCase().endsWith('.doc')) extension = 'doc';
    if (record.fileUrl?.toLowerCase().endsWith('.docx')) extension = 'docx';
    
    // Generate filename from record info if available
    const filename = record ? 
      `${record.recordType}_${record.title.replace(/\s+/g, '_')}.${extension}` : 
      `academic_record.${extension}`;
    
    // Try to open the file in a new tab
    const newWindow = window.open(record.signedUrl, '_blank');
    
    // If the window was blocked or failed to open
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = record.signedUrl;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "If the file doesn't open automatically, check your downloads folder",
      });
    }
  };

  const handleShareRecord = (hash) => {
    // Create a shareable link with the verification hash
    const shareableLink = `${window.location.origin}/verify/${hash}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        title: "Link Copied!",
        description: "Verification link copied to clipboard",
      });
    }).catch(err => {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    });
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Real API call to get student's academic records
      const response = await api.get("/records/my-records");
      
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

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    
    if (!recordType || !title || !document) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and upload a document",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (document.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "The file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type (PDF, DOC, DOCX)
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(document.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append("title", title);
      formData.append("recordType", recordType);
      formData.append("document", document);
      
      // Submit record
      const response = await api.post("/records", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast({
        title: "Record Submitted",
        description: "Your academic record has been submitted for verification",
      });
      
      // Reset form
      setRecordType("");
      setTitle("");
      setDocument(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Close dialog
      setShowAddDialog(false);
      
      // Refresh records
      fetchRecords();
    } catch (error) {
      console.error("Error submitting record:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit academic record",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handler for re-uploading a document for a rejected record
  const handleReuploadRecord = async (e) => {
    e.preventDefault();
    
    if (!selectedRecord || !document) {
      toast({
        title: "Missing Information",
        description: "Please select a document to upload",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (document.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "The file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type (PDF, DOC, DOCX)
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(document.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append("document", document);
      
      // Update record
      const response = await api.put(`/records/${selectedRecord._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast({
        title: "Record Updated",
        description: "Your academic record has been resubmitted for verification",
      });
      
      // Reset form
      setDocument(null);
      if (reuploadFileInputRef.current) {
        reuploadFileInputRef.current.value = "";
      }
      
      // Close dialog
      setShowReuploadDialog(false);
      setSelectedRecord(null);
      
      // Refresh records
      fetchRecords();
    } catch (error) {
      console.error("Error updating record:", error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update academic record",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  // Filter records based on search query
  const filteredRecords = records.filter(record => 
    record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.institutionId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.recordType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Academic Records</h1>
        <p className="text-muted-foreground">
          Submit and manage your academic achievements
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records by title, type, or institution"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit Academic Record</DialogTitle>
              <DialogDescription>
                Submit a new academic record for verification by your institution
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitRecord}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recordType" className="col-span-1">
                    Record Type
                  </Label>
                  <Select
                    value={recordType}
                    onValueChange={setRecordType}
                    required
                  >
                    <SelectTrigger id="recordType" className="col-span-3">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="degree">Degree</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="transcript">Transcript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="col-span-1">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Bachelor of Computer Science"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="document" className="col-span-1">
                    Document
                  </Label>
                  <div
                    className="col-span-3 border rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    {document ? (
                      <p className="text-sm font-medium">{document.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click to upload a PDF or Word document
                      </p>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="document"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Records</CardTitle>
          <CardDescription>
            Your submitted academic records and certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {searchQuery ? "No matching records found" : "No records found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.title}</TableCell>
                      <TableCell>{record.recordType}</TableCell>
                      <TableCell>{record.institutionId?.name || "Unknown"}</TableCell>
                      <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                        {record.status === 'rejected' && record.rejectionReason && (
                          <div className="mt-1 text-xs text-red-600 max-w-xs truncate" title={record.rejectionReason}>
                            Reason: {record.rejectionReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewRecord(record._id)}
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
                            PDF
                          </Button>
                          {record.status === 'verified' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleShareRecord(record.hash)}
                            >
                              <Share2 className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                          )}
                          {record.status === 'rejected' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowReuploadDialog(true);
                              }}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Resubmit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Re-upload Dialog for Rejected Records */}
      <Dialog open={showReuploadDialog} onOpenChange={setShowReuploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Resubmit Document</DialogTitle>
            <DialogDescription>
              Upload a new document to replace the rejected one
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <form onSubmit={handleReuploadRecord}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">{selectedRecord.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedRecord.recordType} • {selectedRecord.institutionId?.name}</p>
                </div>
                
                {selectedRecord.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-2">
                    <p className="text-sm font-medium text-red-700">Rejection Reason:</p>
                    <p className="text-sm text-red-600">{selectedRecord.rejectionReason}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="reupload-document">Upload New Document</Label>
                  <div
                    className="border rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => reuploadFileInputRef.current?.click()}
                  >
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                    {document ? (
                      <p className="text-sm font-medium">{document.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click to upload a new PDF or Word document
                      </p>
                    )}
                    <input
                      ref={reuploadFileInputRef}
                      type="file"
                      id="reupload-document"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleReuploadFileChange}
                      className="hidden"
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setShowReuploadDialog(false);
                  setSelectedRecord(null);
                  setDocument(null);
                  if (reuploadFileInputRef.current) {
                    reuploadFileInputRef.current.value = "";
                  }
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Resubmitting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resubmit Record
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Verification Information</CardTitle>
          <CardDescription>
            How academic record verification works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Submit Your Record</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your academic document and provide necessary details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Institution Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Your institution reviews and verifies the authenticity of your academic record.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Share Securely</h3>
                <p className="text-sm text-muted-foreground">
                  Once verified, you can share your credentials with employers using a secure blockchain-verified link.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 