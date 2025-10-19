const axios = require("axios");

async function nadyaaChat(teks) {
  const apiKey = "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";

  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const data = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah Nadyaa Sucilawati, gadis lembut, baik hati, sopan, dan berbicara dengan penuh kasih sayang dalam Bahasa Indonesia.",
      },
      { role: "user", content: teks },
    ],
  };

  try {
    const res = await axios.post(url, data, { headers });
    const reply = res.data.choices[0].message.content;
    console.log("💬 Nadyaa:", reply);
    return reply;
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

// contoh penggunaan:
nadyaaChat("Halo Nadyaa, apa kabar?");
