import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // will be proxied to backend in dev (vite proxy) or set to backend URL in production
});

export default api;
