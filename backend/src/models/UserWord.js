import mongoose from 'mongoose';

const userWordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  word: { type: String, required: true },
  meaning: { type: String },
  explanation: { type: String },
  ipa: { type: String },
  type: { type: String }, // pos (noun, verb...)
  tags: [{ type: String }], // Chủ đề, ví dụ: "story-1", "business"
  level: { type: String, enum:['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: 'C1' },
  
  // SRS Fields (Thuật toán SuperMemo-2 cơ bản)
  interval: { type: Number, default: 0 }, // Số ngày cho lần review tiếp theo
  repetition: { type: Number, default: 0 }, // Số lần đã review đúng liên tiếp
  easeFactor: { type: Number, default: 2.5 }, // Độ khó của từ
  nextReviewDate: { type: Date, default: Date.now }, // Ngày cần ôn tập lại
}, { timestamps: true });

// Đảm bảo mỗi user chỉ lưu 1 từ 1 lần
userWordSchema.index({ userId: 1, word: 1 }, { unique: true });
export default mongoose.model('UserWord', userWordSchema);