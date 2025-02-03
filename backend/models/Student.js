const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true }, // Kullanıcı adı
    fullname: { type: String, required: true }, // Ad Soyad
    email: { type: String, required: true, unique: true }, // E-posta (benzersiz)
    password: { type: String, required: true }, // Şifre
    role: {
      type: String,
      default: "student",
      enum: ["student", "teacher", "schoolDirector", "admin"], // Daha anlaşılır rol isimleri
    },
    avatar: { type: String }, // Otomatik oluşturulacak profil resmi
    badge: { type: String }, // Başarı rozeti
    gif: { type: String }, // Profil GIF'i

    // Öğrencinin ilerleme durumu
    currentProgress: [
      {
        educationId: { type: mongoose.Schema.Types.ObjectId, ref: "Education" }, // Eğitim ID'si
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }, // Ders ID'si
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" }, // Son çözülen soru ID'si
      },
    ],
  },
  { timestamps: true }
);

// 📌 **Pre-save middleware: Kullanıcının baş harflerinden avatar URL'si oluşturur**
studentSchema.pre("save", function (next) {
  if (!this.avatar && this.fullname) {
    const initials = this.fullname
      .split(" ") // İsmi boşluklardan ayır
      .map((n) => n[0]) // Her kelimenin ilk harfini al
      .join("") // Birleştir
      .toUpperCase(); // Büyük harf yap

    this.avatar = `https://ui-avatars.com/api/?name=${initials}&background=random&color=ffffff&bold=true`;
  }
  next(); 
});

module.exports = mongoose.model("Student", studentSchema);
