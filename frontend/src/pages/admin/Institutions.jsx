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
import { CheckCircle, XCircle, School, Key, PlusCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export const AdminInstitutions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState([]);
  
  // Create institution dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    website: "",
    location: "",
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  
  // Reset password dialog state
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    id: "",
    name: "",
    password: "",
  });
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/institutions");
      setInstitutions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching institutions:", error);
      toast({
        title: "Error",
        description: "Failed to load institutions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const shortenWallet = (wallet) => {
    if (!wallet) return '';
    const prefix = wallet.substring(0, 6);
    const suffix = wallet.substring(wallet.length - 4);
    return `${prefix}...${suffix}`;
  };

  const handleVerify = async (id) => {
    try {
      await api.patch(`/users/institutions/${id}/verify`);
      toast({
        title: "Institution Verified",
        description: "The institution has been verified successfully",
      });
      fetchInstitutions();
    } catch (error) {
      console.error("Error verifying institution:", error);
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Failed to verify institution",
        variant: "destructive",
      });
    }
  };

  // Add validation function
  const validateInstitutionForm = () => {
    const { name, email, password, website, location } = createFormData;
    
    // Name validation
    if (!name.trim()) {
      return { isValid: false, errorMessage: "Institution name is required" };
    }
    
    if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(name)) {
      return { isValid: false, errorMessage: "Institution name must start with a letter and contain only letters and spaces" };
    }
    
    // Email validation
    if (!email.trim()) {
      return { isValid: false, errorMessage: "Email is required" };
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { isValid: false, errorMessage: "Please enter a valid email address" };
    }
    
    // Password validation
    if (!password) {
      return { isValid: false, errorMessage: "Password is required" };
    }
    
    if (password.length < 8) {
      return { isValid: false, errorMessage: "Password must be at least 8 characters long" };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, errorMessage: "Password must contain at least one lowercase letter" };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, errorMessage: "Password must contain at least one uppercase letter" };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, errorMessage: "Password must contain at least one number" };
    }
    
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return { isValid: false, errorMessage: "Password must contain at least one special character (!@#$%^&*)" };
    }
    
    // Website validation
    if (!website.trim()) {
      return { isValid: false, errorMessage: "Website is required" };
    }
    
    if (!/^https?:\/\/.+/.test(website)) {
      return { isValid: false, errorMessage: "Please enter a valid website URL starting with http:// or https://" };
    }
    
    // Location validation
    if (!location.trim()) {
      return { isValid: false, errorMessage: "Location is required" };
    }
    
    if (!/^[a-zA-Z][a-zA-Z\s,]*$/.test(location)) {
      return { isValid: false, errorMessage: "Location must start with a letter and contain only letters, spaces, and commas" };
    }
    
    return { isValid: true };
  };

  // Update handleCreateUser function
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    const { isValid, errorMessage } = validateInstitutionForm();
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    
    setCreatingUser(true);
    try {
      await api.post('/auth/institution/create', createFormData);
      
      toast({
        title: "Institution Created",
        description: "The institution has been created successfully",
      });
      
      // Reset form and close dialog
      setCreateFormData({
        name: "",
        email: "",
        password: "",
        website: "",
        location: "",
      });
      setShowCreateDialog(false);
      
      // Refresh institutions list
      fetchInstitutions();
    } catch (error) {
      console.error("Error creating institution:", error);
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || "Failed to create institution",
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };
  
  // Handle resetting a user's password
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
      await api.patch(`/users/institutions/${id}/password`, { password });
      
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutions</h1>
          <p className="text-muted-foreground">
            View and verify educational institutions
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Institution
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institutions</CardTitle>
          <CardDescription>
            View and verify educational institutions
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
                  <TableHead>Website</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Authentication</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No institutions found
                    </TableCell>
                  </TableRow>
                ) : (
                  institutions.map((institution) => (
                    <TableRow key={institution._id}>
                      <TableCell>{institution.name}</TableCell>
                      <TableCell>{institution.email}</TableCell>
                      <TableCell>
                        <a 
                          href={institution.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {institution.website}
                        </a>
                      </TableCell>
                      <TableCell>{institution.location}</TableCell>
                      <TableCell>
                        {institution.authMethod === "password" ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Password
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Wallet ({shortenWallet(institution.wallet)})
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {institution.isVerifiedByAdmin ? (
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
                        <div className="flex space-x-2">
                          {!institution.isVerifiedByAdmin && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerify(institution._id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verify
                            </Button>
                          )}
                          {institution.authMethod === "password" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setResetPasswordData({
                                  id: institution._id,
                                  name: institution.name,
                                  password: "",
                                });
                                setShowResetPasswordDialog(true);
                              }}
                            >
                              <Key className="h-3 w-3 mr-1" />
                              Reset Password
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Institution Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Institution</DialogTitle>
            <DialogDescription>
              Create a new educational institution with email and password authentication
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Institution Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="name" 
                name="name" 
                value={createFormData.name}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="University of Example"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@university.edu"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showCreatePassword ? "text" : "password"}
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showCreatePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">
                Website <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="website" 
                name="website" 
                type="url"
                value={createFormData.website}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://university.edu"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="location" 
                name="location" 
                value={createFormData.location}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                required
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={creatingUser}>
                {creatingUser ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
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
              <div className="relative">
                <Input 
                  id="reset-password" 
                  type={showResetPassword ? "text" : "password"}
                  value={resetPasswordData.password}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showResetPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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