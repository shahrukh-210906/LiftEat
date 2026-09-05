import axios from 'axios';
import { auth } from './firebase';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 120000 });
api.interceptors.request.use(async config => {
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
