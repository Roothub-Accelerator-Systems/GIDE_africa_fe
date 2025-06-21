import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "../Shared/Button";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ForgotPassword from "./ForgotPassword";
import ApiService from "../Auth/ApiService";

const LoginForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear errors and success message when user starts typing
    if (errors[name] || successMessage) {
      setErrors({
        ...errors,
        [name]: "",
        general: ""
      });
      setSuccessMessage("");
      setShowSuccessMessage(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Please input existing email for verification";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "", general: "" };
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
      valid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({ email: "", password: "", general: "" });
    setSuccessMessage(""); // Clear any existing success message
    setShowSuccessMessage(false);
    
    try {
      console.log('Attempting login with:', { email: formData.email, password: '[HIDDEN]' });
      
      // Use ApiService for login
      const response = await ApiService.login({
        email: formData.email,
        password: formData.password
      });
      
      console.log("Full login response:", response);
      
      const userData = response.data || response;
      
      if (response) {
        console.log('Login successful');
        
        // Store user data if needed
        if (userData.user) {
          localStorage.setItem('userData', JSON.stringify(userData.user));
          console.log('User data stored:', userData.user);
        }
        
        // Call the onSubmit prop function if provided
        if (onSubmit) {
          onSubmit({ 
            ...formData, 
            user: userData.user 
          });
        }
        
        console.log("Login completed successfully");
        
      } else {
        console.error('No response received:', response);
        throw new Error('Login failed: No response received');
      }
      
    } catch (error) {
      console.error("Login error:", error);
      console.log('Exact error message:', error.message); // Debug log
      
      // Handle specific error cases - check for the actual error messages your API returns
      if (error.message.includes('Invalid email or password') || 
          error.message.includes('Invalid credentials') ||
          error.message.includes('Incorrect email or password')) {
        setErrors({
          ...errors,
          general: "Invalid email or password. Please try again."
        });
      } else if (error.message.includes('Email not found') || 
                 error.message.includes('User not found')) {
        setErrors({
          ...errors,
          email: "No account found with this email address."
        });
      } else if (error.message.includes('Network error') || 
                 error.message.includes('Unable to connect')) {
        setErrors({
          ...errors,
          general: "Network error. Please check your connection and try again."
        });
      } else if (error.message.includes('fetch')) {
        setErrors({
          ...errors,
          general: "Connection error. Please check your internet connection."
        });
      } else if (error.message.includes('Authentication expired') ||
                 error.message.includes('Authentication required')) {
        // This shouldn't happen during login, but if it does, it's likely a server issue
        setErrors({
          ...errors,
          general: "Server authentication error. Please try again."
        });  
      } else {
        // For any other errors, show the actual error message instead of generic message
        setErrors({
          ...errors,
          general: error.message || "Login failed. Please try again later."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordClick = async (e) => {
    e.preventDefault();
    
    // Validate email first
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({
        ...errors,
        email: emailError
      });
      return; // Don't proceed if email is invalid or empty
    }

    // Check if email exists in database using the new endpoint
    setIsForgotPasswordLoading(true);
    try {
      // Call the new check-email endpoint
      const response = await ApiService.checkEmailExists(formData.email);
      
      console.log('Email check response:', response);
      
      // Check if email exists based on the response
      if (response.exists === true) {
        // Email exists, proceed to forgot password flow
        setShowForgotPassword(true);
        setErrors({ email: "", password: "", general: "" }); // Clear any existing errors
        setSuccessMessage(""); // Clear any existing success message
        setShowSuccessMessage(false);
      } else {
        // Email doesn't exist
        setErrors({
          ...errors,
          email: "This account does not exist"
        });
      }
      
    } catch (error) {
      console.error("Email check failed:", error);
      
      // Handle API errors
      setErrors({
        ...errors,
        general: "Unable to verify email. Please try again later."
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleForgotPasswordBack = () => {
    setShowForgotPassword(false);
  };

  const handleForgotPasswordSuccess = (data) => {
    console.log("Password changed successfully:", data);
    setSuccessMessage("Password changed successfully! Please log in with your new password.");
    setShowSuccessMessage(true);
    setShowForgotPassword(false);
    // Clear the password field for security
    setFormData({
      ...formData,
      password: ""
    });
  };

  // Handle success message fade out
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        // Clear the message after fade out completes
        setTimeout(() => {
          setSuccessMessage("");
        }, 300); // Wait for fade transition to complete
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  if (showForgotPassword) {
    return (
      <ForgotPassword 
        email={formData.email}
        onBack={handleForgotPasswordBack}
        onSuccess={handleForgotPasswordSuccess}
      />
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {/* Success message */}
      {successMessage && (
        <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 transition-opacity duration-300 ${
          showSuccessMessage ? 'opacity-100' : 'opacity-0'
        }`}>
          <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
        </div>
      )}

      {/* General error message */}
      {errors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      <div className="space-y-4 rounded-md">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => isSubmitted && validateForm()}
            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
              errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => isSubmitted && validateForm()}
              className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white pr-10`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              onClick={togglePasswordVisibility}
              tabIndex="-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            disabled={isForgotPasswordLoading}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isForgotPasswordLoading ? (
              <>
                <LoadingSpinner size="small" color="blue" />
                <span className="ml-2">Verifying...</span>
              </>
            ) : (
              "Forgot your password?"
            )}
          </button>
        </div>
      </div>

      <div>
        <Button 
          type="submit" 
          fullWidth={true}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <LoadingSpinner size="small" color="white" />
              <span className="ml-2">Signing in...</span>
            </div>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;