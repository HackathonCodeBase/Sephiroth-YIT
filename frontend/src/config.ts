const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Dynamically use the current hostname (e.g., 10.239.23.158 or localhost)
    // and assume the backend is on port 8000 on the same host
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || getBaseUrl();
