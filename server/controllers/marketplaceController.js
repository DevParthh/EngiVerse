import MarketItem from "../models/MarketItem.js";
import userModel from "../models/userModel.js";

// --- 1. CREATE ITEM (Updated for Conditional Image Logic) ---
export const createItem = async (req, res) => {
  try {
    const { title, description, price, category, userId } = req.body; 

    // 1. Check Main File (Always Required - PDF or ZIP)
    // Note: 'uploadMiddleware' uses .fields(), so files are in req.files['fieldname'] array
    if (!req.files || !req.files['file'] || req.files['file'].length === 0) {
      return res.json({ success: false, message: "Main file (PDF/ZIP) is required!" });
    }

    // 2. 🔥 Conditional Check: If Category is 'project', Cover Image is MANDATORY
    if (category === 'project') {
        if (!req.files['coverImage'] || req.files['coverImage'].length === 0) {
            return res.json({ success: false, message: "Projects must have a Cover Image/Thumbnail!" });
        }
    }

    // Extract file paths (Cloudinary returns path in object)
    const fileUrl = req.files['file'][0].path; 
    
    // Agar image upload hui hai toh uska path lo, nahi toh empty string
    const coverImageUrl = (req.files['coverImage'] && req.files['coverImage'].length > 0) 
        ? req.files['coverImage'][0].path 
        : "";

    // 3. Check Seller Verification
    const seller = await userModel.findById(userId);
    
    if (!seller) {
      return res.json({ success: false, message: "User not found" });
    }

    // Verification Check
    if (!seller.isAccountVerified) {
       return res.json({ success: false, message: "Only Verified Engineers can sell items! Please verify your email first." });
    }

    // 4. Create Item
    const newItem = new MarketItem({
      title,
      description,
      price: Number(price), // Ensure number format
      category,
      fileUrl: fileUrl,       
      coverImage: coverImageUrl, // Will be empty for Notes, URL for Projects
      seller: userId
    });

    await newItem.save();

    res.json({ success: true, message: "Item listed successfully!", item: newItem });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// --- 2. GET ALL ITEMS (With Filters) ---
export const getMarketplaceItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = {};

    // Filter by Category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search by Title (Case insensitive)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Fetch items & Populate Seller Name (excluding password)
    const items = await MarketItem.find(query)
      .populate('seller', 'name profilePicture isAccountVerified')
      .sort({ createdAt: -1 }); // Newest first

    res.json({ success: true, items });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// --- 3. BUY ITEM (Transaction Logic) ---
export const purchaseItem = async (req, res) => {
  try {
    const { itemId, userId } = req.body;

    const item = await MarketItem.findById(itemId);
    const buyer = await userModel.findById(userId);
    
    if (!item) {
        return res.json({ success: false, message: "Item not found" });
    }
    
    // Seller find karna zaroori hai paise transfer ke liye
    const seller = await userModel.findById(item.seller);

    if (!buyer || !seller) {
      return res.json({ success: false, message: "User data not found" });
    }

    // Check: Already purchased?
    if (item.purchasedBy.includes(userId) || item.seller.toString() === userId) {
      return res.json({ success: false, message: "You already own this item." });
    }

    // Check: Sufficient Balance?
    if (buyer.engiCoins < item.price) {
      return res.json({ success: false, message: "Insufficient EngiCoins!" });
    }

    // --- TRANSACTION START ---
    
    // 1. Deduct from Buyer
    buyer.engiCoins -= item.price;
    await buyer.save();

    // 2. Add to Seller
    seller.engiCoins += item.price;
    await seller.save();

    // 3. Grant Access (Add Buyer ID to Item list)
    item.purchasedBy.push(userId);
    await item.save();

    // --- TRANSACTION END ---

    res.json({ success: true, message: "Purchase successful! You can now download the file." });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// --- 4. ADD REVIEW (Robust Version) ---
export const addItemReview = async (req, res) => {
  try {
    const { itemId, userId, rating, comment } = req.body;

    const item = await MarketItem.findById(itemId);
    const user = await userModel.findById(userId);

    if (!item) {
        return res.json({ success: false, message: "Item not found" });
    }

    // Check 1: User must have purchased the item
    if (!item.purchasedBy.includes(userId)) {
      return res.json({ success: false, message: "You must buy the item to review it." });
    }

    // Check 2: User cannot review twice
    const alreadyReviewed = item.reviews.find(
        (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
        return res.json({ success: false, message: "You have already reviewed this item." });
    }

    const newReview = {
      user: userId,
      userName: user.name,
      rating: Number(rating),
      comment
    };

    item.reviews.push(newReview);

    // Recalculate Average Rating
    const totalRating = item.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    item.averageRating = totalRating / item.reviews.length;

    await item.save();

    res.json({ success: true, message: "Review added successfully!", reviews: item.reviews, averageRating: item.averageRating });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// --- 5. DELETE REVIEW ---
export const deleteItemReview = async (req, res) => {
    try {
        const { itemId, userId } = req.body;

        const item = await MarketItem.findById(itemId);

        if (!item) {
            return res.json({ success: false, message: "Item not found" });
        }

        // Check if review exists
        const reviewIndex = item.reviews.findIndex(r => r.user.toString() === userId);

        if (reviewIndex === -1) {
            return res.json({ success: false, message: "Review not found." });
        }

        // Review Remove karo
        item.reviews.splice(reviewIndex, 1);

        // Average Rating Recalculate karo
        if (item.reviews.length > 0) {
            const totalRating = item.reviews.reduce((sum, rev) => sum + rev.rating, 0);
            item.averageRating = totalRating / item.reviews.length;
        } else {
            item.averageRating = 0; // Agar koi review nahi bacha
        }

        await item.save();

        res.json({ success: true, message: "Review deleted successfully!", reviews: item.reviews, averageRating: item.averageRating });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};