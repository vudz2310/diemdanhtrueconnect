import axios from 'axios';

// Đọc baseURL từ global (nếu có) để tránh dùng process.env trên browser
const baseURL='https://bff.trueconnect.vn/';

const TOKEN = `eyJhbGciOiJSUzI1NiIsImtpZCI6IkMzQkM5N0I2Mjg3N0UxNjlDQTA0RDY5MTg5N0NDNzFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3NjI0NTMwNTQsImV4cCI6MTc2MjQ1NjY1NCwiaXNzIjoiaHR0cHM6Ly9pZC50cnVlY29ubmVjdC52biIsImF1ZCI6IklkZW50aXR5U2VydmVyQXBpIiwiY2xpZW50X2lkIjoiYWdlbmN5X3NoYXJlIiwic3ViIjoiMDdiYjA4ZmItZjliNi00OWNlLWE5YTItMDA1NjNjZmI3YWM0IiwiYXV0aF90aW1lIjoxNzYyNDUzMDU0LCJpZHAiOiJsb2NhbCIsIm5hbWUiOiI4NDg2NTk2NzMwNSIsInJvbGUiOiJyb2xlX3VzZXIiLCJpYXQiOjE3NjI0NTMwNTQsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJyb2xlcyIsImJmZnYyIiwiZW1haWwiXX0.edx7v83kec9xhlNfSX9NmIbTq2vmKAnjmwz38AEj1QiA2eivNYFYbFLkiPmNVGKYBJtF_Xx8jWnF4j4kJ5JkHaFI0ndBq4GeI0xiclPgQu6jDicNrDdEL-T70hLaMN6LGdHJP2aMAYRIr-NtU1zPCj_QZlh_-E5lDlHXYtDuqAXRJvJm3XMaXTU1sxdsKyWCIFqNfI_w3SfQP2-RKzVRTIYW83KW-d36M7E0aYYqcZTzWrrn1Rcezf0tYJj8Iqopbj0FeG2QpbfJNClwrl9gHC5339r5uPljaYlS9F9BiGs-1E6QY0fev41aEHzNaC6M8COglgXPNbeGtjuZe3iSIA`;

// Lưu token vào localStorage nếu chạy trên browser
if (typeof window !== 'undefined' && window.localStorage) {
  localStorage.setItem('token_checkin', TOKEN);
}

const checkinAPI = axios.create({
  baseURL: `${baseURL}org/attendance/check-in`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mọi request
checkinAPI.interceptors.request.use(
  (config) => {
    // Ưu tiên lấy token từ localStorage, nếu không có thì dùng TOKEN mặc định
    const token = typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem('token_checkin') || TOKEN
      : TOKEN;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const authHeader = typeof config.headers.Authorization === 'string' 
      ? config.headers.Authorization.substring(0, 50) + '...'
      : String(config.headers.Authorization || '').substring(0, 50) + '...';
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      hasAuth: !!config.headers.Authorization,
      authHeader
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default checkinAPI;

