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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/axios";

export const AdminRecords = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewRecordDialog, setViewRecordDialog] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [activeTab]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/records/admin/all${activeTab !== "all" ? `?status=${activeTab}` : ""}`);
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Filter records based on search query
  const filteredRecords = records.filter(record => 
    record.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.studentId?.wallet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.recordType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.institutionId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewRecordDialog(true);
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
    
    window.open(record.signedUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Academic Records</h2>
        <p className="text-muted-foreground">
          View and manage all academic records in the system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records by student name, title, type, or institution..."
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
          ) : filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No matching records found" : "No records found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium">Student</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Record Type</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Institution</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Submitted On</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
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
                        <TableCell>{record.institutionId?.name}</TableCell>
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
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
                <h4 className="text-sm font-medium">Student</h4>
                <div className="mt-1">
                  <div className="font-medium">{selectedRecord.studentId?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRecord.studentId?.wallet}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Record Type</h4>
                <div className="mt-1 font-medium">{selectedRecord.recordType}</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Title</h4>
                <div className="mt-1 font-medium">{selectedRecord.title}</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Institution</h4>
                <div className="mt-1 font-medium">{selectedRecord.institutionId?.name}</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Status</h4>
                <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
              </div>
              
              {selectedRecord.status === "rejected" && (
                <div>
                  <h4 className="text-sm font-medium">Rejection Reason</h4>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 