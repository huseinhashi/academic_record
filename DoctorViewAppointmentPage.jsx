import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { format } from "date-fns";
import { ArrowLeft, User, Calendar, Clock, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


export const DoctorViewAppointmentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { request } = useApiRequest();
  const [appointment, setAppointment] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isMedicalRecordDialogOpen, setIsMedicalRecordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [medicalRecordForm, setMedicalRecordForm] = useState({
    record_type: "",
    description: "",
    file: null,
  });
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch medications for selector
  const [medicationsList, setMedicationsList] = useState([]);
  useEffect(() => {
    if (isMedicalRecordDialogOpen) {
      request({ method: 'GET', url: '/medications' })
        .then(res => setMedicationsList(res.data || []));
    }
  }, [isMedicalRecordDialogOpen]);

  // 2. Prescription items state
  const [prescriptionItems, setPrescriptionItems] = useState([]);

  // 3. Add/remove prescription item rows
  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([...prescriptionItems, { medication_id: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };
  const handleRemovePrescriptionItem = (idx) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== idx));
  };
  const handlePrescriptionItemChange = (idx, field, value) => {
    setPrescriptionItems(prescriptionItems.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // 4. When editing, load prescription items
  useEffect(() => {
    if (selectedMedicalRecord && selectedMedicalRecord.record_type === 'prescription') {
      setPrescriptionItems(selectedMedicalRecord.prescription_items || []);
    } else {
      setPrescriptionItems([]);
    }
  }, [selectedMedicalRecord, isMedicalRecordDialogOpen]);

  const appointmentStatuses = [
    "scheduled",
    "completed",
    "cancelled"
  ];

  const recordTypes = [
    "diagnosis",
    "prescription",
    "test_result",
    "external_upload",
  ];

  // Medical Records Table Columns
  const medicalRecordColumns = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return format(new Date(date), "MMM d, yyyy");
      },
    },
    {
      accessorKey: "record_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("record_type");
        return (
          <Badge variant="outline" className="capitalize">
            {type.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "file_url",
      header: "File",
      cell: ({ row }) => {
        const fileUrl = row.getValue("file_url");
        return fileUrl ? (
          <a
            href={`http://localhost:3200/uploads/${fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View File
          </a>
        ) : (
          "No file"
        );
      },
    },
    {
      accessorKey: "PrescriptionItems",
      header: "Prescribed Medications",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="mt-2 space-y-1">
            <div className="font-semibold">Prescribed Medications:</div>
            <ul className="list-disc ml-6">
              {record.PrescriptionItems && record.PrescriptionItems.length > 0 && (
                record.PrescriptionItems.map((item, idx) => (
                  <li key={idx}>
                    {item.Medication?.name || 'Medication'} - {item.dosage}, {item.frequency}, {item.duration}, {item.instructions}
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEditMedicalRecord(record)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteMedicalRecord(record.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchAppointment();
    fetchMedicalRecords();
  }, [id]);

  const fetchAppointment = async () => {
    setIsLoading(true);
    try {
      const response = await request({
        method: "GET",
        url: `/appointments/${id}`,
      });
      setAppointment(response.data);
      setSelectedStatus(response.data.status);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const data = await request({
        method: "GET",
        url: `/medical-records/appointment/${id}`,
      });
      setMedicalRecords(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await request({
        method: "PATCH",
        url: `/appointments/${id}/status`,
        data: { status: selectedStatus }
      });
      toast({
        title: "Success",
        description: "Appointment status updated successfully"
      });
      fetchAppointment();
      setIsStatusDialogOpen(false);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleMedicalRecordSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Only append file if it exists and is new
      if (medicalRecordForm.file) {
        formData.append("file", medicalRecordForm.file);
      }

      // For updates, only send changed fields
      if (selectedMedicalRecord) {
        if (medicalRecordForm.record_type !== selectedMedicalRecord.record_type) {
          formData.append("record_type", medicalRecordForm.record_type);
        }
        if (medicalRecordForm.description !== selectedMedicalRecord.description) {
          formData.append("description", medicalRecordForm.description);
        }
      } else {
        // For new records, send all required fields
        formData.append("appointment_id", parseInt(id));
        formData.append("patient_id", parseInt(appointment.patient_id));
        formData.append("doctor_id", parseInt(appointment.doctor_id));
        formData.append("record_type", medicalRecordForm.record_type);
        formData.append("description", medicalRecordForm.description || "");
      }

      const validPrescriptionItems = prescriptionItems.filter(item => item.medication_id);
      if (medicalRecordForm.record_type === 'prescription') {
        formData.append('prescription_items', JSON.stringify(validPrescriptionItems));
      }

      if (selectedMedicalRecord) {
        await request({
          method: "PUT",
          url: `/medical-records/${selectedMedicalRecord.id}`,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({
          title: "Success",
          description: "Medical record updated successfully",
        });
      } else {
        await request({
          method: "POST",
          url: "/medical-records",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({
          title: "Success",
          description: "Medical record created successfully",
        });
      }

      // Close dialog before fetching to improve perceived performance
      setIsMedicalRecordDialogOpen(false);
      
      // Fetch records after dialog is closed
      await fetchMedicalRecords();
    } catch (error) {
      console.error("Error saving medical record:", error);
      toast({
        title: "Error",
        description: "Failed to save medical record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicalRecord = async (recordId) => {
    setSelectedMedicalRecord({ id: recordId });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await request({
        method: "DELETE",
        url: `/medical-records/${selectedMedicalRecord.id}`,
      });
      toast({
        title: "Success",
        description: "Medical record deleted successfully",
      });
      fetchMedicalRecords();
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMedicalRecord(null);
    }
  };

  const handleEditMedicalRecord = (record) => {
    setSelectedMedicalRecord(record);
    setMedicalRecordForm({
      record_type: record.record_type,
      description: record.description || "",
      file: null,
    });
    if (record.record_type === 'prescription' && record.PrescriptionItems) {
      setPrescriptionItems(
        record.PrescriptionItems.map(item => ({
          medication_id: item.medication_id?.toString() || "",
          dosage: item.dosage || "",
          frequency: item.frequency || "",
          duration: item.duration || "",
          instructions: item.instructions || "",
        }))
      );
    } else {
      setPrescriptionItems([]);
    }
    setIsMedicalRecordDialogOpen(true);
  };

const handleGeneratePdf = () => {
  if (!medicalRecords.length) return;
  
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
  doc.text('MEDICAL RECORDS REPORT', pageWidth / 2, 18, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive Patient Medical History', pageWidth / 2, 28, { align: 'center' });
  
  // Patient Information Card
  doc.setFillColor(...lightGray);
  doc.roundedRect(14, 50, pageWidth - 28, 35, 3, 3, 'F');
  
  // Patient info content
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', 20, 62);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${appointment.patient?.name || 'N/A'}`, 20, 72);
  doc.text(`Email: ${appointment.patient?.email || 'N/A'}`, 20, 80);
  
  const rightColumnX = pageWidth / 2 + 10;
  doc.text(`Phone: ${appointment.patient?.phone || 'N/A'}`, rightColumnX, 72);
  doc.text(`Appointment Date: ${format(new Date(appointment.appointment_date), "MMMM d, yyyy")}`, rightColumnX, 80);
  
  // Summary statistics
  const totalRecords = medicalRecords.length;
  const recordTypes = [...new Set(medicalRecords.map(r => r.record_type))];
  const recordsWithFiles = medicalRecords.filter(r => r.file_url).length;
  
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
  doc.text(`Record Types: ${recordTypes.length}`, 90, 115);
  doc.text(`Records with Files: ${recordsWithFiles}`, 160, 115);
  
  // Prepare enhanced table data
  const tableData = medicalRecords.map((rec, index) => [
    (index + 1).toString(),
    format(new Date(rec.createdAt), "MMM d, yyyy"),
    rec.record_type.replace("_", " ").toUpperCase(),
    rec.description || "No description provided",
    rec.file_url ? "✓ Available" : "✗ None",
  ]);
  
  // Generate table with enhanced styling
  try {
    autoTable(doc, {
      startY: 130,
      head: [["#", "Date", "Type", "Description", "File"]],
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
        1: { 
          halign: 'center', 
          cellWidth: 30,
        },
        2: { 
          halign: 'center', 
          cellWidth: 35,
          fontStyle: 'bold',
        },
        3: { 
          cellWidth: 80,
        },
        4: { 
          halign: 'center', 
          cellWidth: 25,
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
    toast({
      title: "Error",
      description: "Failed to generate PDF. Please try again.",
      variant: "destructive",
    });
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
    doc.text('This report was generated automatically and contains confidential medical information.', 20, finalY + 32);
    doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`, 20, finalY + 42);
    
    // Add a small medical icon using text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('⚕', pageWidth - 30, finalY + 38);
  }
  
  // Save with enhanced filename
  const patientName = appointment.patient?.name?.replace(/\s+/g, '_') || 'patient';
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  doc.save(`Medical_Records_${patientName}_${dateStr}.pdf`);
  
  // Show success message
  toast({
    title: "Success",
    description: "Professional PDF report generated successfully",
  });
};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Appointment Not Found</h2>
        <Button onClick={() => navigate("/doctor/appointments")}>
          Back to Appointments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/doctor/appointments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Patient details for this appointment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Name</h3>
              <p className="text-muted-foreground">{appointment.patient?.name}</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-muted-foreground">{appointment.patient?.email}</p>
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-muted-foreground">{appointment.patient?.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Schedule and status information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Date</h3>
              <p className="text-muted-foreground">
                {format(new Date(appointment.appointment_date), "MMMM d, yyyy")}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Time</h3>
              <p className="text-muted-foreground">
                {format(new Date(`2000-01-01T${appointment.time_slot?.start_time}`), "h:mm a")} -{" "}
                {format(new Date(`2000-01-01T${appointment.time_slot?.end_time}`), "h:mm a")}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    appointment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  {appointment.status}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsStatusDialogOpen(true)}
                >
                  Update Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Records */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>Manage patient medical records for this appointment</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleGeneratePdf}
                  disabled={!medicalRecords.length}
                  variant="secondary"
                >
                  Generate PDF
                </Button>
                <Button onClick={() => {
                  setSelectedMedicalRecord(null);
                  setMedicalRecordForm({
                    record_type: "",
                    description: "",
                    file: null,
                  });
                  setIsMedicalRecordDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medical Record
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={medicalRecordColumns}
              data={medicalRecords}
              isLoading={isLoading}
              noResultsMessage="No medical records found"
            />
          </CardContent>
        </Card>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {appointmentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical Record Dialog */}
      <Dialog open={isMedicalRecordDialogOpen} onOpenChange={setIsMedicalRecordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMedicalRecord ? "Edit Medical Record" : "Add Medical Record"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="record_type">Record Type</Label>
              <Select
                value={medicalRecordForm.record_type}
                onValueChange={(value) =>
                  setMedicalRecordForm((prev) => ({
                    ...prev,
                    record_type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace("_", " ").charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={medicalRecordForm.description}
                onChange={(e) =>
                  setMedicalRecordForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter description"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) =>
                  setMedicalRecordForm((prev) => ({
                    ...prev,
                    file: e.target.files[0],
                  }))
                }
              />
            </div>

            {medicalRecordForm.record_type === 'prescription' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Medications</h4>
                  <Button type="button" onClick={handleAddPrescriptionItem} size="sm">Add Medication</Button>
                </div>
                {prescriptionItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                      <Label>Medication</Label>
                      <Select value={item.medication_id} onValueChange={val => handlePrescriptionItemChange(idx, 'medication_id', val)}>
                        <SelectTrigger><SelectValue placeholder="Select medication" /></SelectTrigger>
                        <SelectContent>
                          {medicationsList.map(med => (
                            <SelectItem key={med.id} value={med.id.toString()}>{med.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <Label>Dosage</Label>
                      <Input value={item.dosage} onChange={e => handlePrescriptionItemChange(idx, 'dosage', e.target.value)} placeholder="e.g. 500mg" />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <Label>Frequency</Label>
                      <Input value={item.frequency} onChange={e => handlePrescriptionItemChange(idx, 'frequency', e.target.value)} placeholder="e.g. Twice a day" />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <Label>Duration</Label>
                      <Input value={item.duration} onChange={e => handlePrescriptionItemChange(idx, 'duration', e.target.value)} placeholder="e.g. 7 days" />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <Label>Instructions</Label>
                      <Input value={item.instructions} onChange={e => handlePrescriptionItemChange(idx, 'instructions', e.target.value)} placeholder="e.g. After meals" />
                    </div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemovePrescriptionItem(idx)} title="Remove"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsMedicalRecordDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMedicalRecordSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {selectedMedicalRecord ? "Updating..." : "Adding..."}
                </>
              ) : (
                selectedMedicalRecord ? "Update Medical Record" : "Add Medical Record"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this medical record? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 