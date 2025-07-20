import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileText, FileDown, BarChart3, Users, Briefcase, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const CompanyReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("jobs");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  });
  const [reportData, setReportData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});

  const reportTypes = [
    { value: "jobs", label: "Job Postings Report", icon: Briefcase },
    { value: "applications", label: "Job Applications Report", icon: Users },
    { value: "interviews", label: "Interviews Report", icon: CalendarDays },
    { value: "hiring", label: "Hiring Analytics Report", icon: BarChart3 }
  ];

  useEffect(() => {
    fetchReportData();
    fetchSummaryStats();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/company/${reportType}`, {
        params: {
          startDate: format(dateRange.from, 'yyyy-MM-dd'),
          endDate: format(dateRange.to, 'yyyy-MM-dd')
        }
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        console.error("Failed to fetch report data");
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      if (error.response?.data?.message) {
        console.error("Server error:", error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryStats = async () => {
    try {
      const response = await api.get(`/reports/company/summary`, {
        params: {
          startDate: format(dateRange.from, 'yyyy-MM-dd'),
          endDate: format(dateRange.to, 'yyyy-MM-dd')
        }
      });
      
      if (response.data.success) {
        setSummaryStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching summary stats:", error);
      if (error.response?.data?.message) {
        console.error("Server error:", error.response.data.message);
      }
    }
  };

  const exportToExcel = () => {
    if (!reportData.length) return;

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    if (!reportData.length) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`${reportTypes.find(r => r.value === reportType).label}`, 14, 15);
    
    // Add company name
    doc.setFontSize(12);
    doc.text(`Company: ${user.name}`, 14, 25);
    
    // Add date range
    doc.setFontSize(10);
    doc.text(`Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`, 14, 35);
    
    // Add table
    const tableColumn = Object.keys(reportData[0] || {});
    const tableRows = reportData.map(item => Object.values(item));
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(`${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Compute all unique headers from the data
  const allHeaders = Array.from(
    new Set(reportData.flatMap(row => Object.keys(row || {})))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Reports</h1>
        <p className="text-muted-foreground">
          Generate and export company-specific reports and analytics
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.activeJobs || 0} active jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.pendingApplications || 0} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalInterviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.upcomingInterviews || 0} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.hiringRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.totalHired || 0} candidates hired
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "PPP") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "PPP") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Options</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={exportToExcel}
                  disabled={loading || !reportData.length}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={exportToPDF}
                  disabled={loading || !reportData.length}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : reportData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    {allHeaders.map((header) => (
                      <th key={header} className="text-left p-2">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={index} className="border-b">
                      {allHeaders.map((header) => (
                        <td key={header} className="p-2">
                          {row[header] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No data available for the selected criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 