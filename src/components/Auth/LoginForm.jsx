import { useState } from "react";
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
        general: ""
      });
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
    
    try {
      // Use ApiService for login
      const data = await ApiService.login({
        email: formData.email,
        password: formData.password
      });
      
      // Store the auth token
      if (data.access_token) {
        localStorage.setItem('authToken', data.access_token);
        console.log('Auth token stored:', data.access_token);
      }
      
      // Store user data if available
      if (data.user) {
        console.log('User data:', data.user);
      }
      
      console.log("Login successful:", data);
      
      // Call the onSubmit prop function if provided
      if (onSubmit) {
        onSubmit({ ...formData, authToken: data.access_token });
      }
      
      // In a real app, you would navigate to dashboard here
      // alert('Login successful! Redirecting to dashboard...');
      
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid credentials')) {
        setErrors({
          ...errors,
          general: "Invalid email or password. Please try again."
        });
      } else if (error.message.includes('Email not found')) {
        setErrors({
          ...errors,
          email: "No account found with this email address."
        });
      } else {
        setErrors({
          ...errors,
          general: "Login failed. Please try again later."
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

    // Check if email exists in database
    setIsForgotPasswordLoading(true);
    try {
      // Call API to check if email exists
      await ApiService.checkEmailExistsPost(formData.email);
      
      // If we reach here, email exists, proceed to forgot password flow
      setShowForgotPassword(true);
      setErrors({ email: "", password: "", general: "" }); // Clear any existing errors
      
    } catch (error) {
      console.error("Email check failed:", error);
      
      // Handle different error cases
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        setErrors({
          ...errors,
          email: "This account does not exist"
        });
      } else {
        setErrors({
          ...errors,
          general: "Unable to verify email. Please try again later."
        });
      }
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleForgotPasswordBack = () => {
    setShowForgotPassword(false);
  };

  const handleForgotPasswordSuccess = (data) => {
    console.log("Password changed successfully:", data);
    alert("Password changed successfully! Please log in with your new password.");
    setShowForgotPassword(false);
  };

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