// API base URL
const API_URL = 'http://localhost:3001/api';

// Event bus for real-time updates
const subscribers = new Set();

// Notify all subscribers of data changes
const notifySubscribers = (battles) => {
  subscribers.forEach(callback => callback(battles));
};

// Helper to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.status === 204 ? null : response.json();
};

export const battleService = {
  // Subscribe to data changes
  subscribe: (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  // Get all battles
  async getBattles() {
    const response = await fetch(`${API_URL}/battles`);
    const battles = await handleResponse(response);
    return battles || [];
  },

  // Add a new battle
  async addBattle(battleData) {
    const response = await fetch(`${API_URL}/battles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(battleData),
    });
    
    const newBattle = await handleResponse(response);
    const battles = await this.getBattles();
    notifySubscribers(battles);
    return newBattle;
  },

  // Update an existing battle
  async updateBattle(id, battleData) {
    const response = await fetch(`${API_URL}/battles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(battleData),
    });
    
    const updatedBattle = await handleResponse(response);
    const battles = await this.getBattles();
    notifySubscribers(battles);
    return updatedBattle;
  },

  // Delete a battle
  async deleteBattle(id) {
    const response = await fetch(`${API_URL}/battles/${id}`, {
      method: 'DELETE',
    });
    
    await handleResponse(response);
    const battles = await this.getBattles();
    notifySubscribers(battles);
    return true;
  },

  // Get a single battle by ID
  async getBattleById(id) {
    const response = await fetch(`${API_URL}/battles/${id}`);
    return handleResponse(response);
  }
}; 