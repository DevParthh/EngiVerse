// Filename: server/controllers/leaderboardController.js (FINAL CLEAN VERSION)

import mongoose from 'mongoose';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';

export const getLeaderboardData = async (req, res) => {
  try {
    // Query A: Top Helpers (This Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const topHelpers = await Task.aggregate([
      { $match: { status: 'completed', updatedAt: { $gte: startOfMonth } } },
      { $group: { _id: '$assignedTo', tasksCompleted: { $sum: 1 } } },
      { $sort: { tasksCompleted: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: '$userInfo._id',
          name: '$userInfo.name',
          profilePicture: '$userInfo.profilePicture',
          badges: '$userInfo.badges',
          tasksCompleted: 1
        }
      }
    ]);

    // Query B: Wealthiest Users (All-Time)
    const wealthiestUsers = await User.find({})
      .sort({ engiCoins: -1 })
      .limit(10)
      .select('name profilePicture engiCoins badges')
      .lean();

    return res.json({
      success: true,
      data: {
        topHelpers,
        wealthiestUsers
      }
    });
  } catch (err) {
    console.error("Error fetching leaderboard data:", err);
    return res.status(500).json({ success: false, message: 'Leaderboard fetch failed', error: err.message });
  }
};