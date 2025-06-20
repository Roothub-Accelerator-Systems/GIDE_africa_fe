const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Ensure baseURL doesn't end with slash to avoid double slashes
    if (this.baseURL && this.baseURL.endsWith('/')) {
      this.baseURL = this.baseURL.slice(0, -1);
    }
  }

  // TOKEN MANAGEMENT METHODS
  
  // Get access token from storage
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  // Get refresh token from storage
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  // Store tokens after successful authentication
  storeTokens(accessToken, refreshToken = null) {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('authToken'); // Remove legacy token
    localStorage.removeItem('userData'); // Remove user data
  }

  // Check if token is expired (client-side check)
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      // Decode JWT payload (without verification - just to check expiration)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if we can't parse
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken || this.isTokenExpired(refreshToken)) {
        throw new Error('No valid refresh token available');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Store new access token
      this.storeTokens(data.access_token, data.refresh_token);
      
      return data.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens(); // Clear invalid tokens
      throw error;
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken() {
    let accessToken = this.getAccessToken();
    
    if (!accessToken) {
      return null; // No token available
    }

    // Check if token is expired
    if (this.isTokenExpired(accessToken)) {
      try {
        accessToken = await this.refreshAccessToken();
      } catch (error) {
        console.error('Failed to refresh expired token:', error);
        return null;
      }
    }

    console.log('Access token from storage:', this.getAccessToken());
    console.log('Is token expired:', this.isTokenExpired(this.getAccessToken()));


    return accessToken;
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getValidAccessToken();
    return !!token;
  }

async makeRequest(endpoint, options = {}) {
    // Ensure endpoint starts with slash
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    
    const url = `${this.baseURL}${endpoint}`;
    console.log('Making request to:', url);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available and not a public endpoint
    // Skip auth for public endpoints like login, register, forgot password
    const publicEndpoints = [
      '/auth/login', 
      '/auth/register', 
      '/auth/forgot', 
      '/auth/reset-password',
      '/auth/verify-code',
      '/auth/google-sign-in',
      '/auth/google-sign-up'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(ep => endpoint.startsWith(ep));
    
    // Only add authentication for protected endpoints
    if (!isPublicEndpoint) {
      try {
        const token = await this.getValidAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Authorization Header:', config.headers.Authorization);
        } else {
          // For protected endpoints, if no valid token is available, throw error
          console.warn('No valid access token available for protected endpoint:', endpoint);
          throw new Error('Authentication required. Please log in again.');
        }
      } catch (error) {
        console.error('Failed to get valid token for protected endpoint:', error);
        // Don't throw error here, let the request proceed and handle 401 from server
        // This prevents blocking legitimate requests when token refresh fails
      }
    } else {
      console.log('Public endpoint detected, skipping authentication:', endpoint);
    }

    // Log the request details for debugging
    console.log('Request config:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : null
    });

    try {
      const response = await fetch(url, config);
      
      // Log response details
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        console.log('Non-JSON response:', textData);
        // Try to parse as JSON if it looks like JSON
        try {
          data = JSON.parse(textData);
        } catch {
          data = { message: textData };
        }
      }
      
      console.log('Response data:', data);
      
      // Handle 401 Unauthorized - token might be invalid
      if (response.status === 401) {
        console.warn('Received 401 Unauthorized - clearing tokens');
        this.clearTokens();
        
        // Only throw auth error for protected endpoints
        if (!isPublicEndpoint) {
          throw new Error('Authentication expired. Please log in again.');
        } else {
          // For public endpoints, a 401 likely means invalid credentials
          throw new Error('Invalid credentials. Please check your email and password.');
        }
      }
      
      if (!response.ok) {
        // Handle error message extraction more robustly
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (data) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            // Handle FastAPI validation errors which return an array
            const errors = data.detail.map(err => {
              if (err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return err.msg || err.message || JSON.stringify(err);
            });
            errorMessage = errors.join(', ');
          } else if (typeof data.message === 'string') {
            errorMessage = data.message;
          } else if (data.detail && typeof data.detail === 'object') {
            errorMessage = JSON.stringify(data.detail);
          } else if (data.message && typeof data.message === 'object') {
            errorMessage = JSON.stringify(data.message);
          }
        }
        
        console.error('API Error Response:', { status: response.status, data, url, config });
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // EMAIL CHECK METHODS - Updated to not use auth token
  async checkEmailExists(email) {
    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      // Use the /auth/forgot endpoint to check if email exists
      const response = await this.makeRequest('/auth/forgot', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });
      
      // Check the response message to determine if email exists
      if (response && response.message) {
        // Generic message usually means email doesn't exist (security measure)
        if (response.message.includes('If a matching email address was found') || 
            response.message.includes('if a matching email')) {
          return { exists: false, message: response.message };
        }
        
        // Specific success message means email exists and code was sent
        if (response.message.includes('Password reset code sent') || 
            response.message.includes('reset code sent') ||
            response.message.includes('sent to your email')) {
          return { exists: true, message: response.message, ...response };
        }
      }
      
      // Default to assuming success means email exists
      return { exists: true, ...response };
      
    } catch (error) {
      console.error('Email check failed:', error);
      
      // If the error indicates email not found, return exists: false
      if (error.message.includes('not found') || 
          error.message.includes('User not found') ||
          error.message.includes('Email not found') ||
          error.message.includes('check your email address')) {
        return { exists: false, message: error.message };
      }
      
      // For other errors, rethrow them
      throw error;
    }
  }

  // AUTH ENDPOINTS - Updated to handle JWT tokens properly
  async register(userData) {
    try {
      // Validate input data
      if (!userData) {
        throw new Error('User data is required');
      }
      
      if (!userData.fullName || !userData.fullName.trim()) {
        throw new Error('Full name is required');
      }
      
      if (!userData.email || !userData.email.trim()) {
        throw new Error('Email is required');
      }
      
      if (!userData.password || userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please provide a valid email address');
      }
      
      const payload = {
        username: userData.fullName.trim(),
        full_name: userData.fullName.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
      };
      
      console.log('Registration payload being sent:', payload);
      
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // If registration returns tokens, store them
      if (response.access_token) {
        this.storeTokens(response.access_token, response.refresh_token);
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      // Validate input data
      if (!credentials) {
        throw new Error('Credentials are required');
      }
      
      if (!credentials.email || !credentials.email.trim()) {
        throw new Error('Email is required');
      }
      
      if (!credentials.password) {
        throw new Error('Password is required');
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        throw new Error('Please provide a valid email address');
      }
      
      const payload = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      };
      
      console.log('Login payload being sent:', { email: payload.email, password: '[HIDDEN]' });
      
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Store the JWT tokens
      const tokens = response.data || response;

      if (tokens.access_token) {
        this.storeTokens(tokens.access_token, tokens.refresh_token);
        console.log("Tokens stored successfully:", tokens.access_token);
      } else {
        console.warn("Access token missing in login response", tokens);
      }


      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async googleSignin(idToken) {
    try {
      if (!idToken) {
        throw new Error('Google ID token is required');
      }
      
      const response = await this.makeRequest('/auth/google-sign-in', {
        method: 'POST',
        body: JSON.stringify({
          id_token: idToken,
        }),
      });

      // Store the JWT tokens
      if (response.access_token) {
        this.storeTokens(response.access_token, response.refresh_token);
        console.log('Google signin tokens stored successfully');
      }
      
      return response;
    } catch (error) {
      console.error('Google signin failed:', error);
      throw error;
    }
  }

  // USER PROFILE MANAGEMENT
  async getCurrentUser() {
    try {
      console.log('Making request to fetch current user data');
      const response = await this.makeRequest('/auth/get_user_profile');
      console.log('getCurrentUser response:', response);
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  async updateUserProfile(profileData) {
    try {
      const response = await this.makeRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return response;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async logout() {
    try {
      // Call backend logout endpoint if it exists
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Backend logout failed:', error);
      // Continue with local cleanup even if backend logout fails
    } finally {
      // Clear all tokens and user data
      this.clearTokens();
    }
  }

  // PASSWORD RESET METHODS (No changes needed - these are public endpoints)
  async sendPasswordResetCode(email) {
    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please provide a valid email address');
      }
      
      const response = await this.makeRequest('/auth/forgot', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });
      
      console.log('sendPasswordResetCode response:', response);
      
      if (response && response.message) {
        if (response.message.includes('If a matching email address was found') || 
            response.message.includes('if a matching email')) {
          throw new Error('Email not found. Please check your email address or create a new account.');
        }
        
        if (response.message.includes('Password reset code sent') || 
            response.message.includes('reset code sent') ||
            response.message.includes('sent to your email')) {
          return {
            message: response.message,
            status: 'success',
            exists: true,
            ...response
          };
        }
      }
      
      return {
        message: response.message || 'Reset code sent to your email successfully',
        status: 'success',
        exists: true,
        ...response
      };
      
    } catch (error) {
      console.error('Failed to send reset email:', error);
      
      if (error.message.includes('404') || 
          error.message.includes('Email not found') || 
          error.message.includes('not found') ||
          error.message.includes('check your email address') ||
          error.message.includes('create a new account')) {
        throw new Error('Email not found. Please check your email address or create a new account.');
      } else if (error.message.includes('rate limit') || 
                 error.message.includes('too many')) {
        throw new Error('Too many reset requests. Please wait before requesting again.');
      } else if (error.message.includes('invalid email') || 
                 error.message.includes('Invalid email')) {
        throw new Error('Invalid email address provided');
      }
      
      throw new Error(error.message || 'Failed to send reset email. Please try again.');
    }
  }

  async verifyResetCode(email, code) {
    try {
      if (!email || !code) {
        throw new Error('Email and verification code are required');
      }

      if (code.length !== 6) {
        throw new Error('Verification code must be 6 digits');
      }
      
      const response = await this.makeRequest('/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code,
        }),
      });
      
      return {
        message: response.message || 'Code verified successfully',
        status: 'success',
        ...response
      };
      
    } catch (error) {
      console.error('Code verification failed:', error);
      
      if (error.message.includes('Invalid or expired reset code')) {
        throw new Error('Invalid or expired verification code. Please request a new code.');
      } else if (error.message.includes('User not found')) {
        throw new Error('User account not found. Please check your email address.');
      } else if (error.message.includes('Code expired')) {
        throw new Error('Verification code has expired. Please request a new code.');
      }
      
      throw error;
    }
  }

  async resetPassword(email, code, newPassword) {
    try {
      if (!email || !code || !newPassword) {
        throw new Error('Email, verification code, and new password are required');
      }
      
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      const response = await this.makeRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code,
          new_password: newPassword,
        }),
      });
      
      return {
        message: response.message || 'Password updated successfully',
        status: 'success',
        ...response
      };
      
    } catch (error) {
      console.error('Password reset failed:', error);
      
      if (error.message.includes('Invalid or expired reset code')) {
        throw new Error('Invalid or expired verification code. Please request a new code.');
      } else if (error.message.includes('User not found')) {
        throw new Error('User account not found. Please check your email address.');
      } else if (error.message.includes('password update failed') || error.message.includes('Password update failed')) {
        throw new Error('Failed to update password. Please try again.');
      }
      
      throw error;
    }
  }

  // USER PROFILE ENDPOINTS
  async getUserProfile() {
    return this.makeRequest('/users/profile');
  }

  // COVER LETTER ENDPOINTS (All require authentication)
  async generateCoverLetter(coverLetterData) {
    try {
      if (!coverLetterData) {
        throw new Error('Cover letter data is required');
      }

      const payload = {
        full_name: coverLetterData.fullName?.trim(),
        job_title: coverLetterData.jobTitle?.trim(),
        company_name: coverLetterData.companyName?.trim(),
        key_qualifications: coverLetterData.keyPoints?.trim(),
        job_description_url: coverLetterData.jobDescriptionUrl || null,
      };

      console.log('Generate cover letter payload:', payload);

      const response = await this.makeRequest('/cover/cover-letter', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response;
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
      throw error;
    }
  }

  async saveCoverLetter(coverLetterData) {
    try {
      if (!coverLetterData) {
        throw new Error('Cover letter data is required');
      }

      const payload = {
        full_name: coverLetterData.fullName?.trim(),
        job_title: coverLetterData.jobTitle?.trim(),
        company_name: coverLetterData.companyName?.trim(),
        key_qualifications: coverLetterData.keyPoints?.trim(),
      };

      console.log('Save cover letter payload:', payload);

      const response = await this.makeRequest('/cover/cover-letter', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response;
    } catch (error) {
      console.error('Failed to save cover letter:', error);
      throw error;
    }
  }

  async getCoverLetters() {
    try {
      const response = await this.makeRequest(`/cover/cover-letter`);
      return response;
    } catch (error) {
      console.error('Failed to get cover letters:', error);
      throw error;
    }
  }

}

export default new ApiService();