const express = require("express");
const router = express.Router();
const Lesson = require("../models/Lessons");
const Education = require("../models/Education");

// Lessons route'unda
router.get("/", async (req, res) => {
  try {
    const { educationId } = req.query;

    // Eğer educationId varsa ona göre filtrele
    const query = educationId ? { educationId: educationId } : {};

    const lessons = await Lesson.find(query);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Bir derse toplu soru ekle
router.post("/:id/questions/bulk", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: "Ders bulunamadı" });
    }
    console.log("Gelen data:", req.body);
    lesson.questions.push(...req.body);
    const updatedLesson = await lesson.save();
    res.status(201).json(updatedLesson);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router.put("/:id/questions/bulk", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: "Ders bulunamadı" });
    }

    console.log("Güncellenecek sorular:", req.body);

    const updatedQuestions = req.body.map((updatedQuestion) => {
      const index = lesson.questions.findIndex(
        (q) => q._id.toString() === updatedQuestion._id
      );

      if (index !== -1) {
        // Mevcut soruyu güncelle
        lesson.questions[index] = {
          ...lesson.questions[index].toObject(),
          ...updatedQuestion,
        };
      }
      return lesson.questions[index];
    });

    const updatedLesson = await lesson.save();
    res.json(updatedLesson);
  } catch (error) {
    console.error("Error updating questions:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Bir dersten toplu soru sil
router.delete("/:id/questions/bulk", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: "Ders bulunamadı" });
    }
    console.log("Gelen questionIds:", req.body.questionIds);
    console.log(
      "Mevcut sorular:",
      lesson.questions.map((q) => q._id.toString())
    );

    const { questionIds } = req.body;
    const hasMatchingQuestion = lesson.questions.some((question) =>
      questionIds.includes(question._id.toString())
    );

    if (!hasMatchingQuestion) {
      return res.status(404).json({ error: "Soru bulunamadı" });
    }

    lesson.questions = lesson.questions.filter(
      (question) => !questionIds.includes(question._id.toString())
    );
    const updatedLesson = await lesson.save();
    res.json(updatedLesson);
  } catch (error) {
    console.error("Error deleting questions:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Bir derse tek soru ekle
router.post("/:id/questions", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: "Ders bulunamadı" });
    }
    lesson.questions.push(req.body);
    const updatedLesson = await lesson.save();
    res.status(201).json(updatedLesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Bir dersten tek soru sil
router.delete("/:lessonId/questions/:questionId", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Ders bulunamadı" });
    }

    const questionIndex = lesson.questions.findIndex(
      (q) => q._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ error: "Soru bulunamadı" });
    }

    lesson.questions.splice(questionIndex, 1);
    const updatedLesson = await lesson.save();
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Bir soruyu güncelle
router.put("/:lessonId/questions/:questionId", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Ders bulunamadı" });
    }

    const questionIndex = lesson.questions.findIndex(
      (q) => q._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ error: "Soru bulunamadı" });
    }

    lesson.questions[questionIndex] = {
      ...lesson.questions[questionIndex].toObject(),
      ...req.body,
    };

    const updatedLesson = await lesson.save();
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Tüm dersleri getir
router.get("/", async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Yeni ders oluştur ve bir eğitime ekle
router.post("/", async (req, res) => {
  try {
    const { educationId, ...lessonData } = req.body;
    const newLesson = new Lesson(lessonData);
    await newLesson.save();

    if (educationId) {
      const education = await Education.findById(educationId);
      if (education) {
        education.lessons.push(newLesson._id);
        await education.save();
      }
    }

    res.status(201).json(newLesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Belirli bir dersi getir
router.get("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Ders bulunamadı" });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
