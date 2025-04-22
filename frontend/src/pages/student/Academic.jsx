import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Share2, Download, Search, FileCheck, AlertTriangle, CheckCircle, Calendar, Award, School, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const StudentAcademic = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [filter, setFilter] = useState({
    type: "all",
    status: "all",
    search: "",
  });

  // Mock data for academic records
  const mockRecords = [
    {
      id: "rec-001",
      title: "Bachelor of Science - Computer Science",
      type: "degree",
      institution: "Massachusetts Institute of Technology",
      date: "2024-05-15",
      gpa: "3.8/4.0",
      status: "verified", // "verified", "pending", "rejected"
      verificationDate: "2024-01-10",
      txHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9",
      blockchain: "Ethereum",
      details: {
        coursework: [
          "Data Structures and Algorithms",
          "Artificial Intelligence",
          "Blockchain Technology",
          "Distributed Systems",
          "Computer Networks"
        ],
        achievements: [
          "Dean's List (2022-2024)",
          "Outstanding Academic Achievement Award"
        ]
      }
    },
    {
      id: "rec-002",
      title: "Introduction to Blockchain Technology",
      type: "course",
      institution: "Massachusetts Institute of Technology",
      date: "2023-12-15",
      grade: "A",
      credits: 3,
      status: "verified",
      verificationDate: "2024-01-05",
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      blockchain: "Ethereum",
      details: {
        instructor: "Dr. Sarah Johnson",
        description: "Comprehensive introduction to blockchain technology and its applications."
      }
    },
    {
      id: "rec-003",
      title: "Advanced Cryptography",
      type: "course",
      institution: "Massachusetts Institute of Technology",
      date: "2023-10-30",
      grade: "A-",
      credits: 4,
      status: "verified",
      verificationDate: "2023-11-15",
      txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
      blockchain: "Ethereum",
      details: {
        instructor: "Prof. Michael Chen",
        description: "Study of advanced cryptographic algorithms and protocols with applications in blockchain."
      }
    },
    {
      id: "rec-004",
      title: "Web3 Development Workshop",
      type: "certificate",
      institution: "Ethereum Foundation",
      date: "2023-08-20",
      status: "pending",
      details: {
        description: "Intensive workshop on developing decentralized applications on Ethereum.",
        skills: ["Solidity", "Web3.js", "Smart Contract Development"]
      }
    },
    {
      id: "rec-005",
      title: "Machine Learning for Blockchain",
      type: "course",
      institution: "Massachusetts Institute of Technology",
      date: "2023-05-15",
      grade: "B+",
      credits: 3,
      status: "verified",
      verificationDate: "2023-06-01",
      txHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
      blockchain: "Ethereum",
      details: {
        instructor: "Dr. Lisa Wong",
        description: "Application of machine learning techniques to blockchain data analysis."
      }
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch academic records
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRecords(mockRecords);
      } catch (error) {
        console.error("Error fetching academic records:", error);
        toast.error("Failed to load academic records");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "all") {
      handleFilterChange("status", "all");
    } else {
      handleFilterChange("status", value);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "degree":
        return <Award className="h-4 w-4" />;
      case "course":
        return <BookOpen className="h-4 w-4" />;
      case "certificate":
        return <FileCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
  };

  const handleShareRecord = (record) => {
    setSelectedRecord(record);
    setShareDialogOpen(true);
  };

  const handleVerifyRecord = (record) => {
    setSelectedRecord(record);
    setVerifyDialogOpen(true);
  };

  const handleShareSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the share request
    toast.success("Record shared successfully!");
    setShareDialogOpen(false);
  };

  const filteredRecords = records.filter(record => {
    const matchesType = filter.type === "all" || record.type === filter.type;
    const matchesStatus = filter.status === "all" || record.status === filter.status;
    const matchesSearch = filter.search === "" || 
      record.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      record.institution.toLowerCase().includes(filter.search.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const shortenHash = (hash) => {
    if (!hash) return "";
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
        <p className="text-muted-foreground">
          View, share, and verify your academic credentials
        </p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type</Label>
                <Select
                  value={filter.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger id="recordType">
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="degree">Degrees</SelectItem>
                    <SelectItem value="course">Courses</SelectItem>
                    <SelectItem value="certificate">Certificates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search records..."
                    value={filter.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Records</span>
                <span className="font-medium">{records.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified</span>
                <span className="font-medium">
                  {records.filter(r => r.status === "verified").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">
                  {records.filter(r => r.status === "pending").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-3/4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Records</CardTitle>
              <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Records</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 space-y-2">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">No Records Found</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {filter.search ? 
                      "No records match your search criteria. Try adjusting your filters." : 
                      "You don't have any academic records yet. Records will appear here once added by your institution."}
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {getTypeIcon(record.type)}
                              </div>
                              <div>
                                <div className="font-medium">{record.title}</div>
                                <div className="text-xs text-muted-foreground capitalize">{record.type}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{record.institution}</TableCell>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(record.status)} className="flex items-center space-x-1">
                              {getStatusIcon(record.status)}
                              <span className="capitalize">{record.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewRecord(record)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShareRecord(record)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              {record.status === "verified" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleVerifyRecord(record)}
                                >
                                  Verify
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Details Dialog */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedRecord.title}</DialogTitle>
              <DialogDescription>
                {selectedRecord.institution}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-2">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusColor(selectedRecord.status)} className="flex items-center space-x-1">
                  {getStatusIcon(selectedRecord.status)}
                  <span className="capitalize">{selectedRecord.status}</span>
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedRecord.date)}</span>
                </div>
              </div>

           
            </div>
            <DialogFooter className="sm:justify-between flex-row">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                {selectedRecord.status === "verified" && (
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleShareRecord(selectedRecord)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Academic Record</DialogTitle>
            <DialogDescription>
              Share your record with an institution or individual
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleShareSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <textarea
                  id="message"
                  placeholder="Add a personal message..."
                  className="min-h-[100px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accessPeriod">Access Period</Label>
                <Select defaultValue="7d">
                  <SelectTrigger id="accessPeriod">
                    <SelectValue placeholder="Select access period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Share Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Academic Record</DialogTitle>
            <DialogDescription>
              Blockchain verification information for this credential
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && selectedRecord.status === "verified" && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-primary/5 p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Verified on Blockchain</span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  This academic record has been cryptographically verified and permanently stored on the blockchain.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Record ID:</span>
                  <span className="font-mono">{selectedRecord.id}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Issuing Institution:</span>
                  <span>{selectedRecord.institution}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Issuance Date:</span>
                  <span>{formatDate(selectedRecord.date)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Verification Date:</span>
                  <span>{formatDate(selectedRecord.verificationDate)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Blockchain:</span>
                  <span>{selectedRecord.blockchain}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Transaction Hash:</span>
                  <a 
                    href={`https://etherscan.io/tx/${selectedRecord.txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {shortenHash(selectedRecord.txHash)}
                  </a>
                </div>
              </div>
              
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-900">
                <div className="flex items-start space-x-2">
                  <School className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">Tamper-Proof Credential</h4>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      This credential is stored on the blockchain and cannot be altered or falsified.
                      You can share this credential with potential employers or institutions knowing its authenticity is cryptographically proven.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              Close
            </Button>
            {selectedRecord && selectedRecord.status === "verified" && (
              <Button 
                as="a" 
                href={`https://etherscan.io/tx/${selectedRecord.txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on Blockchain
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 