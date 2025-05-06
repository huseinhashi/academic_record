import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [currentWallet, setCurrentWallet] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Set current wallet from stored user data
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.authMethod === "wallet") {
          setCurrentWallet(userData.wallet);
        }
      }
    }
  }, []);

  // Add listener for account changes in MetaMask
  useEffect(() => {
    if (!window.ethereum || !currentWallet || !isAuthenticated) return;

    const handleAccountsChanged = async (accounts) => {
      const newWallet = accounts[0];
      
      // If wallet changed and user is logged in
      if (newWallet !== currentWallet) {
        console.log("MetaMask account changed:", newWallet);
        
        // Auto logout user when wallet changes
        logout();
      }
    };
    
    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [isAuthenticated, currentWallet]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this platform.");
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your MetaMask wallet.");
      }
      
      const walletAddress = accounts[0];
      setCurrentWallet(walletAddress);
      return walletAddress;
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      // Handle specific MetaMask errors
      if (error.code === 4001) {
        throw new Error("Connection request was rejected. Please approve connection to continue.");
      }
      throw error.message ? error : new Error("Failed to connect to MetaMask. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const registerStudent = async (userData) => {
    try {
      // Register as student
      const response = await api.post(`/auth/register/student`, userData);
      
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }
      
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      if (user.authMethod === "wallet") {
        setCurrentWallet(user.wallet);
      }
      setIsAuthenticated(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      console.error("Registration error:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const registerInstitution = async (userData) => {
    try {
      const response = await api.post(`/auth/register/institution`, userData);
      
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }
      
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      console.error("Registration error:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const registerCompany = async (userData) => {
    try {
      const response = await api.post(`/auth/register/company`, userData);
      
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }
      
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      console.error("Registration error:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithWallet = async () => {
    try {
      const walletAddress = await connectWallet();
      
      const response = await api.post("/auth/login/wallet", { wallet: walletAddress });
      
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }
      
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setCurrentWallet(user.wallet);
      setIsAuthenticated(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      console.error("Login error:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithPassword = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const response = await api.post("/auth/login/password", { 
        email, 
        password 
      });
      
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }
      
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return user;
    } catch (error) {
      console.error("Login error:", error);
      
      // Provide more specific error messages based on the response
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error("Invalid email or password");
        } else if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw new Error("Login failed. Please check your credentials and try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCurrentWallet(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isConnecting,
        currentWallet,
        registerStudent,
        registerInstitution,
        registerCompany,
        loginWithWallet,
        loginWithPassword,
        connectWallet,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};