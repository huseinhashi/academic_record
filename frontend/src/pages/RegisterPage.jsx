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
import { UserPlus, Wallet, Shield, Building2, School, User } from "lucide-react";
import { LoaderCircle } from "@/components/LoaderCircle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const RegisterPage = () => {
  const { connectWallet, registerStudent, registerInstitution, registerCompany, isConnecting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [activeTab, setActiveTab] = useState("student");
  
  // Student form data
  const [studentData, setStudentData] = useState({
    name: "",
    institutionId: "",
    roleNumber: "",
    skills: [],
  });
  const [skillInput, setSkillInput] = useState("");

  // Institution form data
  const [institutionData, setInstitutionData] = useState({
    name: "",
    email: "",
    password: "",
    website: "",
    location: "",
  });

  // Company form data
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    password: "",
    website: "",
    address: "",
    phone: "",
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
    
    if (activeTab === "student") {
      fetchInstitutions();
    }
  }, [toast, activeTab]);

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

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    switch (formType) {
      case "student":
        setStudentData(prev => ({ ...prev, [name]: value }));
        break;
      case "institution":
        setInstitutionData(prev => ({ ...prev, [name]: value }));
        break;
      case "company":
        setCompanyData(prev => ({ ...prev, [name]: value }));
        break;
    }
  };
  
  const handleSelectChange = (value, name) => {
    setStudentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (!studentData.skills.includes(newSkill)) {
        setStudentData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setStudentData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const validateStudentForm = () => {
    if (!walletConnected) {
      return { isValid: false, errorMessage: "Please connect your wallet first" };
    }
    
    if (!studentData.name || !studentData.institutionId || !studentData.roleNumber) {
      return { isValid: false, errorMessage: "Please fill in all required fields" };
    }
    
    return { isValid: true };
  };

  const validateInstitutionForm = () => {
    const { name, email, password, website, location } = institutionData;
    if (!name || !email || !password || !website || !location) {
      return { isValid: false, errorMessage: "Please fill in all required fields" };
    }
    return { isValid: true };
  };

  const validateCompanyForm = () => {
    const { name, email, password, website, address, phone } = companyData;
    if (!name || !email || !password || !website || !address || !phone) {
      return { isValid: false, errorMessage: "Please fill in all required fields" };
    }
    return { isValid: true };
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    const { isValid, errorMessage } = validateStudentForm();
    
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

  const handleInstitutionSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const { isValid, errorMessage } = validateInstitutionForm();
    
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
      const user = await registerInstitution(institutionData);
      
      toast({
        title: "Registration successful",
        description: "Your institution account has been created successfully. Please wait for admin verification.",
      });
      
      navigate("/institution/dashboard");
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

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const { isValid, errorMessage } = validateCompanyForm();
    
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
      const user = await registerCompany(companyData);
      
      toast({
        title: "Registration successful",
        description: "Your company account has been created successfully. Please wait for admin verification.",
      });
      
      navigate("/company/dashboard");
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
    <div className="min-h-screen flex">
      {/* Left side - Registration form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-background px-6 py-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="eSkooly Logo" className="h-12" />
          </div>
          
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm">I do not have an account yet</p>
            <p className="font-medium mt-6 mb-4">I am</p>
          </div>
          
          <div className="flex justify-center gap-4 mb-8">
            <button 
              className={`rounded-full p-3 flex flex-col items-center gap-2 transition-all ${activeTab === "institution" ? "bg-blue-100 ring-2 ring-primary" : "bg-background hover:bg-blue-50"}`}
              onClick={() => setActiveTab("institution")}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-500 text-white">
                <School className="h-8 w-8" />
              </div>
              <span className="text-xs font-medium">Institution</span>
            </button>
            
            <button 
              className={`rounded-full p-3 flex flex-col items-center gap-2 transition-all ${activeTab === "student" ? "bg-blue-100 ring-2 ring-primary" : "bg-background hover:bg-blue-50"}`}
              onClick={() => setActiveTab("student")}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center border">
                <Shield className="h-8 w-8 text-gray-500" />
              </div>
              <span className="text-xs font-medium">Student</span>
            </button>
            
            <button 
              className={`rounded-full p-3 flex flex-col items-center gap-2 transition-all ${activeTab === "company" ? "bg-blue-100 ring-2 ring-primary" : "bg-background hover:bg-blue-50"}`}
              onClick={() => setActiveTab("company")}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center border">
                <Building2 className="h-8 w-8 text-gray-500" />
              </div>
              <span className="text-xs font-medium">Company</span>
            </button>
          </div>
          
          <Card className="border shadow-sm">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="hidden">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="institution">Institution</TabsTrigger>
                  <TabsTrigger value="company">Company</TabsTrigger>
                </TabsList>

                {/* Student Registration Form */}
                <TabsContent value="student">
                  <form onSubmit={handleStudentSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Input 
                          id="name" 
                          name="name" 
                          placeholder="Full Name" 
                          value={studentData.name}
                          onChange={(e) => handleInputChange(e, "student")}
                          required
                          className="h-12"
                        />
                      </div>
                      
                      <div>
                        <Input 
                          id="roleNumber" 
                          name="roleNumber" 
                          placeholder="Role Number / Student ID" 
                          value={studentData.roleNumber}
                          onChange={(e) => handleInputChange(e, "student")}
                          required
                          className="h-12"
                        />
                      </div>
                      
                      <div>
                        <Select 
                          value={studentData.institutionId} 
                          onValueChange={(value) => handleSelectChange(value, "institutionId")}
                          required
                        >
                          <SelectTrigger className="h-12">
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

                      <div>
                        <Input 
                          id="skills" 
                          placeholder="Type a skill and press Enter" 
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleSkillInputKeyDown}
                          className="h-12"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {studentData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add your skills by typing and pressing Enter
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      {walletConnected ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            value={`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`} 
                            disabled 
                            className="font-mono h-12"
                          />
                          <Button type="button" variant="outline" size="sm" onClick={handleConnectWallet} className="h-12">
                            Change
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full h-12"
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
                      className="w-full font-semibold h-12 mt-4 bg-blue-500 hover:bg-blue-600" 
                      disabled={loading || !walletConnected}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Institution Registration Form */}
                <TabsContent value="institution">
                  <form onSubmit={handleInstitutionSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Input 
                          id="institution-name" 
                          name="name" 
                          placeholder="Institution Name" 
                          value={institutionData.name}
                          onChange={(e) => handleInputChange(e, "institution")}
                          required
                          className="h-12"
                        />
                      </div>
                      
                      <div>
                        <Input 
                          id="institution-email" 
                          name="email" 
                          type="email"
                          placeholder="Email" 
                          value={institutionData.email}
                          onChange={(e) => handleInputChange(e, "institution")}
                          required
                          className="h-12"
                        />
                      </div>
                      
                      <div>
                        <Input 
                          id="institution-password" 
                          name="password" 
                          type="password"
                          placeholder="Password" 
                          value={institutionData.password}
                          onChange={(e) => handleInputChange(e, "institution")}
                          required
                          className="h-12"
                        />
                      </div>

                      <div>
                        <Input 
                          id="institution-website" 
                          name="website" 
                          type="url"
                          placeholder="Website" 
                          value={institutionData.website}
                          onChange={(e) => handleInputChange(e, "institution")}
                          required
                          className="h-12"
                        />
                      </div>

                      <div>
                        <Input 
                          id="institution-location" 
                          name="location" 
                          placeholder="Location" 
                          value={institutionData.location}
                          onChange={(e) => handleInputChange(e, "institution")}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox id="remember-institution" />
                      <label
                        htmlFor="remember-institution"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember Me
                      </label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full font-semibold h-12 mt-4 bg-blue-500 hover:bg-blue-600" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Company Registration Form */}
                <TabsContent value="company">
                  <form onSubmit={handleCompanySubmit} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Input 
                          id="company-name" 
                          name="name" 
                          placeholder="Company Name" 
                          value={companyData.name}
                          onChange={(e) => handleInputChange(e, "company")}
                          required
                          className="h-12"
                        />
                      </div>
                      
                      <div>
                        <Input 
                          id="company-email" 
                          name="email" 
                          type="email"
                          placeholder="Email" 
                          value={companyData.email}
                          onChange={(e) => handleInputChange(e, "company")}
                          required
                          className="h-12"
                        />
                      </div>
                      
                      <div>
                        <Input 
                          id="company-password" 
                          name="password" 
                          type="password"
                          placeholder="Password" 
                          value={companyData.password}
                          onChange={(e) => handleInputChange(e, "company")}
                          required
                          className="h-12"
                        />
                      </div>

                      <div>
                        <Input 
                          id="company-website" 
                          name="website" 
                          type="url"
                          placeholder="Website" 
                          value={companyData.website}
                          onChange={(e) => handleInputChange(e, "company")}
                          required
                          className="h-12"
                        />
                      </div>

                      <div>
                        <Input 
                          id="company-address" 
                          name="address" 
                          placeholder="Address" 
                          value={companyData.address}
                          onChange={(e) => handleInputChange(e, "company")}
                          required
                          className="h-12"
                        />
                      </div>

                      <div>
                        <Input 
                          id="company-phone" 
                          name="phone" 
                          placeholder="Phone" 
                          value={companyData.phone}
                          onChange={(e) => handleInputChange(e, "company")}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox id="remember-company" />
                      <label
                        htmlFor="remember-company"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember Me
                      </label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full font-semibold h-12 mt-4 bg-blue-500 hover:bg-blue-600" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t p-4">
              {/* <div className="text-sm text-muted-foreground">
                Forgot password?{" "}
                <Link to="/forgot-password" className="text-blue-500 font-medium hover:underline">
                  Reset here
                </Link>
              </div> */}
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Right side - Blue banner */}
      <div className="hidden md:flex md:w-1/2 bg-blue-500 flex-col justify-center items-center px-8 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">Start managing now</h1>
          <p className="text-lg mb-10">
            academic records, applications, and more
          </p>
          <Button className="bg-white text-blue-500 hover:bg-blue-50 font-semibold px-8 py-6 h-12 rounded-full">
            Get started
          </Button>
          
          <div className="mt-16">
            <img 
              src="/logo.png" 
              alt="Platform illustration" 
              className="max-w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};