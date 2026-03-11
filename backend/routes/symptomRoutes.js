const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/check-symptoms", async (req, res) => {
  try {
    const { text, lang } = req.body;

    const response = await axios.post(
      "http://localhost:5001/api/ask",
      {
        text: text,
        lang: lang || "en"
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "AI Service Error" });
  }
});

module.exports = router;