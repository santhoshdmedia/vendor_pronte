import axios from "axios";
import { EnvHelper } from "../../EnvHelper";

const baseURL = EnvHelper.BASE_API_URL;
const UPLOAD_BASE_URL = EnvHelper.BASE_API_URL;

const custom_request = axios.create();

// Add token to requests
custom_request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
custom_request.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);



export const uploadImage = async (formdata) =>
  await custom_request.post(`${UPLOAD_BASE_URL}/upload_images`, formdata);

// Auth APIs
export const loginUser = async (credentials) => {
  return await custom_request.post(`${baseURL}/vendor/Vendor_Login`, credentials);
};

export const getCurrentUser = async (id) => {
  return await custom_request.get(`${baseURL}/vendor/get_single_vendor/${id}`);
};
export const registerUser = async (userData) => {
  return await custom_request.post(`${baseURL}/vendor_user/vendor-register`, userData);
};


// Product APIs
export const getProducts = async () => {
  return await custom_request.get(`${baseURL}/product/get_product`);
};


export const getSingleProduct = async (id) => {
  return await custom_request.get(`${baseURL}/product/get_product/${id}`);
};

export const addProduct = async (formData) => {
  return await custom_request.post(`${baseURL}/product/add_product`, formData);
};

export const updateProduct = async (id, formData) => {
  return await custom_request.put(`${baseURL}/vendor_products/${id}`, formData);
};

export const deleteProduct = async (id) => {
  return await custom_request.delete(`${baseURL}/vendor_products/products/${id}`);
};

export const updateProductStatus = async (id) => {
  return await custom_request.patch(`${baseURL}/vendor_products/${id}/status`);
};

// Order APIs
export const getOrders = async (params = {}) => {
  return await custom_request.get(`${baseURL}/orders`, { params });
};
export const collectallorders = async (query) =>
  await custom_request.get(`${baseURL}/order/collect_all_orders/${query}`);

export const getOrder = async (id) => {
  return await custom_request.get(`${baseURL}/orders/${id}`);
};

export const updateOrderStatus = async (id, statusData) => {
  return await custom_request.patch(`${baseURL}/orders/${id}/status`, statusData);
};

export const getOrderStats = async (period = 'today') => {
  return await custom_request.get(`${baseURL}/orders/stats/overview?period=${period}`);
};

// Dashboard APIs
export const getDashboardData = async () => {
  return await custom_request.get(`${baseURL}/dashboard`);
};

// User/Profile APIs - CORRECTED ENDPOINTS
export const getUserProfile = async () => {
  return await custom_request.get(`${baseURL}/vendor_settings/profile`);
};

export const updateUserProfile = async (id,userData) => {
  return await custom_request.put(`${baseURL}/vendor/edit_vendor/${id}`, userData);
};

export const updateUserProfileImage = async (formData) => {
  return await custom_request.put(`${baseURL}/vendor_settings/profile-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const changePassword = async (passwordData) => {
  return await custom_request.put(`${baseURL}/vendor_settings/change-password`, passwordData);
};

export const deleteAccount = async () => {
  return await custom_request.delete(`${baseURL}/vendor_settings/account`);
};

export default custom_request;
