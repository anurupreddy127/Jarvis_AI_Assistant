require("dotenv").config();
const axios = require("axios");
const express = require("express");

const app = express();
const PORT = 5000;

const PROJECT_ID = "proj771af6de";
const OFFERING_ID = "ofrnga6994e55fd";

app.get("/api/offerings", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.revenuecat.com/v2/projects/proj771af6de/offerings/ofrnga6994e55fd/packages",
      {
        headers: {
          Authorization: `Bearer ${process.env.REVENUECAT_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ packages: response.data.items }); // 👈 match frontend expectation
  } catch (error) {
    console.error("Error fetching packages:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
