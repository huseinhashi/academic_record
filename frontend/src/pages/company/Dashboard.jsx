import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, GraduationCap, CheckCircle, School, Briefcase, Search, Building2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = ({ payload }) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

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
  const [jobStats, setJobStats] = useState([]);
  const [applicationStats, setApplicationStats] = useState([]);
  const [jobTrends, setJobTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add verification check
  const isVerified = user?.isVerifiedByAdmin;

  // Custom colors for different charts
  const CHART_COLORS = {
    primary: "#8884d8",
    success: "#82ca9d",
    warning: "#ffc658",
    danger: "#ff8042",
    info: "#0088FE",
    secondary: "#00C49F"
  };

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

        // Process data for charts
        processJobStats(jobs);
        processApplicationStats(applications);
        processJobTrends(jobs);

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

  const processJobStats = (jobs) => {
    // Group jobs by status
    const stats = jobs.reduce((acc, job) => {
      if (!acc[job.status]) acc[job.status] = 0;
      acc[job.status]++;
      return acc;
    }, {});

    setJobStats(Object.entries(stats).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    })));
  };

  const processApplicationStats = (applications) => {
    // Group applications by status
    const stats = applications.reduce((acc, app) => {
      if (!acc[app.status]) acc[app.status] = 0;
      acc[app.status]++;
      return acc;
    }, {});

    setApplicationStats(Object.entries(stats).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    })));
  };

  const processJobTrends = (jobs) => {
    // Group jobs by creation date
    const jobData = jobs.reduce((acc, job) => {
      const date = new Date(job.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, open: 0, closed: 0 };
      }
      if (job.status === "open") acc[date].open++;
      if (job.status === "closed") acc[date].closed++;
      return acc;
    }, {});

    setJobTrends(Object.values(jobData).sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

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

      {!isVerified && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Account Verification Required</CardTitle>
            <CardDescription className="text-amber-700">
              Your company account is pending verification by an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-amber-800">
                To ensure the quality and authenticity of job postings, all company accounts must be verified before they can post jobs.
              </p>
              <p className="text-sm text-amber-700">
                While your account is pending verification, you can still browse the platform and prepare your job listings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                              Verified applicants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Job Trends Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Job Posting Trends</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={jobTrends}>
                  <defs>
                    <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#666' }}
                    tickLine={{ stroke: '#666' }}
                  />
                  <YAxis 
                    tick={{ fill: '#666' }}
                    tickLine={{ stroke: '#666' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                  <Area 
                    type="monotone" 
                    dataKey="open" 
                    stroke={CHART_COLORS.success} 
                    fillOpacity={1} 
                    fill="url(#colorOpen)" 
                    name="Open Jobs"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="closed" 
                    stroke={CHART_COLORS.warning} 
                    fillOpacity={1} 
                    fill="url(#colorClosed)" 
                    name="Closed Jobs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Job Status Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Job Status Distribution</CardTitle>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {jobStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={Object.values(CHART_COLORS)[index % Object.keys(CHART_COLORS).length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Application Status Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Application Status Distribution</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="status" 
                    tick={{ fill: '#666' }}
                    tickLine={{ stroke: '#666' }}
                  />
                  <YAxis 
                    tick={{ fill: '#666' }}
                    tickLine={{ stroke: '#666' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                  <Bar 
                    dataKey="count" 
                    fill={CHART_COLORS.primary}
                    radius={[4, 4, 0, 0]}
                    name="Applications"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
            How to effectively use verification in hiring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Streamline your recruitment process by leveraging verified academic credentials to ensure candidate qualifications are authentic and trustworthy.
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Create detailed job listings with specific qualification requirements</li>
              <li>Receive applications with pre-verified credentials</li>
              <li>Instantly validate candidate qualifications through our secure network</li>
              <li>Focus on candidate assessment knowing their credentials are authentic</li>
              <li>Make confident hiring decisions based on verified qualifications</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 