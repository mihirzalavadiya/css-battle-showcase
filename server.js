const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper functions for file operations
const readData = () => {
  try {
    const data = fs.readFileSync('db.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { battles: [] };
  }
};

const writeData = (data) => {
  fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
};

// Get all battles
app.get('/api/battles', (req, res) => {
  const data = readData();
  res.json(data.battles);
});

// Get a single battle
app.get('/api/battles/:id', (req, res) => {
  const data = readData();
  const battle = data.battles.find((b) => b.id === req.params.id);
  if (!battle) {
    return res.status(404).json({ error: 'Battle not found' });
  }
  res.json(battle);
});

// Create a new battle
app.post('/api/battles', (req, res) => {
  const data = readData();
  const newBattle = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  data.battles.push(newBattle);
  writeData(data);
  res.status(201).json(newBattle);
});

// Update a battle
app.put('/api/battles/:id', (req, res) => {
  const data = readData();
  const index = data.battles.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Battle not found' });
  }
  data.battles[index] = {
    ...data.battles[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  res.json(data.battles[index]);
});

// Delete a battle
app.delete('/api/battles/:id', (req, res) => {
  const data = readData();
  const index = data.battles.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Battle not found' });
  }
  data.battles.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
