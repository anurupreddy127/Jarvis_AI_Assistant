require("dotenv").config();
const axios = require("axios");
const express = require("express");

const app = express();
const PORT = 5000;

app.get("/api/offerings", async (req, res) => {
  try {
    const response = await axios.get("https://api.revenuecat.com/v2/offerings", {
      headers: {
        Authorization: `Bearer ${process.env.REVENUECAT_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching offerings:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch offerings" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
