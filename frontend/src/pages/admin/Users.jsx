import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, User, School, Building2, Shield, Key, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { LoaderCircle } from "@/components/LoaderCircle";

export const AdminUsers = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("students");
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [students, setStudents] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  // Create institution/company dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState("institution");
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });
  const [creatingUser, setCreatingUser] = useState(false);
  
  // Reset password dialog state
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    id: "",
    type: "",
    name: "",
    password: "",
  });
  const [resettingPassword, setResettingPassword] = useState(false);

  // Verify user function
  const handleVerify = async (id, type) => {
    try {
      let endpoint;
      
      if (type === 'institution') {
        endpoint = `/users/institutions/${id}/verify`;
      } else if (type === 'company') {
        endpoint = `/users/companies/${id}/verify`;
      } else {
        return;
      }
      
      await api.patch(endpoint);
      
      toast({
        title: "User Verified",
        description: "The user has been verified successfully",
      });
      
      // Refresh the data
      fetchUsers();
    } catch (error) {
      console.error(`Error verifying ${type}:`, error);
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Failed to verify user",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Make real API calls
      const adminsPromise = api.get("/users/admins");
      const studentsPromise = api.get("/users/students");
      const institutionsPromise = api.get("/users/institutions");
      const companiesPromise = api.get("/users/companies");
      
      const [adminsResponse, studentsResponse, institutionsResponse, companiesResponse] = await Promise.all([
        adminsPromise,
        studentsPromise,
        institutionsPromise,
        companiesPromise
      ]);
      
      setAdmins(adminsResponse.data.data || []);
      setStudents(studentsResponse.data.data || []);
      setInstitutions(institutionsResponse.data.data || []);
      setCompanies(companiesResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [toast]);

  const shortenWallet = (wallet) => {
    if (!wallet) return '';
    const prefix = wallet.substring(0, 6);
    const suffix = wallet.substring(wallet.length - 4);
    return `${prefix}...${suffix}`;
  };
  
  // Handle creating a new institution or company
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    const { name, email, password, address, phone } = createFormData;
    
    // Validate form based on user type
    if (createType === 'institution') {
      if (!name || !email || !password) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    } else if (createType === 'company') {
      if (!name || !email || !password || !address || !phone) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    
    setCreatingUser(true);
    try {
      let endpoint = '';
      let data = {};
      
      if (createType === 'institution') {
        endpoint = '/auth/institution/create';
        data = { name, email, password };
      } else {
        endpoint = '/auth/company/create';
        data = { name, email, password, address, phone };
      }
      
      await api.post(endpoint, data);
      
      toast({
        title: `${createType === 'institution' ? 'Institution' : 'Company'} Created`,
        description: `The ${createType} has been created successfully with password authentication`,
      });
      
      // Reset form and close dialog
      setCreateFormData({
        name: "",
        email: "",
        password: "",
        address: "",
        phone: "",
      });
      setShowCreateDialog(false);
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error(`Error creating ${createType}:`, error);
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || `Failed to create ${createType}`,
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };
  
  // Handle resetting a user's password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const { id, type, password } = resetPasswordData;
    
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
      const endpoint = `/users/${type}s/${id}/password`;
      await api.patch(endpoint, { password });
      
      toast({
        title: "Password Reset",
        description: "The password has been reset successfully",
      });
      
      // Reset form and close dialog
      setResetPasswordData({
        id: "",
        type: "",
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
  
  // Open reset password dialog for a user
  const openResetPasswordDialog = (id, type, name) => {
    setResetPasswordData({
      id,
      type,
      name,
      password: "",
    });
    setShowResetPasswordDialog(true);
  };
  
  // Open create dialog for institution or company
  const openCreateDialog = (type) => {
    setCreateType(type);
    setCreateFormData({
      name: "",
      email: "",
      password: "",
      address: "",
      phone: "",
    });
    setShowCreateDialog(true);
  };
  
  // Handle input change for create form
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage and verify users in the system
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Admins</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Students</span>
          </TabsTrigger>
          <TabsTrigger value="institutions" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            <span>Institutions</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Companies</span>
          </TabsTrigger>
        </TabsList>

        {/* Admins Tab */}
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>
                View system administrators
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
                      <TableHead>Wallet</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No administrators found
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow key={admin._id}>
                          <TableCell>{admin.name}</TableCell>
                          <TableCell className="font-mono">{shortenWallet(admin.wallet)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Administrator
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                View and manage student accounts
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
                      <TableHead>Wallet</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell className="font-mono">{shortenWallet(student.wallet)}</TableCell>
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
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Institutions Tab */}
        <TabsContent value="institutions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Institutions</CardTitle>
                <CardDescription>
                  View and verify educational institutions
                </CardDescription>
              </div>
              <Button onClick={() => openCreateDialog('institution')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Institution
              </Button>
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
                      <TableHead>Authentication</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {institutions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No institutions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      institutions.map((institution) => (
                        <TableRow key={institution._id}>
                          <TableCell>{institution.name}</TableCell>
                          <TableCell>{institution.email}</TableCell>
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
                                  onClick={() => handleVerify(institution._id, 'institution')}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verify
                                </Button>
                              )}
                              {institution.authMethod === "password" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openResetPasswordDialog(institution._id, 'institution', institution.name)}
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
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Companies</CardTitle>
                <CardDescription>
                  View and verify companies
                </CardDescription>
              </div>
              <Button onClick={() => openCreateDialog('company')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Company
              </Button>
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
                      <TableHead>Authentication</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No companies found
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow key={company._id}>
                          <TableCell>{company.name}</TableCell>
                          <TableCell>{company.email}</TableCell>
                          <TableCell>
                            {company.authMethod === "password" ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Password
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                Wallet ({shortenWallet(company.wallet)})
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {company.isVerifiedByAdmin ? (
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
                              {!company.isVerifiedByAdmin && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleVerify(company._id, 'company')}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verify
                                </Button>
                              )}
                              {company.authMethod === "password" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openResetPasswordDialog(company._id, 'company', company.name)}
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
        </TabsContent>
      </Tabs>

      {/* Create Institution/Company Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {createType === 'institution' ? 'Create Institution' : 'Create Company'}
            </DialogTitle>
            <DialogDescription>
              {createType === 'institution' 
                ? 'Create a new educational institution with email and password authentication' 
                : 'Create a new company with email and password authentication'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {createType === 'institution' ? 'Institution Name' : 'Company Name'}
              </Label>
              <Input 
                id="name" 
                name="name" 
                value={createFormData.name}
                onChange={handleCreateFormChange}
                placeholder={createType === 'institution' ? 'University of Example' : 'Example Corp'}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={createFormData.email}
                onChange={handleCreateFormChange}
                placeholder={createType === 'institution' ? 'admin@university.edu' : 'contact@company.com'}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password"
                value={createFormData.password}
                onChange={handleCreateFormChange}
                placeholder="••••••••"
                required
              />
            </div>
            
            {createType === 'company' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={createFormData.address}
                    onChange={handleCreateFormChange}
                    placeholder="123 Company Street, City"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={createFormData.phone}
                    onChange={handleCreateFormChange}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </>
            )}
            
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={creatingUser}>
                {creatingUser ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
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
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
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