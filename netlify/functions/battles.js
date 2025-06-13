const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Path to the local JSON file
const DATA_FILE = path.join(__dirname, 'data', 'battles.json');

// Helper function to read battles data
const readBattles = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data).battles;
  } catch (error) {
    console.error('Error reading battles:', error);
    return [];
  }
};

// Helper function to write battles data
const writeBattles = async (battles) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify({ battles }, null, 2));
  } catch (error) {
    console.error('Error writing battles:', error);
    throw new Error('Failed to save battle data');
  }
};

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
        const battles = await readBattles();
        if (id) {
          // GET one
          const battle = battles.find((b) => b.id === id);
          if (!battle) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Battle not found' }),
            };
          }
          return {
            statusCode: 200,
            body: JSON.stringify(battle),
          };
        } else {
          // GET all
          return {
            statusCode: 200,
            body: JSON.stringify(battles),
          };
        }

      case 'POST':
        if (!id) {
          // POST new battle
          const data = JSON.parse(body);
          console.log('Creating new battle with data:', data);

          const battles = await readBattles();
          const newBattle = {
            id: uuidv4(),
            ...data,
            createdAt: new Date().toISOString(),
          };

          battles.push(newBattle);
          await writeBattles(battles);

          return {
            statusCode: 201,
            body: JSON.stringify(newBattle),
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

          const battles = await readBattles();
          const index = battles.findIndex((b) => b.id === id);

          if (index === -1) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Battle not found' }),
            };
          }

          battles[index] = {
            ...battles[index],
            ...data,
            updatedAt: new Date().toISOString(),
          };

          await writeBattles(battles);
          return {
            statusCode: 200,
            body: JSON.stringify(battles[index]),
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
          const battles = await readBattles();
          const filteredBattles = battles.filter((b) => b.id !== id);

          if (filteredBattles.length === battles.length) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Battle not found' }),
            };
          }

          await writeBattles(filteredBattles);
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
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.stack,
      }),
    };
  }
};
