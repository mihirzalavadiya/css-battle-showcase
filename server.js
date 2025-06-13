const express = require('express');
const cors = require('cors');
const mockApi = require('./src/services/mockApiService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Get all battles
app.get('/api/battles', (req, res) => {
  try {
    const battles = mockApi.getBattles();
    res.json(battles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single battle
app.get('/api/battles/:id', (req, res) => {
  try {
    const battle = mockApi.getBattleById(req.params.id);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    res.json(battle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new battle
app.post('/api/battles', (req, res) => {
  try {
    const newBattle = mockApi.addBattle(req.body);
    res.status(201).json(newBattle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a battle
app.put('/api/battles/:id', (req, res) => {
  try {
    const updatedBattle = mockApi.updateBattle(req.params.id, req.body);
    res.json(updatedBattle);
  } catch (error) {
    if (error.message === 'Battle not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a battle
app.delete('/api/battles/:id', (req, res) => {
  try {
    mockApi.deleteBattle(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Battle not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
});
