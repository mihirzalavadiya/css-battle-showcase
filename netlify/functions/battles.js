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
  const pathParts = path.split('/').filter(Boolean);
  // Find 'battles' in the path, and get the id if present
  const battlesIndex = pathParts.findIndex((p) => p === 'battles');
  const resource = pathParts[battlesIndex];
  const id = pathParts[battlesIndex + 1];

  // Only handle battles resource
  if (resource !== 'battles') {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
    };
  }

  try {
    switch (httpMethod) {
      case 'GET':
        if (id) {
          const response = await axios.get(`${JSON_SERVER_URL}/battles/${id}`);
          return {
            statusCode: 200,
            body: JSON.stringify(response.data),
          };
        }
        const response = await axios.get(`${JSON_SERVER_URL}/battles`);
        return {
          statusCode: 200,
          body: JSON.stringify(response.data),
        };

      case 'POST':
        const battleData = JSON.parse(body);
        // Upload image if present
        if (battleData.image) {
          battleData.image = await uploadImage(battleData.image);
        }

        const newBattle = {
          ...battleData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };

        await axios.post(`${JSON_SERVER_URL}/battles`, newBattle);
        return {
          statusCode: 201,
          body: JSON.stringify(newBattle),
        };

      case 'PUT':
        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'ID is required' }),
          };
        }

        const updateData = JSON.parse(body);
        // Upload new image if present
        if (updateData.image) {
          updateData.image = await uploadImage(updateData.image);
        }

        const updatedBattle = {
          ...updateData,
          updatedAt: new Date().toISOString(),
        };

        await axios.put(`${JSON_SERVER_URL}/battles/${id}`, updatedBattle);
        return {
          statusCode: 200,
          body: JSON.stringify(updatedBattle),
        };

      case 'DELETE':
        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'ID is required' }),
          };
        }

        await axios.delete(`${JSON_SERVER_URL}/battles/${id}`);
        return {
          statusCode: 204,
          body: '',
        };

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
