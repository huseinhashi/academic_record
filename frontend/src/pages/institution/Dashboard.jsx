import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, GraduationCap, CheckCircle, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import api from "@/lib/axios";

export const InstitutionDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    totalRecords: 0,
    verifiedRecords: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // In a real app, you would make API calls to get the actual stats
        // For now, we'll use placeholder data
        
        // Example API calls:
        // const studentsResponse = await api.get("/users/students/institution/count");
        // const recordsResponse = await api.get("/records/institution/count");
        
        // Simulating data
        setStats({
          totalStudents: 0,
          verifiedStudents: 2,
          totalRecords: 8,
          verifiedRecords: 2
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
              Registered students
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
              Verified by your institution
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
            <CardTitle>Student Management</CardTitle>
            <CardDescription>
              Verify and manage students from your institution
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="space-y-1">
              <p>Review and verify student profiles</p>
              <p className="text-sm text-muted-foreground">
                {stats.totalStudents - stats.verifiedStudents} students pending verification
              </p>
            </div>
            <Link to="/institution/students">
              <Button>
                <GraduationCap className="mr-2 h-4 w-4" />
                Manage Students
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Records</CardTitle>
            <CardDescription>
              Issue and manage academic credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="space-y-1">
              <p>Create and verify academic records</p>
              <p className="text-sm text-muted-foreground">
                {stats.totalRecords - stats.verifiedRecords} records pending verification
              </p>
            </div>
            <Link to="/institution/records">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Manage Records
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification Process</CardTitle>
          <CardDescription>
            How academic records are verified on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Your institution can verify student records on the blockchain, creating tamper-proof credentials that can be trusted by employers and other educational institutions.
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Verify registered students belong to your institution</li>
              <li>Create academic records for verified students</li>
              <li>Records are automatically submitted to the blockchain for verification</li>
              <li>Once verified, records become immutable and can be shared by students</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 