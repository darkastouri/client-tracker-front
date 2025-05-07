// Get auth token from local storage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Set auth token in local storage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

// Remove auth token from local storage
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// Create auth header with JWT token
export const authHeader = (): Record<string, string> => {
  const token = getToken();
  
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  
  return {};
}; 