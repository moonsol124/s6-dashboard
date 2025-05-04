// src/services/api.js
import axios from 'axios';

// Change baseURL to point to the '/api' level of the gateway
const API_URL = 'http://localhost:3002/api'; // REMOVED /properties here

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- CRUD Functions ---

export const getAllProperties = async () => {
  try {
    // Explicitly request the '/properties' endpoint relative to the baseURL
    //const response = await apiClient.get('/properties/properties'); // CHANGED FROM '/'
    const response = await apiClient.get('http://localhost:3001/properties'); // CHANGED FROM '/'
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error; // Re-throw error for component to handle
  }
};

export const getPropertyById = async (id) => {
  try {
    // Request '/properties/:id'
    // const response = await apiClient.get(`/properties/properties/${id}`); // ADDED /properties
    const response = await apiClient.get(`http://localhost:3001/properties/${id}`); // ADDED /properties
    return response.data;
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error);
    throw error;
  }
};

export const createProperty = async (propertyData) => {
  try {
    const cleanedData = { ...propertyData };
    // ... (keep cleaning logic if needed) ...

    // Post to '/properties'
    const response = await apiClient.post('http://localhost:3001/properties', cleanedData); // ADDED /properties
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

export const updateProperty = async (id, propertyData) => {
  try {
     const cleanedData = { ...propertyData };
     // ... (keep cleaning logic if needed) ...

    // Put to '/properties/:id'
    const response = await apiClient.put(`http://localhost:3001/properties/${id}`, cleanedData); // ADDED /properties
    return response.data;
  } catch (error) {
    console.error(`Error updating property ${id}:`, error);
    throw error;
  }
};

export const deleteProperty = async (id) => {
  try {
    // Delete from '/properties/:id'
    const response = await apiClient.delete(`http://localhost:3001/properties/${id}`); // ADDED /properties
    return response.status; // Usually 204 No Content
  } catch (error) {
    console.error(`Error deleting property ${id}:`, error);
    throw error;
  }
};