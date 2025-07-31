import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, GraduationCap, CheckCircle, School, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
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
  const [recordStats, setRecordStats] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [recordTrends, setRecordTrends] = useState([]);
  const [loading, setLoading] = useState(true);

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

          // Process data for charts
          processRecordStats(records);
          processStudentStats(records);
          processRecordTrends(records);

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

  const processStudentStats = (records) => {
    // Group students by verification status
    const studentData = records.reduce((acc, record) => {
      const studentId = record.studentId._id;
      if (!acc[studentId]) {
        acc[studentId] = {
          student: record.studentId.name || "Unknown Student",
          verified: 0,
          pending: 0,
          rejected: 0
        };
      }
      acc[studentId][record.status]++;
      return acc;
    }, {});

    // Convert to array and get top students by total records
    const studentStats = Object.values(studentData)
      .map(student => ({
        name: student.student,
        total: student.verified + student.pending + student.rejected,
        verified: student.verified,
        pending: student.pending,
        rejected: student.rejected
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 students

    setStudentStats(studentStats);
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
                              Verified records
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
              <CardTitle>Record Verification Trends</CardTitle>
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
              <FileText className="h-5 w-5 text-muted-foreground" />
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

        {/* Top Students Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Students by Records</CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    type="number"
                    tick={{ fill: '#666' }}
                    tickLine={{ stroke: '#666' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#666' }}
                    tickLine={{ stroke: '#666' }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                  <Bar 
                    dataKey="verified" 
                    fill={CHART_COLORS.success}
                    radius={[0, 4, 4, 0]}
                    name="Verified"
                    stackId="a"
                  />
                  <Bar 
                    dataKey="pending" 
                    fill={CHART_COLORS.warning}
                    radius={[0, 4, 4, 0]}
                    name="Pending"
                    stackId="a"
                  />
                  <Bar 
                    dataKey="rejected" 
                    fill={CHART_COLORS.danger}
                    radius={[0, 4, 4, 0]}
                    name="Rejected"
                    stackId="a"
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
              How academic records are verified securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your institution can verify student records securely, creating tamper-proof credentials that can be trusted by employers and other educational institutions.
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Review academic records submitted by students</li>
                <li>Verify the authenticity of the records</li>
                <li>Approve or reject records with appropriate feedback</li>
                <li>Approved records are automatically verified and secured</li>
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