import axios from 'axios';

const API = axios.create({
  baseURL: 'https://mainwms-backend.onrender.com/api', // ต้องเป็น http:// (ไม่มี s)
});

export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);

export const getRacks = (config = {}) => API.get('/racks', config);
export const updateSlotItems = (rackId, slotKey, items) => API.put(`/racks/${rackId}/slot`, { slotKey, items });

export const getDocuments = (type, status) => {
  let url = `/documents?type=${type}`;
  if (status) url += `&status=${status}`;
  return API.get(url);
};
export const createDocument = (docData) => API.post('/documents', docData);
export const updateDocumentStatus = (id, data) => API.put(`/documents/${id}/status`, data);

export default API;