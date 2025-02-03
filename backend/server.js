const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("morgan");
const cors = require("cors");

dotenv.config();

const port = process.env.PORT || 5000; // Eğer .env dosyasında PORT yoksa 5000 kullan
const mongoUrl = process.env.MONGODB_URI;
const app = express();
const mainRoute = require("./routes/index.js");

// 📌 MongoDB bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB'ye başarıyla bağlandı.");
  } catch (error) {
    console.error("❌ MongoDB bağlantı hatası:", error);
    process.exit(1); // Sunucuyu kapat (bağlantı başarısızsa)
  }
};

// 📌 Middleware'ler
app.use(logger("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  })
);

// 📌 Route'ları ekle
app.use("/api", mainRoute);

// 📌 Sunucuyu başlat
app.listen(port, async () => {
  await connectDB();
  console.log(`🚀 Sunucu ${port} portunda çalışıyor...`);
});
