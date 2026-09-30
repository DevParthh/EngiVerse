import Resume from "../models/resumeModel.js";
import imagekit from "../config/imagekit.js"; // Ensure path matches your folder structure

// --- Helper to fix ImageKit Import Issue ---
// Yeh function check karega ki upload method 'imagekit.upload' hai ya 'imagekit.files.upload'
const uploadToImageKit = async (fileBase64, fileName, transformString) => {
    const ikInstance = imagekit.default || imagekit; // Handle ESM/CommonJS import differences

    // Check where the upload function exists
    let uploadFn;
    let context;

    if (ikInstance.upload) {
        // Standard SDK structure
        uploadFn = ikInstance.upload;
        context = ikInstance;
    } else if (ikInstance.files && ikInstance.files.upload) {
        // Alternative/Older SDK structure
        uploadFn = ikInstance.files.upload;
        context = ikInstance.files;
    } else {
        throw new Error("ImageKit upload function not found. Check configuration.");
    }

    // Call the function explicitly binding the correct context
    // Using promisified call if SDK supports it, or wrapping it if needed. 
    // Most modern IK SDKs return a promise if no callback is passed.
    return uploadFn.call(context, {
        file: fileBase64,
        fileName: fileName,
        folder: 'engiverse_resumes',
        transformation: {
            pre: transformString
        }
    });
};

// --- Helper to reliably get User ID ---
const getUserId = (req) => {
    if (req.userId) return req.userId;
    if (req.user && req.user.id) return req.user.id;
    if (req.user && req.user._id) return req.user._id;
    return null;
};

// Create Blank Resume
export const createResume = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { title } = req.body;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const newResume = await Resume.create({ userId, title: title || "Untitled Resume" });

        return res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            resume: newResume
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get Resume By ID
export const getResumeById = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ userId, _id: resumeId });

        if (!resume) {
            return res.status(404).json({ success: false, message: "Resume not found" });
        }

        return res.status(200).json({ success: true, resume });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update Resume (With FIXED Image Upload Logic)
export const updateResume = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { resumeId, resumeData, removeBackground } = req.body;
        const image = req.file;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        // Parsing resumeData safely
        let resumeDataCopy = {};
        try {
            if (typeof resumeData === 'string') {
                resumeDataCopy = JSON.parse(resumeData);
            } else if (resumeData) {
                resumeDataCopy = structuredClone(resumeData);
            }
        } catch (e) {
            return res.status(400).json({ success: false, message: "Invalid JSON in resumeData" });
        }

        // Handle Image Upload using the Fixed Helper
        if (image) {
            const fileBase64 = image.buffer.toString('base64');
            const shouldRemoveBg = removeBackground === 'yes' || removeBackground === 'true';
            
            // ImageKit transformation string
            const transformString = 'w-300,h-300,fo-face,z-0.75' + (shouldRemoveBg ? ',e-bgremove,f-png' : '');

            // Using the robust helper function here
            const response = await uploadToImageKit(fileBase64, `resume-${userId}-${Date.now()}.png`, transformString);

            if (!resumeDataCopy.personal_info) resumeDataCopy.personal_info = {};
            resumeDataCopy.personal_info.image = response.url;
        }

        // If specific update (just image) or full update
        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId },
            resumeDataCopy,
            { new: true, runValidators: false } 
        );

        if (!resume) return res.status(404).json({ success: false, message: "Resume not found or unauthorized" });

        return res.status(200).json({ success: true, message: 'Saved successfully', resume });

    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

// Get User's All Resumes
export const getUserResumes = async (req, res) => {
    try {
        const userId = getUserId(req);
        const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
        return res.status(200).json({ success: true, resumes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Resume
export const deleteResume = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { resumeId } = req.params;
        await Resume.findOneAndDelete({ _id: resumeId, userId });
        return res.status(200).json({ success: true, message: "Resume deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Public View
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({ _id: resumeId, public: true });
        if (!resume) return res.status(404).json({ success: false, message: "Not found" });
        return res.status(200).json({ success: true, resume });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};