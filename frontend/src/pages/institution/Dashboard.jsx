import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, GraduationCap, CheckCircle, School, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export const InstitutionDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    totalRecords: 0,
    verifiedRecords: 0,
    pendingRecords: 0,
    rejectedRecords: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch records for this institution
        const recordsResponse = await api.get("/records/institution");
        
        if (recordsResponse.data.success) {
          const records = recordsResponse.data.data;
          
          // Calculate record statistics
          const totalRecords = records.length;
          const verifiedRecords = records.filter(record => record.status === "verified").length;
          const pendingRecords = records.filter(record => record.status === "pending").length;
          const rejectedRecords = records.filter(record => record.status === "rejected").length;

          // Get unique students from records
          const uniqueStudents = new Set(records.map(record => record.studentId._id));
          const totalStudents = uniqueStudents.size;
          
          // Count verified students (students with at least one verified record)
          const verifiedStudents = new Set(
            records
              .filter(record => record.status === "verified")
              .map(record => record.studentId._id)
          ).size;

          setStats({
            totalStudents,
            verifiedStudents,
            totalRecords,
            verifiedRecords,
            pendingRecords,
            rejectedRecords
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Institution Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Institution Admin"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Students with academic records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Verified Students
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedStudents}</div>
            <p className="text-xs text-muted-foreground">
              Students with verified records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Records
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Academic records issued
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Verified Records
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedRecords}</div>
            <p className="text-xs text-muted-foreground">
              Blockchain-verified records
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Academic Records Overview</CardTitle>
            <CardDescription>
              Current status of academic records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Pending Verification</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingRecords}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Verified Records</p>
                  <p className="text-2xl font-bold text-green-600">{stats.verifiedRecords}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Rejected Records</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedRecords}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/institution/records">
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Records
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Process</CardTitle>
            <CardDescription>
              How academic records are verified on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your institution can verify student records on the blockchain, creating tamper-proof credentials that can be trusted by employers and other educational institutions.
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Review academic records submitted by students</li>
                <li>Verify the authenticity of the records</li>
                <li>Approve or reject records with appropriate feedback</li>
                <li>Approved records are automatically submitted to the blockchain</li>
                <li>Once verified, records become immutable and can be shared by students</li>
              </ol>
              <div className="mt-4">
                <Link to="/institution/records">
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    View Records
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 