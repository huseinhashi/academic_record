import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export const UploadAcademicRecord = ({ studentId, onUploadSuccess }) => {
  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState("");
  const [document, setDocument] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setDocument(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !recordType || !document) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload a document",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (document.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "The file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type (PDF, DOC, DOCX)
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(document.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append("title", title);
      formData.append("recordType", recordType);
      formData.append("studentId", studentId);
      formData.append("document", document);
      
      // Upload record
      const response = await api.post("/api/records", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Reset form
      setTitle("");
      setRecordType("");
      setDocument(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      toast({
        title: "Record uploaded",
        description: "The academic record has been successfully uploaded",
      });
      
      // Callback for parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to upload record";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Academic Record</CardTitle>
        <CardDescription>
          Upload a new academic record for this student
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Record Title</Label>
            <Input
              id="title"
              placeholder="e.g. Bachelor's Degree in Computer Science"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recordType">Record Type</Label>
            <Select
              value={recordType}
              onValueChange={setRecordType}
              required
            >
              <SelectTrigger id="recordType">
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="degree">Degree</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="transcript">Transcript</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document">Document</Label>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              {document ? (
                <p className="text-sm font-medium">{document.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to upload a PDF or Word document
                </p>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                id="document"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a PDF or Word document (max 10MB)
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isUploading || !title || !recordType || !document}
          >
            {isUploading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Record
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 