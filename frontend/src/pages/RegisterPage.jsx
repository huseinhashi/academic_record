//register page
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Wallet, X, GraduationCap, Building2, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "@/components/LoaderCircle";
import { SkillsSelect } from "@/components/SkillsSelect";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const RegisterPage = () => {
  const { connectWallet, registerStudent, registerInstitution, registerCompany, isConnecting } = useAuth();
  const navigate = useNavigate();
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
    website: "",
    location: "",
  });

  // Company form data
  const [companyData, setCompanyData] = useState({
    name: "",
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
    const { name, institutionId, roleNumber, skills } = studentData;
    
    // Name validation
    if (!name.trim()) {
      return { isValid: false, errorMessage: "Name is required" };
    }
    
    if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(name)) {
      return { isValid: false, errorMessage: "Name must start with a letter and contain only letters and spaces" };
    }
    
    // Role number validation
    if (!roleNumber.trim()) {
      return { isValid: false, errorMessage: "Role Number is required" };
    }
    
    if (!/^[A-Za-z0-9-]+$/.test(roleNumber)) {
      return { isValid: false, errorMessage: "Role Number can only contain letters, numbers, and hyphens" };
    }
    
    if (!institutionId) {
      return { isValid: false, errorMessage: "Please select an institution" };
    }
    
    if (skills.length === 0) {
      return { isValid: false, errorMessage: "Please add at least one skill" };
    }
    
    return { isValid: true };
  };

  const validateInstitutionForm = () => {
    const { name, website, location } = institutionData;
    
    // Name validation
    if (!name.trim()) {
      return { isValid: false, errorMessage: "Institution name is required" };
    }
    
    if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(name)) {
      return { isValid: false, errorMessage: "Institution name must start with a letter and contain only letters and spaces" };
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

  const validateCompanyForm = () => {
    const { name, website, address, phone } = companyData;
    
    // Name validation
    if (!name.trim()) {
      return { isValid: false, errorMessage: "Company name is required" };
    }
    
    if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(name)) {
      return { isValid: false, errorMessage: "Company name must start with a letter and contain only letters and spaces" };
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

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    const { isValid, errorMessage } = validateStudentForm();
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        ...studentData,
        wallet: walletAddress,
      });
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully",
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
    
    if (!walletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const { isValid, errorMessage } = validateInstitutionForm();
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await registerInstitution({
        ...institutionData,
        wallet: walletAddress,
      });
      
      toast({
        title: "Registration successful",
        description: "Your institution account has been created successfully",
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
    
    if (!walletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const { isValid, errorMessage } = validateCompanyForm();
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await registerCompany({
        ...companyData,
        wallet: walletAddress,
      });
      
      toast({
        title: "Registration successful",
        description: "Your company account has been created successfully",
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

  const renderForm = () => {
    if (activeTab === "student") {
      return (
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          {/* Wallet Connection Section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <Label className="text-sm font-semibold">Wallet Connection</Label>
              </div>
              {walletConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-0.5 text-xs">
                  Connected
          </Badge>
              )}
            </div>
            {walletConnected ? (
              <div className="text-xs text-muted-foreground bg-background p-2 rounded-lg">
                <p className="font-medium">Connected: {walletAddress}</p>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full h-10 bg-background hover:bg-background/80 border-primary/30 hover:border-primary/50 text-sm"
              >
                {isConnecting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect MetaMask
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2 block text-sm font-semibold">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <UserPlus size={16} />
                </div>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Enter your full name" 
                  value={studentData.name}
                  onChange={(e) => handleInputChange(e, "student")}
                  required
                  className="h-11 pl-10 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="roleNumber" className="mb-2 block text-sm font-semibold">
                Role Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <UserPlus size={16} />
                </div>
                <Input 
                  id="roleNumber" 
                  name="roleNumber" 
                  placeholder="Enter your role number" 
                  value={studentData.roleNumber}
                  onChange={(e) => handleInputChange(e, "student")}
                  required
                  className="h-11 pl-10 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="institution" className="mb-2 block text-sm font-semibold">
                Institution <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={studentData.institutionId} 
                onValueChange={(value) => handleSelectChange(value, "institutionId")}
              >
                <SelectTrigger className="h-11 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Select your institution" />
                </SelectTrigger>
                <SelectContent>
                  {loadingInstitutions ? (
                    <div className="p-4 text-center text-sm">
                      Loading institutions...
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
                    <div className="p-4 text-center text-sm">
                      No institutions available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="skills" className="mb-3 block text-sm font-semibold">
                Skills <span className="text-red-500">*</span>
              </Label>
              <SkillsSelect
                selectedSkills={studentData.skills}
                onSkillsChange={(skills) => setStudentData(prev => ({ ...prev, skills }))}
                required
                error={studentData.skills.length === 0 ? "Please select at least one skill" : undefined}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full font-semibold h-11 text-sm mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200" 
            disabled={loading || !walletConnected}
          >
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "REGISTER"
            )}
          </Button>
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-primary hover:underline text-sm font-medium">
              Already have an account? Login
            </Link>
          </div>
        </form>
      );
    } else if (activeTab === "institution") {
      return (
        <form onSubmit={handleInstitutionSubmit} className="space-y-4">
          {/* Wallet Connection Section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <Label className="text-sm font-semibold">Wallet Connection</Label>
              </div>
              {walletConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-0.5 text-xs">
                  Connected
                </Badge>
              )}
            </div>
            {walletConnected ? (
              <div className="text-xs text-muted-foreground bg-background p-2 rounded-lg">
                <p className="font-medium">Connected: {walletAddress}</p>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full h-10 bg-background hover:bg-background/80 border-primary/30 hover:border-primary/50 text-sm"
              >
                {isConnecting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect MetaMask
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="institution-name" className="mb-2 block text-sm font-semibold">
                Institution Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <UserPlus size={16} />
                </div>
                <Input 
                  id="institution-name" 
                  name="name" 
                  placeholder="Enter institution name" 
                  value={institutionData.name}
                  onChange={(e) => handleInputChange(e, "institution")}
                  required
                  className="h-11 pl-10 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="institution-website" className="mb-2 block text-sm font-semibold">
                Website <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <UserPlus size={16} />
                </div>
                <Input 
                  id="institution-website" 
                  name="website" 
                  type="url"
                  placeholder="Enter website URL" 
                  value={institutionData.website}
                  onChange={(e) => handleInputChange(e, "institution")}
                  required
                  className="h-11 pl-10 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="institution-location" className="mb-2 block text-sm font-semibold">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <UserPlus size={16} />
                </div>
                <Input 
                  id="institution-location" 
                  name="location" 
                  placeholder="Enter location" 
                  value={institutionData.location}
                  onChange={(e) => handleInputChange(e, "institution")}
                  required
                  className="h-11 pl-10 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full font-semibold h-11 text-sm mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200" 
            disabled={loading || !walletConnected}
          >
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "REGISTER"
            )}
          </Button>
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-primary hover:underline text-sm font-medium">
              Already have an account? Login
            </Link>
          </div>
        </form>
      );
    } else {
      return (
        <form onSubmit={handleCompanySubmit} className="space-y-4">
          {/* Wallet Connection Section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <Label className="text-sm font-semibold">Wallet Connection</Label>
              </div>
              {walletConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-0.5 text-xs">
                  Connected
                </Badge>
              )}
            </div>
            {walletConnected ? (
              <div className="text-xs text-muted-foreground bg-background p-2 rounded-lg">
                <p className="font-medium">Connected: {walletAddress}</p>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full h-10 bg-background hover:bg-background/80 border-primary/30 hover:border-primary/50 text-sm"
              >
                {isConnecting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect MetaMask
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name" className="mb-2 block text-sm font-semibold">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <UserPlus size={16} />
                </div>
                <Input 
                  id="company-name" 
                  name="name" 
                  placeholder="Enter company name" 
                  value={companyData.name}
                  onChange={(e) => handleInputChange(e, "company")}
                  required
                  className="h-11 pl-10 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company-website" className="mb-2 block text-sm font-semibold">
                Website <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <UserPlus size={16} />
                </div>
                <Input 
                  id="company-website" 
                  name="website" 
                  type="url"
                  placeholder="Enter website URL" 
                  value={companyData.website}
                  onChange={(e) => handleInputChange(e, "company")}
                  required
                  className="h-11 pl-10 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company-address" className="mb-2 block text-sm font-semibold">
                Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <UserPlus size={16} />
                </div>
                <Input 
                  id="company-address" 
                  name="address" 
                  placeholder="Enter address" 
                  value={companyData.address}
                  onChange={(e) => handleInputChange(e, "company")}
                  required
                  className="h-11 pl-10 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company-phone" className="mb-2 block text-sm font-semibold">
                Phone <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <UserPlus size={16} />
                </div>
                <Input 
                  id="company-phone" 
                  name="phone" 
                  placeholder="Enter phone number" 
                  value={companyData.phone}
                  onChange={(e) => handleInputChange(e, "company")}
                  required
                  className="h-11 pl-10 text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full font-semibold h-11 text-sm mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200" 
            disabled={loading || !walletConnected}
          >
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "REGISTER"
            )}
          </Button>
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-primary hover:underline text-sm font-medium">
              Already have an account? Login
            </Link>
          </div>
        </form>
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-4xl shadow-2xl hover-lift border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img src="/logo.png" alt="Logo" className="h-12" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome to Hiigsi Forum</h1>
            <p className="text-muted-foreground text-sm">Choose your account type to get started</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button 
              className={`relative p-4 rounded-lg transition-all duration-300 font-medium text-sm ${
                activeTab === "student" 
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md scale-105" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105 border-2 border-transparent hover:border-primary/20"
              }`}
              onClick={() => setActiveTab("student")}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${activeTab === "student" ? "bg-primary-foreground/20" : "bg-muted"}`}>
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span>Graduate</span>
              </div>
            </button>
            <button 
              className={`relative p-4 rounded-lg transition-all duration-300 font-medium text-sm ${
                activeTab === "institution" 
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md scale-105" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105 border-2 border-transparent hover:border-primary/20"
              }`}
              onClick={() => setActiveTab("institution")}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${activeTab === "institution" ? "bg-primary-foreground/20" : "bg-muted"}`}>
                  <Building2 className="h-5 w-5" />
                </div>
                <span>Institution</span>
              </div>
            </button>
            <button 
              className={`relative p-4 rounded-lg transition-all duration-300 font-medium text-sm ${
                activeTab === "company" 
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md scale-105" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105 border-2 border-transparent hover:border-primary/20"
              }`}
              onClick={() => setActiveTab("company")}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${activeTab === "company" ? "bg-primary-foreground/20" : "bg-muted"}`}>
                  <Briefcase className="h-5 w-5" />
                </div>
                <span>Company</span>
              </div>
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-muted/30 to-muted/20 p-6 rounded-xl border border-muted/50">
            {renderForm()}
          </div>
          
          {/* <div className="mt-4 text-center">
            <Link to="/login" className="text-primary hover:underline text-sm font-medium">
              Already have an account? Login
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};