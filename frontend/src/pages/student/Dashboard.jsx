import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  FileCheck, 
  Award, 
  Sparkles, 
  ArrowRight,
  Share2
} from "lucide-react";
// import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalRecords, setTotalRecords] = useState(0);
  const [verifiedRecords, setVerifiedRecords] = useState(0);
  const [recentRecords, setRecentRecords] = useState([]);
  const [institutionsCount, setInstitutionsCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch academic records
        const recordsResponse = await api.get("/records/my-records");
        const records = recordsResponse.data.data || [];
        
        // Fetch applications
        const applicationsResponse = await api.get("/applications/my-applications");
        const applications = applicationsResponse.data.data || [];
        
        // Calculate stats
        const total = records.length;
        const verified = records.filter(record => record.status === "verified").length;
        
        // Get recent records (most recent 3)
        const recent = [...records]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map(record => ({
            id: record._id,
            title: record.title,
            institution: record.institutionId?.name || "Unknown Institution",
            date: record.createdAt,
            isVerified: record.status === "verified",
            fileUrl: record.fileUrl
          }));
        
        // Calculate unique institutions
        const uniqueInstitutions = new Set(
          records
            .filter(record => record.institutionId)
            .map(record => record.institutionId._id)
        );
        
        // Number of job applications
        const appliedJobs = applications.length;
        
        setTotalRecords(total);
        setVerifiedRecords(verified);
        setRecentRecords(recent);
        setInstitutionsCount(uniqueInstitutions.size);
        setJobsCount(appliedJobs);
        
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  // Calculate the verification rate as a percentage
  const verificationRate = totalRecords ? Math.round((verifiedRecords / totalRecords) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || 'Student'}! View and manage your academic records
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Records
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Academic records in your portfolio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Records
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : verifiedRecords}</div>
            <p className="text-xs text-muted-foreground">
              Blockchain-verified credentials
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verification Rate
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : `${verificationRate}%`}</div>
            {/* <Progress value={verificationRate} className="h-2 mt-2" /> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Institutions
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : institutionsCount}</div>
            <p className="text-xs text-muted-foreground">
              Academic institutions in your portfolio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Academic Records</CardTitle>
            <CardDescription>
              Your most recent academic achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : recentRecords.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No records found. Start by requesting verification from your institution.
              </p>
            ) : (
              <div className="space-y-4">
                {recentRecords.map(record => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium flex items-center">
                        {record.title}
                        {record.isVerified && (
                          <Badge className="ml-2 bg-green-50 text-green-700 border-green-200">Verified</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.institution} • {new Date(record.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => record.fileUrl ? window.open(record.fileUrl, '_blank') : navigate('/student/records')}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/student/records")}>
              View All Records
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your academic records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" onClick={() => navigate("/student/records")}>
              <FileCheck className="mr-2 h-4 w-4" />
              View Academic Records
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/student/jobs")}>
              <Share2 className="mr-2 h-4 w-4" />
              Job Opportunities {jobsCount > 0 && `(${jobsCount})`}
            </Button>
            <Button className="w-full justify-start" variant="secondary" onClick={() => navigate("/student/profile")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Update Student Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Blockchain Verification</CardTitle>
          <CardDescription>
            How your academic records are secured on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Our platform uses blockchain technology to create immutable, tamper-proof records of your academic achievements. 
              This ensures that your credentials can be instantly verified by employers and other institutions around the world.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Immutable Records</h3>
                <p className="text-sm text-muted-foreground">
                  Once verified, your records cannot be altered or tampered with, providing the highest level of security and trust.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Instant Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Share your credentials with employers who can instantly verify their authenticity without contacting your institution.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Lifelong Access</h3>
                <p className="text-sm text-muted-foreground">
                  Your credentials will remain accessible to you for life, regardless of changes to your institution's systems.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 