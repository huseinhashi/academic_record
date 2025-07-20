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
import { CheckCircle, XCircle, School, PlusCircle } from "lucide-react";
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
    wallet: "",
    website: "",
    location: "",
  });
  const [creatingUser, setCreatingUser] = useState(false);

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
    const { name, wallet, website, location } = createFormData;
    
    // Name validation
    if (!name.trim()) {
      return { isValid: false, errorMessage: "Institution name is required" };
    }
    
    if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(name)) {
      return { isValid: false, errorMessage: "Institution name must start with a letter and contain only letters and spaces" };
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
        wallet: "",
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
              Create a new educational institution with wallet authentication
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
    </div>
  );
}; 