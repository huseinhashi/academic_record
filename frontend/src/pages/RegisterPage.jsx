import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { UserPlus, Wallet, Shield } from "lucide-react";
import { LoaderCircle } from "@/components/LoaderCircle";

import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

export const RegisterPage = () => {
  const { connectWallet, registerStudent, isConnecting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  
  // Student form data
  const [studentData, setStudentData] = useState({
    name: "",
    institutionId: "",
    roleNumber: "",
  });
  
  // Fetch institutions for student registration
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoadingInstitutions(true);
      try {
        const response = await api.get("/public/institutions");
        setInstitutions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching institutions:", error);
        toast({
          title: "Error",
          description: "Failed to load institutions",
          variant: "destructive",
        });
      } finally {
        setLoadingInstitutions(false);
      }
    };
    
    fetchInstitutions();
  }, [toast]);

  const handleConnectWallet = async () => {
    if (loading || isConnecting) return;

    try {
      const wallet = await connectWallet();
      setWalletAddress(wallet);
      setWalletConnected(true);
      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully",
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value, name) => {
    setStudentData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!walletConnected) {
      return { isValid: false, errorMessage: "Please connect your wallet first" };
    }
    
    if (!studentData.name || !studentData.institutionId || !studentData.roleNumber) {
      return { isValid: false, errorMessage: "Please fill in all required fields" };
    }
    
    return { isValid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    // Validate form
    const { isValid, errorMessage } = validateForm();
    
    if (!isValid) {
      toast({
        title: "Missing information",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...studentData,
        wallet: walletAddress,
      };
      
      const user = await registerStudent(userData);
      
      toast({
        title: "Registration successful",
        description: "Your student account has been created successfully",
      });
      
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/10 px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm border-opacity-50 shadow-lg">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex justify-center mb-2">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Create a Student Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Register to access blockchain-verified credentials
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Enter your full name" 
                    value={studentData.name}
                    onChange={handleInputChange}
                    required
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roleNumber">Role Number / Student ID</Label>
                  <Input 
                    id="roleNumber" 
                    name="roleNumber" 
                    placeholder="Enter your role number or student ID" 
                    value={studentData.roleNumber}
                    onChange={handleInputChange}
                    required
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="institutionId">Institution</Label>
                  <Select 
                    value={studentData.institutionId} 
                    onValueChange={(value) => handleSelectChange(value, "institutionId")}
                    required
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select your institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingInstitutions ? (
                        <div className="flex items-center justify-center p-2">
                          <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading...</span>
                        </div>
                      ) : institutions.length > 0 ? (
                        institutions.map((institution) => (
                          <SelectItem 
                            key={institution._id} 
                            value={institution._id}
                          >
                            {institution.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm">
                          No institutions available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label>Wallet Address</Label>
                {walletConnected ? (
                  <div className="flex items-center gap-2">
                    <Input 
                      value={`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`} 
                      disabled 
                      className="font-mono h-10"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleConnectWallet}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-10"
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full font-semibold h-11 mt-6" 
                disabled={loading || !walletConnected}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Student Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t p-6">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}; 