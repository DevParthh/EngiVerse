// Filename: client/src/pages/MyTasks.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import MyTaskCard from '../components/cards/MyTaskCard';

const Spinner = () => <div className="flex justify-center items-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>;

const MyTasks = () => {
    const { backendUrl, user } = useContext(AppContent);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('created'); // 'created' or 'assigned'

    useEffect(() => {
        const fetchMyTasks = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/tasks/mytasks`);
                if (response.data.success) {
                    setTasks(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch user tasks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyTasks();
    }, [backendUrl]);

    const createdTasks = tasks.filter(task => task.user?._id === user?._id);
    const assignedTasks = tasks.filter(task => task.assignedTo?._id === user?._id);

    const renderTasks = (taskList, role) => {
        if (taskList.length === 0) {
            return <p className="text-gray-500 mt-4">No tasks in this category.</p>;
        }
        return (
            <div className="space-y-4 mt-4">
                {taskList.map(task => <MyTaskCard key={task._id} task={task} role={role} />)}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar theme="light" />
            <div className="container mx-auto max-w-4xl pt-24 sm:pt-28 p-4 sm:p-6">
                <Link to="/skill-exchange" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 group">
                    <ArrowLeftIcon />
                    <span className="font-semibold group-hover:underline">Back to Skill Exchange</span>
                </Link>

                <h1 className="text-3xl font-bold text-gray-900">My Task Workspace</h1>

                <div className="border-b border-gray-200 mt-6">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            onClick={() => setActiveTab('created')}
                            className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'created' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Tasks I've Created ({createdTasks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('assigned')}
                            className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'assigned' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Tasks I'm Working On ({assignedTasks.length})
                        </button>
                    </nav>
                </div>

                <div className="mt-6">
                    {loading ? (
                        <Spinner />
                    ) : (
                        activeTab === 'created' ? renderTasks(createdTasks, 'owner') : renderTasks(assignedTasks, 'helper')
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTasks;