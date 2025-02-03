const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Student");

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET || "alertSecretJwtKey!198537";

// 📌 Tüm öğrencileri getir
router.get("/student", async (req, res) => {
  try {
    const students = await User.find().select("-password"); // Şifreyi hariç tut
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

// 📌 ID'ye göre tek öğrenci getir
router.get("/student/:id", async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Öğrenci güncelle
router.put("/student/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // Eğer şifre güncellenecekse hashle
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedStudent) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }

    res.status(200).json({
      message: "Öğrenci güncellendi",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Toplu öğrenci güncelleme
router.put("/students/bulk-update", async (req, res) => {
  try {
    const { updates } = req.body; // [{id: "", data: {}}, ...]

    const updatePromises = updates.map(async (update) => {
      const { password, ...updateData } = update.data;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      return User.findByIdAndUpdate(update.id, updateData, {
        new: true,
      }).select("-password");
    });

    const updatedStudents = await Promise.all(updatePromises);

    res.status(200).json({
      message: "Öğrenciler toplu güncellendi",
      students: updatedStudents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Öğrenci sil
router.delete("/student/:id", async (req, res) => {
  try {
    const deletedStudent = await User.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }
    res.status(200).json({ message: "Öğrenci silindi" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Toplu öğrenci silme
router.delete("/students/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body; // Silinecek öğrenci ID'leri dizisi
    const result = await User.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      message: "Öğrenciler toplu silindi",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Toplu öğrenci oluşturma
router.post("/students/bulk-create", async (req, res) => {
  try {
    const { students } = req.body; // [{username, fullname, email, password}, ...]

    const createPromises = students.map(async (student) => {
      const hashedPassword = await bcrypt.hash(student.password, 10);
      const initials = student.fullname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&color=ffffff&bold=true`;

      return new User({
        ...student,
        password: hashedPassword,
        avatar: avatarUrl,
      });
    });

    const newStudents = await Promise.all(createPromises);
    await User.insertMany(newStudents);

    res.status(201).json({
      message: "Öğrenciler toplu oluşturuldu",
      students: newStudents.map((student) => ({
        id: student._id,
        username: student.username,
        fullname: student.fullname,
        email: student.email,
        avatar: student.avatar,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mevcut register ve login route'ları...

// 📌 Kullanıcı Oluşturma İşlemi
router.post("/register", async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    // Kullanıcı zaten kayıtlı mı?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email address is already registered." });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Fullname'in baş harflerine göre avatar oluştur
    const initials = fullname
      .split(" ") // İsmi boşluklardan ayır
      .map((n) => n[0]) // Her kelimenin ilk harfini al
      .join("") // Birleştir
      .toUpperCase(); // Büyük harf yap

    const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&color=ffffff&bold=true`;

    // Yeni kullanıcı oluştur
    const newUser = new User({
      username,
      fullname,
      email,
      password: hashedPassword,
      avatar: avatarUrl, // Otomatik avatar
    });

    // MongoDB'ye kaydet
    await newUser.save();

    console.log("✅ Yeni Kullanıcı Kaydedildi:", newUser);

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu!",
      user: {
        id: newUser._id,
        username: newUser.username,
        fullname: newUser.fullname,
        email: newUser.email,
        avatar: newUser.avatar, // Avatar bilgisi
      },
    });
  } catch (error) {
    console.error("Hata:", error.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// 📌 Kullanıcı Girişi (Login)
// 📌 Kullanıcı Girişi (Login)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { fullname: identifier },
      ],
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Kullanıcı adı, e-posta veya şifre yanlış" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Kullanıcı adı, e-posta veya şifre yanlış" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: "7d",
    });

    // Token'ı response'un root seviyesinde gönder
    res.status(200).json({
      success: true,
      message: "Giriş başarılı!",
      token, // Token'ı dışarıda bırak
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Giriş Hatası:", error);
    res.status(500).json({ error: "Giriş sırasında bir hata oluştu!" });
  }
});
module.exports = router;
