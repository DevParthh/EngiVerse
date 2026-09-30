import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    // Note: Frontend crash na ho isliye status 200 ke sath success: false bhej rahe hain
    // Agar frontend ready hai toh status(401) use kar sakte ho
    return res.json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id) {
        // --- 1. STANDARD BEST PRACTICE ---
        // Pura object access karne ke liye (e.g., req.user.id)
        req.user = decoded;

        // --- 2. CRITICAL FIX FOR CONTROLLER ---
        // Job Controller specific 'req.userId' dhoond raha hai.
        // Agar yeh line nahi hogi, toh GET requests wapas crash hongi.
        req.userId = decoded.id;

        // --- 3. LEGACY SUPPORT ---
        // Agar koi purana controller req.body.userId use kar raha hai
        if (!req.body) req.body = {};
        req.body.userId = decoded.id;

        next();
    } else {
        return res.json({ success: false, message: "Not Authorized. Invalid Token." });
    }

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;