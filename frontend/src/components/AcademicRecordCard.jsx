import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ExternalLink, 
  FileText,
  Info,
  Check,
  X
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export const AcademicRecordCard = ({ record }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { toast } = useToast();
  
  const downloadFile = () => {
    // Cloudinary URLs are already accessible directly
    window.open(record.fileUrl, '_blank');
  };
  
  const getRecordTypeBadge = () => {
    const types = {
      'certificate': { label: 'Certificate', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
      'degree': { label: 'Degree', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
      'course': { label: 'Course', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
      'transcript': { label: 'Transcript', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' }
    };
    
    const type = types[record.recordType] || { label: record.recordType, className: '' };
    
    return (
      <Badge variant="outline" className={`${type.className}`}>
        {type.label}
      </Badge>
    );
  };
  
  const verifyRecord = async () => {
    setIsVerifying(true);
    
    try {
      const response = await api.get(`/api/records/verify/${record.hash}`);
      
      if (response.data.success) {
        setVerificationResult({
          isValid: response.data.data.isValid,
          message: 'Record successfully verified'
        });
        
        toast({
          title: 'Verification successful',
          description: 'The academic record has been verified successfully',
        });
      }
    } catch (error) {
      setVerificationResult({
        isValid: false,
        message: 'Failed to verify record'
      });
      
      toast({
        title: 'Verification failed',
        description: error.response?.data?.message || 'Failed to verify academic record',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold line-clamp-2">{record.title}</CardTitle>
            <CardDescription>
              {record.institutionId && record.institutionId.name && (
                <span className="block text-sm">
                  Issued by: {record.institutionId.name}
                </span>
              )}
              <span className="block text-xs">
                Issued on: {format(new Date(record.createdAt), 'PPP')}
              </span>
            </CardDescription>
          </div>
          {getRecordTypeBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Document</span>
          </div>
          <Button size="sm" variant="outline" onClick={downloadFile}>
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
        </div>
        
        {verificationResult && (
          <div className={`mt-3 p-2 rounded-md flex items-center ${
            verificationResult.isValid 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}>
            {verificationResult.isValid ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            <span className="text-sm font-medium">{verificationResult.message}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-3">
        <div className="flex justify-between w-full">
          <Button 
            size="sm" 
            variant="secondary"
            onClick={verifyRecord}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>Verifying...</>
            ) : (
              <>
                <Info className="mr-1 h-4 w-4" />
                Verify
              </>
            )}
          </Button>
          {record.hash && (
            <span className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
              #{record.hash.substring(0, 8)}...
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}; 