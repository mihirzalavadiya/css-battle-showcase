// Event bus for real-time updates
const subscribers = new Set();

// Notify all subscribers of data changes
const notifySubscribers = (battles) => {
  subscribers.forEach((callback) => callback(battles));
};

// Helper to get battles from localStorage
const getBattlesFromStorage = () => {
  try {
    const battles = localStorage.getItem('css-battles');
    return battles ? JSON.parse(battles) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// Helper to save battles to localStorage
const saveBattlesToStorage = (battles) => {
  try {
    localStorage.setItem('css-battles', JSON.stringify(battles));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save battle data');
  }
};

export const battleService = {
  // Subscribe to data changes
  subscribe: (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  // Get all battles
  async getBattles() {
    return getBattlesFromStorage();
  },

  // Add a new battle
  async addBattle(battleData) {
    const battles = getBattlesFromStorage();
    const newBattle = {
      id: crypto.randomUUID(),
      ...battleData,
      createdAt: new Date().toISOString(),
    };

    battles.push(newBattle);
    saveBattlesToStorage(battles);
    notifySubscribers(battles);
    return newBattle;
  },

  // Update an existing battle
  async updateBattle(id, battleData) {
    const battles = getBattlesFromStorage();
    const index = battles.findIndex((b) => b.id === id);

    if (index === -1) {
      throw new Error('Battle not found');
    }

    battles[index] = {
      ...battles[index],
      ...battleData,
      updatedAt: new Date().toISOString(),
    };

    saveBattlesToStorage(battles);
    notifySubscribers(battles);
    return battles[index];
  },

  // Delete a battle
  async deleteBattle(id) {
    const battles = getBattlesFromStorage();
    const filteredBattles = battles.filter((b) => b.id !== id);

    if (filteredBattles.length === battles.length) {
      throw new Error('Battle not found');
    }

    saveBattlesToStorage(filteredBattles);
    notifySubscribers(filteredBattles);
    return true;
  },

  // Get a single battle by ID
  async getBattleById(id) {
    const battles = getBattlesFromStorage();
    const battle = battles.find((b) => b.id === id);

    if (!battle) {
      throw new Error('Battle not found');
    }

    return battle;
  },
};
