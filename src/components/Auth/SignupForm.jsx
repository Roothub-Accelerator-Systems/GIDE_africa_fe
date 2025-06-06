import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import Button from "../Shared/Button";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ApiService from "../Auth/ApiService";
import { useNavigate } from "react-router-dom";

const SignupForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: "",
    general: ""
  });
  
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreeTerms: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Password strength indicator function
  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { label: 'Weak', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-200 dark:bg-red-900' };
    if (strength <= 3) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-200 dark:bg-yellow-900' };
    if (strength <= 4) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-200 dark:bg-blue-900' };
    return { label: 'Strong', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-200 dark:bg-green-900' };
  };

  const validate = (name, value) => {
    let errorMessage = "";
    
    switch (name) {
      case "fullName":
        if (!value.trim()) {
          errorMessage = "Full name is required";
        }
        break;
        
      case "email":
        if (!value.trim()) {
          errorMessage = "Email address is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errorMessage = "Please enter a valid email address";
        }
        break;
        
      case "password":
        if (!value.trim()) {
          errorMessage = "Password is required";
        } else if (value.length < 8) {
          errorMessage = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errorMessage = "Password must contain uppercase, lowercase, and number";
        }
        break;
        
      case "confirmPassword":
        if (!value.trim()) {
          errorMessage = "Please confirm your password";
        } else if (value !== formData.password) {
          errorMessage = "Passwords do not match";
        }
        break;
        
      case "agreeTerms":
        if (!value) {
          errorMessage = "You must agree to the terms and conditions";
        }
        break;
        
      default:
        break;
    }
    
    return errorMessage;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue,
    });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
        general: ""
      });
    }
    
    // Validate on change if the field has been touched
    if (touched[name]) {
      setErrors({
        ...errors,
        [name]: validate(name, newValue),
      });
    }
  };
  
  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setTouched({
      ...touched,
      [name]: true,
    });
    
    setErrors({
      ...errors,
      [name]: validate(name, newValue),
    });
  };

  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  const validateForm = () => {
    const newErrors = { general: "" };
    let isValid = true;
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'general') {
        const errorMessage = validate(key, formData[key]);
        newErrors[key] = errorMessage;
        
        if (errorMessage) {
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    
    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({ fullName: "", email: "", password: "", confirmPassword: "", agreeTerms: "", general: "" });
    
    try {
      // Step 1: Register the user
      const registrationData = await ApiService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      console.log("Registration successful:");
      
      // Step 2: Automatically log in the user after successful registration
      const loginData = await ApiService.login({
        email: formData.email,
        password: formData.password
      });
      
      console.log("Auto-login successful:");
      
      // Step 3: Store the auth token
      if (loginData.access_token) {
        localStorage.setItem('authToken', loginData.access_token);
        console.log('Auth token stored after signup:', loginData.access_token);
      }
      
      // Step 4: Call the onSubmit prop function if provided
      if (onSubmit) {
        onSubmit({
          fullName: formData.fullName,
          email: formData.email,
          registrationData: registrationData,
          loginData: loginData,
          authToken: loginData.access_token
        });
      }
      
      // Step 5: Redirect to dashboard instead of login
      console.log('Redirecting to dashboard after successful signup and login');
      navigate('/dashboard');
      
    } catch (error) {
      console.error("Signup process error:", error);
      
      // Handle specific error cases
      if (error.message.includes('Email already exists') || error.message.includes('Email already registered')) {
        setErrors({
          ...errors,
          email: "An account with this email already exists."
        });
      } else if (error.message.includes('Invalid email')) {
        setErrors({
          ...errors,
          email: "Please enter a valid email address."
        });
      } else if (error.message.includes('Password too weak')) {
        setErrors({
          ...errors,
          password: "Password does not meet security requirements."
        });
      } else if (error.message.includes('Full name') || error.message.includes('Name')) {
        setErrors({
          ...errors,
          fullName: "Please enter a valid full name."
        });
      } else if (error.message.includes('Invalid credentials')) {
        // This might happen during auto-login
        setErrors({
          ...errors,
          general: "Account created but auto-login failed. Please try logging in manually."
        });
        // Still redirect to login in this case
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setErrors({
          ...errors,
          general: "Account creation failed. Please try again later."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

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
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${errors.fullName ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white`}
            placeholder="Full Name"
          />
          {errors.fullName && touched.fullName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
          )}
        </div>
        
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
            onBlur={handleBlur}
            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white`}
            placeholder="your@email.com"
          />
          {errors.email && touched.email && (
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
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white pr-10`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              onClick={togglePasswordVisibility}
              tabIndex="-1"
              aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
            >
              {showPasswords ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && passwordStrength && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-200 ${passwordStrength.bg}`}
                    style={{ width: `${(passwordStrength.label === 'Weak' ? 20 : 
                                      passwordStrength.label === 'Fair' ? 40 : 
                                      passwordStrength.label === 'Good' ? 70 : 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}
          
          {errors.password && touched.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
          )}
          
          {/* Password Requirements */}
          {formData.password && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Password must contain:</p>
              <ul className="mt-1 space-y-1">
                <li className={`flex items-center space-x-1 ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {formData.password.length >= 8 ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-gray-300" />}
                  <span>At least 8 characters</span>
                </li>
                <li className={`flex items-center space-x-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {/[A-Z]/.test(formData.password) ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-gray-300" />}
                  <span>One uppercase letter</span>
                </li>
                <li className={`flex items-center space-x-1 ${/[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {/[a-z]/.test(formData.password) ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-gray-300" />}
                  <span>One lowercase letter</span>
                </li>
                <li className={`flex items-center space-x-1 ${/\d/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {/\d/.test(formData.password) ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-gray-300" />}
                  <span>One number</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <div className="mt-1 relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white pr-10`}
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreeTerms"
            name="agreeTerms"
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 ${errors.agreeTerms ? "border-red-500" : "dark:border-gray-600"}`}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreeTerms" className="font-medium text-gray-700 dark:text-gray-300">
            I agree to the{" "}
            <a href="#terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Privacy Policy
            </a>
          </label>
          {errors.agreeTerms && touched.agreeTerms && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.agreeTerms}</p>
          )}
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
              <span className="ml-2">Creating account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SignupForm;