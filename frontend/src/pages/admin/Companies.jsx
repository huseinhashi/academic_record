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
import { CheckCircle, XCircle, Building2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export const AdminCompanies = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  
  // Create company dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    wallet: "",
    website: "",
    address: "",
    phone: "",
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/companies");
      setCompanies(response.data.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const shortenWallet = (wallet) => {
    if (!wallet) return '';
    const prefix = wallet.substring(0, 6);
    const suffix = wallet.substring(wallet.length - 4);
    return `${prefix}...${suffix}`;
  };

  const handleVerify = async (id) => {
    try {
      await api.patch(`/users/companies/${id}/verify`);
      toast({
        title: "Company Verified",
        description: "The company has been verified successfully",
      });
      fetchCompanies();
    } catch (error) {
      console.error("Error verifying company:", error);
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Failed to verify company",
        variant: "destructive",
      });
    }
  };

  // Add validation function
  const validateCompanyForm = () => {
    const { name, wallet, website, address, phone } = createFormData;
    
    // Name validation
    if (!name.trim()) {
      return { isValid: false, errorMessage: "Company name is required" };
    }
    
    if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(name)) {
      return { isValid: false, errorMessage: "Company name must start with a letter and contain only letters and spaces" };
    }
    
    // Wallet validation
    if (!wallet.trim()) {
      return { isValid: false, errorMessage: "Wallet address is required" };
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return { isValid: false, errorMessage: "Please enter a valid Ethereum wallet address" };
    }
    
    // Website validation
    if (!website.trim()) {
      return { isValid: false, errorMessage: "Website is required" };
    }
    
    if (!/^https?:\/\/.+/.test(website)) {
      return { isValid: false, errorMessage: "Please enter a valid website URL starting with http:// or https://" };
    }
    
    // Address validation
    if (!address.trim()) {
      return { isValid: false, errorMessage: "Address is required" };
    }
    
    // Phone validation
    if (!phone.trim()) {
      return { isValid: false, errorMessage: "Phone number is required" };
    }
    
    if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return { isValid: false, errorMessage: "Please enter a valid phone number" };
    }
    
    return { isValid: true };
  };

  // Update handleCreateUser function
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    const { isValid, errorMessage } = validateCompanyForm();
    
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
      await api.post('/auth/company/create', createFormData);
      
      toast({
        title: "Company Created",
        description: "The company has been created successfully",
      });
      
      // Reset form and close dialog
      setCreateFormData({
        name: "",
        wallet: "",
        website: "",
        address: "",
        phone: "",
      });
      setShowCreateDialog(false);
      
      // Refresh companies list
      fetchCompanies();
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || "Failed to create company",
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            View and verify companies
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>
            View and verify companies
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
                        <div className="flex space-x-2">
                          {!company.isVerifiedByAdmin && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerify(company._id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verify
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

      {/* Create Company Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Company</DialogTitle>
            <DialogDescription>
              Create a new company with wallet authentication
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="name" 
                name="name" 
                value={createFormData.name}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Example Corp"
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
                onChange={(e) => setCreateFormData(prev => ({ ...prev, wallet: e.target.value }))}
                placeholder="0x..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website" 
                name="website" 
                type="url"
                value={createFormData.website}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                value={createFormData.address}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Company address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={createFormData.phone}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
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
    </div>
  );
}; 