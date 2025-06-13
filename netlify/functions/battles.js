const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// JSON Server URL
const JSON_SERVER_URL =
  process.env.JSON_SERVER_URL || 'https://json-server-css-battle.herokuapp.com';

// Helper function to upload image to Cloudinary
const uploadImage = async (imageData) => {
  if (!imageData) return null;

  try {
    const result = await cloudinary.uploader.upload(imageData, {
      folder: 'css-battle',
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  // Simplified path parsing - just get the ID if it exists
  const pathParts = path.split('/').filter(Boolean);
  const id =
    pathParts[pathParts.length - 1] === 'battles'
      ? null
      : pathParts[pathParts.length - 1];

  try {
    switch (httpMethod) {
      case 'GET':
        if (id) {
          // GET one
          const response = await axios.get(`${JSON_SERVER_URL}/battles/${id}`);
          return {
            statusCode: 200,
            body: JSON.stringify(response.data),
          };
        } else {
          // GET all
          const response = await axios.get(`${JSON_SERVER_URL}/battles`);
          return {
            statusCode: 200,
            body: JSON.stringify(response.data),
          };
        }
      case 'POST':
        if (!id) {
          // POST new battle
          const data = JSON.parse(body);
          console.log('Creating new battle with data:', data);

          // Optionally handle image upload here if needed
          const response = await axios.post(`${JSON_SERVER_URL}/battles`, data);
          return {
            statusCode: 201,
            body: JSON.stringify(response.data),
          };
        } else {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'POST to /battles/:id not allowed' }),
          };
        }
      case 'PUT':
        if (id) {
          const data = JSON.parse(body);
          console.log(`Updating battle ${id} with data:`, data);

          const response = await axios.put(
            `${JSON_SERVER_URL}/battles/${id}`,
            data
          );
          return {
            statusCode: 200,
            body: JSON.stringify(response.data),
          };
        } else {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'PUT requires an id' }),
          };
        }
      case 'DELETE':
        if (id) {
          console.log(`Deleting battle ${id}`);
          await axios.delete(`${JSON_SERVER_URL}/battles/${id}`);
          return {
            statusCode: 204,
            body: '',
          };
        } else {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'DELETE requires an id' }),
          };
        }
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage =
      error.response?.data?.message || error.message || 'Internal server error';
    const statusCode = error.response?.status || 500;

    return {
      statusCode,
      body: JSON.stringify({
        error: errorMessage,
        details: error.response?.data || null,
      }),
    };
  }
};
