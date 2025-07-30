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
import autoTable from 'jspdf-autotable';

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
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colors
    const primaryColor = [41, 128, 185]; // Blue
    const secondaryColor = [52, 73, 94]; // Dark gray
    const lightGray = [236, 240, 241];
    const darkGray = [127, 140, 141];
    
    // Header section with background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    const reportTypeLabel = reportTypes.find(r => r.value === reportType)?.label || "Company Report";
    doc.text(reportTypeLabel.toUpperCase(), pageWidth / 2, 18, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Company Recruitment and Hiring Report', pageWidth / 2, 28, { align: 'center' });
    
    // Company Information Card
    doc.setFillColor(...lightGray);
    doc.roundedRect(14, 50, pageWidth - 28, 35, 3, 3, 'F');
    
    // Company info content
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPANY INFORMATION', 20, 62);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Company: ${user.name}`, 20, 72);
    doc.text(`Email: ${user.email || 'N/A'}`, 20, 80);
    
    const rightColumnX = pageWidth / 2 + 10;
    doc.text(`Report Type: ${reportTypeLabel}`, rightColumnX, 72);
    doc.text(`Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`, rightColumnX, 80);
    
    // Summary statistics
    const totalRecords = reportData.length;
    const uniqueColumns = Object.keys(reportData[0] || {}).length;
    const recordsWithData = reportData.filter(r => Object.values(r).some(val => val && val !== 'N/A')).length;
    
    // Statistics section
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, 95, pageWidth - 28, 25, 3, 3, 'F');
    
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY STATISTICS', 20, 107);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Records: ${totalRecords}`, 20, 115);
    doc.text(`Data Fields: ${uniqueColumns}`, 90, 115);
    doc.text(`Valid Records: ${recordsWithData}`, 160, 115);
    
    // Prepare enhanced table data
    const tableHeaders = Object.keys(reportData[0] || {});
    const tableData = reportData.map((row, index) => {
      const rowData = [index + 1]; // Add row number
      tableHeaders.forEach(header => {
        const value = row[header];
        rowData.push(value !== null && value !== undefined ? value.toString() : 'N/A');
      });
      return rowData;
    });
    
    // Generate table with enhanced styling
    try {
      autoTable(doc, {
        startY: 130,
        head: [['#', ...tableHeaders]],
        body: tableData,
        theme: 'grid',
        styles: { 
          fontSize: 9,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
          textColor: [60, 60, 60],
          font: 'helvetica',
        },
        headStyles: { 
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center',
          valign: 'middle',
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { 
            halign: 'center', 
            cellWidth: 15,
            fillColor: [245, 245, 245],
            fontStyle: 'bold',
          },
        },
        margin: { top: 130, left: 14, right: 14 },
        tableWidth: 'auto',
        didDrawPage: function (data) {
          // Add page numbers
          doc.setFontSize(8);
          doc.setTextColor(...darkGray);
          doc.text(
            `Page ${data.pageNumber}`,
            pageWidth - 30,
            pageHeight - 10
          );
        }
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      return;
    }
    
    // Footer
    const finalY = doc.lastAutoTable.finalY || 200;
    if (finalY < pageHeight - 50) {
      doc.setFillColor(...lightGray);
      doc.rect(14, finalY + 20, pageWidth - 28, 30, 'F');
      
      doc.setTextColor(...darkGray);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('This report was generated automatically and contains company recruitment data.', 20, finalY + 32);
      doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`, 20, finalY + 42);
      
      // Add a small icon using text
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('🏢', pageWidth - 30, finalY + 38);
    }
    
    // Save with enhanced filename
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    doc.save(`${reportType}_report_${dateStr}.pdf`);
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