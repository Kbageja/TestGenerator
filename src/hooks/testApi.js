
import API from '../services/api';

export const fetchTestById = async (id, token) => {
  const response = await API.get('/api/tests/getTests', {
    params: { id }, // appends ?id=your_id
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const fetchResultById = async (id, token) => {
  const response = await API.get('/api/tests/getResult', {
    params: { id }, // appends ?id=your_id
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const fetchMyTest = async (id, token) => {
  const response = await API.get('/api/tests/getMyTest', {
    params: { id }, // appends ?id=your_id
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const fetchPublicTests = async (id, token) => {
  const response = await API.get('/api/tests/getPublicTests', {
    params: { id }, // appends ?id=your_id
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const createTest = async ({ formData, token }) => {
  const res = await API.post('api/tests/create', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
export const evalTest = async ({ formData, token }) => {
  console.log('=== DEBUG: evalTest called ===');
  console.log('Token provided:', token ? 'YES' : 'NO');
  console.log('Token length:', token ? token.length : 0);
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'N/A');
  
  if (!token) {
    throw new Error('Authentication token is required');
  }

  try {
    console.log('Making API call to /api/tests/evaluate');
    console.log('FormData:', formData);
    
    const res = await API.post('/api/tests/evaluate', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API call successful:', res.data);
    return res.data;
  } catch (error) {
    console.error('=== API CALL ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request was made but no response received');
      console.error('Request details:', error.request);
    }
    
    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error('Unauthorized: Please refresh the page and try again');
      } else if (status === 404) {
        throw new Error('Test not found');
      } else if (status === 500) {
        throw new Error('Server error: Please try again later');
      } else {
        throw new Error(data?.message || `Server error: ${status}`);
      }
    } else if (error.request) {
      throw new Error('Network error: Please check your connection');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};
export const fetchAttempted = async (id, token) => {
  console.log("insideapi")
  const response = await API.get('/api/tests/getAttempted', {
    params: { id }, // appends ?id=your_id
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
