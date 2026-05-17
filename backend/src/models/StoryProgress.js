import mongoose from 'mongoose';

const storyProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  storyId: { 
    type: String, 
    required: true // ID của story, ví dụ lấy từ file JSON: "story-1"
  },
  completedSentences:[{ 
    type: Number // Mảng chứa index của các câu đã đọc xong. VD:[0, 1, 2, 3]
  }],
  isCompleted: { 
    type: Boolean, 
    default: false // Đã đọc xong toàn bộ truyện hay chưa
  },
  lastReadAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Đảm bảo 1 user chỉ có 1 bản ghi tiến độ cho 1 story cụ thể
storyProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export default mongoose.model('StoryProgress', storyProgressSchema);