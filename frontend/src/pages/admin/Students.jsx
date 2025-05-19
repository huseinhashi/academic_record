import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, User, Mail, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export const AdminStudents = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  
  // Reset password dialog state
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    id: "",
    name: "",
    password: "",
  });
  const [resettingPassword, setResettingPassword] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/students");
      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle resetting a student's password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const { id, password } = resetPasswordData;
    
    if (!password) {
      toast({
        title: "Missing password",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }
    
    setResettingPassword(true);
    try {
      await api.patch(`/users/students/${id}/password`, { password });
      
      toast({
        title: "Password Reset",
        description: "The password has been reset successfully",
      });
      
      // Reset form and close dialog
      setResetPasswordData({
        id: "",
        name: "",
        password: "",
      });
      setShowResetPasswordDialog(false);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Password Reset Failed",
        description: error.response?.data?.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Graduates</h1>
        <p className="text-muted-foreground">
          View and manage graduate accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Graduates</CardTitle>
          <CardDescription>
            View and manage graduate accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No graduates found
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {student.email}
                      </TableCell>
                      <TableCell>{student.institutionId?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {student.isVerifiedByInstitution ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setResetPasswordData({
                              id: student._id,
                              name: student.name,
                              password: "",
                            });
                            setShowResetPasswordDialog(true);
                          }}
                        >
                          <Key className="h-3 w-3 mr-1" />
                          Reset Password
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {resetPasswordData.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input 
                id="reset-password" 
                type="password"
                value={resetPasswordData.password}
                onChange={(e) => setResetPasswordData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter new password"
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={resettingPassword}>
                {resettingPassword ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 