const mongoose = require("mongoose");

// Adım (Step) Şeması
const stepSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  }
});

// Soru (Question) Şeması
const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  gif: {
    type: String,
    required: true
  },
  correctCode: {
    type: [String], // Birden fazla doğru cevap desteklenir
    required: true
  },
  steps: [stepSchema]
});

// Ders (Lesson) Şeması
const lessonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  questions: [questionSchema]
});

module.exports = mongoose.model("Lesson", lessonSchema);
