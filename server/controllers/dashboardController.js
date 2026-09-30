// Filename: server/controllers/dashboardController.js
// (Updated by your AI assistant to calculate profile completion)

import userModel from "../models/userModel.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // --- NEW LOGIC: Profile Completion Calculation ---
    const profileFields = [
      'collegeName',
      'branch',
      'graduationYear',
      'bio',
      'profilePicture',
    ];
    const totalFields = profileFields.length + 2; // +2 for skills and social links
    let completedFields = 0;

    profileFields.forEach(field => {
      if (user[field] && user[field] !== '') {
        completedFields++;
      }
    });

    // Skills ke liye special check (array empty toh nahi hai)
    if (user.skills && user.skills.length > 0) {
      completedFields++;
    }

    // Social links ke liye special check (kam se kam ek link ho)
    if (user.socialLinks && (user.socialLinks.linkedIn || user.socialLinks.github)) {
      completedFields++;
    }

    const profileCompletion = Math.round((completedFields / totalFields) * 100);
    // --- END OF NEW LOGIC ---

    // Response mein user ka data aur naya completion percentage bhejo
    return res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        profileCompletion: profileCompletion, // Yahan naya data add kiya hai
      },
    });

  } catch (error) {
    console.error("Get Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};