const API_URL = 'http://localhost:3001/api';

// Event bus for real-time updates
const subscribers = new Set();

// Notify all subscribers of data changes
const notifySubscribers = (battles) => {
  console.log('Notifying subscribers with battles:', battles);
  subscribers.forEach((callback) => callback(battles));
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
    if (!response.ok) {
      throw new Error('Failed to fetch battles');
    }
    const battles = await response.json();
    notifySubscribers(battles);
    return battles;
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

    if (!response.ok) {
      throw new Error('Failed to add battle');
    }

    const newBattle = await response.json();
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

    if (!response.ok) {
      throw new Error('Failed to update battle');
    }

    const updatedBattle = await response.json();
    const battles = await this.getBattles();
    notifySubscribers(battles);
    return updatedBattle;
  },

  // Delete a battle
  async deleteBattle(id) {
    const response = await fetch(`${API_URL}/battles/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete battle');
    }

    const battles = await this.getBattles();
    notifySubscribers(battles);
    return true;
  },

  // Get a single battle by ID
  async getBattleById(id) {
    const response = await fetch(`${API_URL}/battles/${id}`);
    if (!response.ok) {
      throw new Error('Battle not found');
    }
    return response.json();
  },
};
