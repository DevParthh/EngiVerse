import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Layouts ---
import CommunityLayout from "./components/ui/CommunityLayout";
import ProtectedRoute from "./components/ui/ProtectedRoute";

// --- Public Pages ---
import Home from "./pages/home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import ResumeView from "./pages/ResumeView"; 

// --- Core Pages ---
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Jobs from "./pages/Jobs";
import SavedJobs from "./pages/SavedJobs";
import NotificationsPage from "./pages/NotificationsPage"; // [NEW] Notification Route

// --- Community Features ---
import SkillExchange from "./pages/SkillExchange";
import TaskDetail from "./pages/TaskDetail";
import CreateTask from "./pages/CreateTask";
import Friends from "./pages/Friends";
import MessagesPage from "./pages/MessagesPage";
import MyTasks from "./pages/MyTasks";
import Leaderboard from "./pages/Leaderboard";
import Explore from './pages/Explore';

// --- AI Interview ---
import AIInterviewDashboard from "./pages/AIInterviewDashboard";
import AIInterviewPage from "./pages/AIInterviewPage";
import InterviewReport from './pages/InterviewReport';

// --- Resume Builder ---
import ResumeDashboard from "./pages/ResumeDashboard";
import ResumeBuilder from "./pages/ResumeBuilder"; 

// --- Whiteboard & Marketplace ---
import BoardLobby from "./pages/BoardLobby";
import WhiteboardRoom from "./pages/WhiteboardRoom";
import EngiMart from './pages/EngiMart';

const App = () => {
  return (
    <div className="relative w-full min-h-screen font-sans text-slate-900">
      
      {/* Toast Notification Container */}
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      
      <div className="relative z-10">
        <Routes>
          
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/resume/view/:resumeId" element={<ResumeView />} />

          {/* ================= PROTECTED ROUTES ================= */}
          <Route element={<ProtectedRoute />}>
            
            {/* Core Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<NotificationsPage />} /> {/* New Route */}

            {/* Profile & Jobs */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />

            {/* Resume Builder Module */}
            <Route path="/resume-dashboard" element={<ResumeDashboard />} />
            <Route path="/resume/builder/:resumeId" element={<ResumeBuilder />} />
            {/* Redirects for safety */}
            <Route path="/resume" element={<Navigate to="/resume-dashboard" replace />} />
            <Route path="/resume/builder" element={<Navigate to="/resume-dashboard" replace />} />

            {/* AI Interview Module */}
            <Route path="/ai-interviewer" element={<AIInterviewDashboard />} />
            <Route path="/practice-interviews" element={<AIInterviewPage />} />
            <Route path="/interviews/report/:sessionId" element={<InterviewReport />} />

            {/* Collaboration Tools */}
            <Route path="/whiteboard" element={<BoardLobby />} />
            <Route path="/whiteboard/:roomId" element={<WhiteboardRoom />} />
            <Route path="/engimart" element={<EngiMart />} />

            {/* Community Section (Nested Layout) */}
            <Route path="/community" element={<CommunityLayout />}>
              <Route path="skill-exchange" element={<SkillExchange />} />
              <Route path="tasks/:taskId" element={<TaskDetail />} />
              <Route path="create-task" element={<CreateTask />} />
              <Route path="my-tasks" element={<MyTasks />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="explore" element={<Explore />} />
              <Route path="friends" element={<Friends />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="messages/:recipientId" element={<MessagesPage />} />
            </Route>

            {/* Legacy Redirects (To prevent 404s) */}
            <Route path="/skill-exchange" element={<Navigate to="/community/skill-exchange" replace />} />
            <Route path="/leaderboard" element={<Navigate to="/community/leaderboard" replace />} />
            <Route path="/explore" element={<Navigate to="/community/explore" replace />} />
            <Route path="/friends" element={<Navigate to="/community/friends" replace />} />
            <Route path="/messages" element={<Navigate to="/community/messages" replace />} />

          </Route>

        </Routes>
      </div>
    </div>
  );
};

export default App;