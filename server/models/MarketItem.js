import mongoose from "mongoose";

// Chota Schema sirf Reviews ke liye (Isi file me rahega)
const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userName: { type: String, required: true }, // Name yahi save kar lenge taaki fast load ho
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const marketItemSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  category: {
    type: String,
    enum: ['notes', 'project', 'template', 'cheatsheet', 'dataset', 'design', 'other'], // Categories update kar di
    default: 'notes'
  },
  
  // 🔥 NEW FIELD: Cover Image (Optional - Required only for Projects via Controller logic)
  coverImage: {
    type: String,
    required: false 
  },

  fileUrl: { 
    type: String, 
    required: true 
  },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  purchasedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Reviews Section
  reviews: [reviewSchema], 
  
  // Average Rating (0 to 5)
  averageRating: {
    type: Number,
    default: 0
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const MarketItem = mongoose.model("MarketItem", marketItemSchema);

export default MarketItem;