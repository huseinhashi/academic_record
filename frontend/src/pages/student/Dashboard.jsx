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
  Share2,
  Briefcase,
  ClipboardList,
  TrendingUp
} from "lucide-react";
// import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [recentRecords, setRecentRecords] = useState([]);
  const [institutionsCount, setInstitutionsCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recordStats, setRecordStats] = useState([]);
  const [applicationStats, setApplicationStats] = useState([]);
  const [recordTrends, setRecordTrends] = useState([]);

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
        const certificates = records.length;
        const totalApps = applications.length;
        
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
        
        setTotalCertificates(certificates);
        setTotalApplications(totalApps);
        setRecentRecords(recent);
        setInstitutionsCount(uniqueInstitutions.size);
        setJobsCount(appliedJobs);

        // Process data for charts
        processRecordStats(records);
        processApplicationStats(applications);
        processRecordTrends(records);
        
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

  const processRecordStats = (records) => {
    // Group records by status
    const stats = records.reduce((acc, record) => {
      if (!acc[record.status]) acc[record.status] = 0;
      acc[record.status]++;
      return acc;
    }, {});

    setRecordStats(Object.entries(stats).map(([status, count]) => ({
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

  const processRecordTrends = (records) => {
    // Group records by creation date
    const recordData = records.reduce((acc, record) => {
      const date = new Date(record.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, verified: 0, pending: 0, rejected: 0 };
      }
      acc[date][record.status]++;
      return acc;
    }, {});

    setRecordTrends(Object.values(recordData).sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  // Calculate the verification rate as a percentage
  const verificationRate = totalCertificates ? Math.round((totalCertificates / totalCertificates) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || 'Student'}! View and manage your academic records on Hiigsi Forum
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Certificates
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              Verified certificates in your portfolio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Job applications submitted
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

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Record Trends Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Academic Record Trends</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recordTrends}>
                  <defs>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.danger} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_COLORS.danger} stopOpacity={0}/>
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
                    dataKey="verified" 
                    stroke={CHART_COLORS.success} 
                    fillOpacity={1} 
                    fill="url(#colorVerified)" 
                    name="Verified Records"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stroke={CHART_COLORS.warning} 
                    fillOpacity={1} 
                    fill="url(#colorPending)" 
                    name="Pending Records"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rejected" 
                    stroke={CHART_COLORS.danger} 
                    fillOpacity={1} 
                    fill="url(#colorRejected)" 
                    name="Rejected Records"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Record Status Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Record Status Distribution</CardTitle>
              <FileCheck className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recordStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {recordStats.map((entry, index) => (
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
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
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

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Academic Records</CardTitle>
            <CardDescription>
              Your most recent academic achievements on Hiigsi Forum
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
              Manage your academic records on Hiigsi Forum
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
                     <CardTitle>About Hiigsi Forum Verification</CardTitle>
           <CardDescription>
             How your academic records are secured and verified
           </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                         <p>
               Our platform uses advanced encryption and verification technology to create secure, tamper-proof records of your academic achievements. 
               This ensures that your credentials can be instantly verified by employers and other institutions around the world.
             </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="border rounded-lg p-4">
                                 <h3 className="font-semibold mb-2">Secure Records</h3>
                 <p className="text-sm text-muted-foreground">
                   Once verified, your records are protected with advanced encryption, providing the highest level of security and trust.
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
                   Your credentials will remain accessible to you for life, securely stored in our verified system.
                 </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 