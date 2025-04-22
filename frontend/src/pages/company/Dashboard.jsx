import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, GraduationCap, CheckCircle, School, Briefcase, Search, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

export const CompanyDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    verifiedCandidates: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch jobs data
        const jobsResponse = await api.get("/jobs/my-jobs");
        const jobs = jobsResponse.data.data || [];
        
        // Fetch applications data
        const applicationsResponse = await api.get("/applications/company-applications");
        const applications = applicationsResponse.data.data || [];
        
        // Calculate stats
        const totalJobs = jobs.length;
        const activeJobs = jobs.filter(job => job.status === "open").length;
        const totalApplications = applications.length;
        
        // Verified candidates are those with at least one verified academic record
        const verifiedCandidates = applications.filter(app => 
          app.academicRecords && app.academicRecords.length > 0
        ).length;
        
        const pendingApplications = applications.filter(app => 
          app.status === "pending"
        ).length;
        
        setStats({
          totalJobs,
          activeJobs,
          totalApplications,
          verifiedCandidates,
          pendingApplications
        });
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
        <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Company Admin"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Job Postings
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              All posted positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Active Listings
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              Currently open positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Received applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Verified Candidates
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedCandidates}</div>
            <p className="text-xs text-muted-foreground">
              Blockchain-verified applicants
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Management</CardTitle>
            <CardDescription>
              Post and manage job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="space-y-1">
              <p>Create and manage job listings</p>
              <p className="text-sm text-muted-foreground">
                {stats.activeJobs} active job postings
              </p>
            </div>
            <Link to="/company/jobs">
              <Button>
                <Briefcase className="mr-2 h-4 w-4" />
                Manage Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Review</CardTitle>
            <CardDescription>
              Review incoming applications
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="space-y-1">
              <p>Review applicant qualifications</p>
              <p className="text-sm text-muted-foreground">
                {stats.pendingApplications} pending applications
              </p>
            </div>
            <Link to="/company/jobs?tab=applications">
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Review Applications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recruitment Process</CardTitle>
          <CardDescription>
            How to effectively use blockchain verification in hiring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Streamline your recruitment process by leveraging blockchain-verified academic credentials to ensure candidate qualifications are authentic and trustworthy.
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Create detailed job listings with specific qualification requirements</li>
              <li>Receive applications with pre-verified blockchain credentials</li>
              <li>Instantly validate candidate qualifications through our blockchain network</li>
              <li>Focus on candidate assessment knowing their credentials are authentic</li>
              <li>Make confident hiring decisions based on verified qualifications</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 