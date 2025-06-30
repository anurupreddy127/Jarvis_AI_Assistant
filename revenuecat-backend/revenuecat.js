// revenuecat.js
const axios = require('axios');

const API_BASE = 'https://api.revenuecat.com/v1';
const headers = {
  'Authorization': `Bearer ${process.env.REVENUECAT_SECRET_KEY}`,
  'Content-Type': 'application/json'
};

async function getOfferings() {
  const res = await axios.get(`${API_BASE}/offerings`, { headers });
  return res.data;
}

module.exports = {
  getOfferings,
};
