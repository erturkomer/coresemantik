const express = require("express");
const router = express.Router();
const Education = require("../models/Education");
const Lesson = require("../models/Lessons");

// 📌 Tüm eğitimleri getir
router.get("/", async (req, res) => {
  try {
    const educations = await Education.find().populate("lessons");
    res.json(educations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const educations = await Education.find();
    res.json(educations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Yeni eğitim oluştur
router.post("/", async (req, res) => {
  try {
    const newEducation = new Education(req.body);
    await newEducation.save();
    res.status(201).json(newEducation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Belirli bir eğitimi getir
router.get("/:id", async (req, res) => {
  try {
    const education = await Education.findById(req.params.id).populate(
      "lessons"
    );
    if (!education) return res.status(404).json({ error: "Eğitim bulunamadı" });
    res.json(education);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
