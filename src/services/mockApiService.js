const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'mockDb.json');

// Helper to read the database file
const readDb = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is corrupted, return default structure
    return { battles: [] };
  }
};

// Helper to write to the database file
const writeDb = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  // Get all battles
  getBattles: () => {
    const db = readDb();
    return db.battles;
  },

  // Get a single battle by ID
  getBattleById: (id) => {
    const db = readDb();
    return db.battles.find(battle => battle.id === id);
  },

  // Add a new battle
  addBattle: (battleData) => {
    const db = readDb();
    const newBattle = {
      ...battleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    db.battles.push(newBattle);
    writeDb(db);
    return newBattle;
  },

  // Update an existing battle
  updateBattle: (id, battleData) => {
    const db = readDb();
    const index = db.battles.findIndex(battle => battle.id === id);
    
    if (index === -1) {
      throw new Error('Battle not found');
    }

    db.battles[index] = {
      ...db.battles[index],
      ...battleData,
      updatedAt: new Date().toISOString()
    };

    writeDb(db);
    return db.battles[index];
  },

  // Delete a battle
  deleteBattle: (id) => {
    const db = readDb();
    const index = db.battles.findIndex(battle => battle.id === id);
    
    if (index === -1) {
      throw new Error('Battle not found');
    }

    db.battles.splice(index, 1);
    writeDb(db);
    return true;
  }
}; 