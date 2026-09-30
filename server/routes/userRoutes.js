import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { 
    getUserData, 
    exploreUsers, 
    changePassword, 
    deleteAccount,
    updateUserProfile // <-- IMP: Yeh naya function import kiya hai
} from '../controllers/userController.js';

const userRouter = express.Router();

// Get User Data
userRouter.get('/data', userAuth, getUserData);

// Update User Profile (Yeh missing tha, ab add ho gaya)
userRouter.put('/update', userAuth, updateUserProfile);

// Explore Other Users
userRouter.get('/explore', userAuth, exploreUsers);

// Account Settings
userRouter.post('/change-password', userAuth, changePassword);
userRouter.delete('/delete-account', userAuth, deleteAccount);

export default userRouter;