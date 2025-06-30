// index.js
require('dotenv').config();
const express = require('express');
const { getOfferings } = require('./revenuecat');

const app = express();
const PORT = 5000;

app.get('/api/offerings', async (req, res) => {
  try {
    const offerings = await getOfferings();
    res.json(offerings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
