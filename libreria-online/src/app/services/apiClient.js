// src/app/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, 
  withCredentials: true, 
});

export default apiClient;
 