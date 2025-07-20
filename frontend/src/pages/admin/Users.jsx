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
import { CheckCircle, XCircle, User, School, Building2, Shield, PlusCircle } from "lucide-react";
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
    wallet: "",
    address: "",
    phone: "",
    website: "",
    location: "",
  });
  const [creatingUser, setCreatingUser] = useState(false);

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
    
    const { name, wallet, address, phone, website, location } = createFormData;
    
    // Validate form based on user type
    if (createType === 'institution') {
      if (!name || !wallet || !website || !location) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    } else if (createType === 'company') {
      if (!name || !wallet || !website || !address || !phone) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Validate wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      toast({
        title: "Invalid wallet address",
        description: "Please enter a valid Ethereum wallet address",
        variant: "destructive",
      });
      return;
    }
    
    setCreatingUser(true);
    try {
      let endpoint = '';
      let data = {};
      
      if (createType === 'institution') {
        endpoint = '/auth/institution/create';
        data = { name, wallet, website, location };
      } else {
        endpoint = '/auth/company/create';
        data = { name, wallet, website, address, phone };
      }
      
      await api.post(endpoint, data);
      
      toast({
        title: `${createType === 'institution' ? 'Institution' : 'Company'} Created`,
        description: `The ${createType} has been created successfully with wallet authentication`,
      });
      
      // Reset form and close dialog
      setCreateFormData({
        name: "",
        wallet: "",
        address: "",
        phone: "",
        website: "",
        location: "",
      });
      setShowCreateDialog(false);
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const openCreateDialog = (type) => {
    setCreateType(type);
    setCreateFormData({
      name: "",
      wallet: "",
      address: "",
      phone: "",
      website: "",
      location: "",
    });
    setShowCreateDialog(true);
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users in the system
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
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
                  <LoaderCircle className="h-8 w-8 animate-spin" />
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
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {shortenWallet(student.wallet)}
                            </Badge>
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
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="institutions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Institutions</CardTitle>
                  <CardDescription>
                    View and manage educational institutions
                  </CardDescription>
                </div>
                <Button onClick={() => openCreateDialog('institution')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Institution
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {institutions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No institutions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      institutions.map((institution) => (
                        <TableRow key={institution._id}>
                          <TableCell>{institution.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {shortenWallet(institution.wallet)}
                            </Badge>
                          </TableCell>
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

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Companies</CardTitle>
                  <CardDescription>
                    View and manage company accounts
                  </CardDescription>
                </div>
                <Button onClick={() => openCreateDialog('company')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No companies found
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow key={company._id}>
                          <TableCell>{company.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {shortenWallet(company.wallet)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {company.website}
                            </a>
                          </TableCell>
                          <TableCell>{company.address}</TableCell>
                          <TableCell>{company.phone}</TableCell>
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

        <TabsContent value="admins" className="space-y-4">
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
                  <LoaderCircle className="h-8 w-8 animate-spin" />
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
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {shortenWallet(admin.wallet)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
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
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Create {createType === 'institution' ? 'Institution' : 'Company'}
            </DialogTitle>
            <DialogDescription>
              {createType === 'institution' 
                ? 'Create a new educational institution with wallet authentication'
                : 'Create a new company with wallet authentication'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {createType === 'institution' ? 'Institution' : 'Company'} Name <span className="text-red-500">*</span>
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
              <Label htmlFor="wallet">
                Wallet Address <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="wallet" 
                name="wallet" 
                value={createFormData.wallet}
                onChange={handleCreateFormChange}
                placeholder="0x..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website <span className="text-red-500">*</span></Label>
              <Input 
                id="website" 
                name="website" 
                type="url"
                value={createFormData.website}
                onChange={handleCreateFormChange}
                placeholder="https://example.com"
                required
              />
            </div>
            
            {createType === 'institution' ? (
              <div className="space-y-2">
                <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={createFormData.location}
                  onChange={handleCreateFormChange}
                  placeholder="City, Country"
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={createFormData.address}
                    onChange={handleCreateFormChange}
                    placeholder="Company address"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={createFormData.phone}
                    onChange={handleCreateFormChange}
                    placeholder="+1234567890"
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
    </div>
  );
}; 