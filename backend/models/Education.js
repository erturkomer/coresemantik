const mongoose = require("mongoose");
const educationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
  ],
});
module.exports = mongoose.model("Education", educationSchema);
