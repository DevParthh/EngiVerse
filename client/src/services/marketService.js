import axios from 'axios';
import { toast } from 'react-toastify';

const getHeaders = (token) => ({ headers: { token } });

// ... fetchItems (No Change) ...
export const fetchItems = async (backendUrl, token, category = '', search = '') => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/marketplace/items?category=${category}&search=${search}`, 
      getHeaders(token)
    );
    if (response.data.success) {
      return response.data.items;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    toast.error("Failed to load items.");
    return [];
  }
};

// 🔥 UPDATED: Sends FormData instead of JSON
export const createMarketItem = async (backendUrl, token, formData) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/marketplace/create`, 
      formData, 
      {
        headers: { 
            token,
            'Content-Type': 'multipart/form-data' // Important for file upload
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Upload failed";
  }
};

// ... buyItem, addReview, deleteReview (Same as before) ...
export const buyItem = async (backendUrl, token, itemId, userId) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/marketplace/buy`, 
      { itemId, userId }, 
      getHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Transaction failed";
  }
};

export const addReview = async (backendUrl, token, reviewData) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/marketplace/review`,
      reviewData,
      getHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Review failed";
  }
};

export const deleteReview = async (backendUrl, token, itemId, userId) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/marketplace/review/delete`,
      { itemId, userId },
      getHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Delete failed";
  }
};