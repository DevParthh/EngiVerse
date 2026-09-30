import { Plus, Trash2, FolderGit2 } from 'lucide-react';
import React from 'react';

const ProjectForm = ({ data, onChange }) => {

  const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: "",
    };

    onChange([...data, newProject]);
  };

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateProject = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6 p-1">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">
            Projects
          </h3>
          <p className="text-sm text-gray-500 mt-1">Showcase your best work.</p>
        </div>

        <button
          onClick={addProject}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="size-4 group-hover:scale-110 transition-transform" />
          Add Project
        </button>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="bg-indigo-50 p-3 rounded-full mb-3">
                <FolderGit2 className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-gray-900 font-medium">No projects added yet</p>
            <p className="text-sm text-gray-500 mt-1">Add projects to demonstrate your skills.</p>
            <button 
                onClick={addProject}
                className="mt-4 text-sm text-indigo-600 font-medium hover:underline"
            >
                + Add one now
            </button>
        </div>
      ) : (
        <div className="space-y-4">
            {data.map((project, index) => (
            <div
                key={index}
                className="group relative p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >

                {/* Card Header + Remove Button */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                            {index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-700">
                            {project.name || "New Project"}
                        </h4>
                    </div>

                    <button
                        onClick={() => removeProject(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>

                {/* Inputs */}
                <div className="grid md:grid-cols-2 gap-4">

                    {/* Project Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Project Name</label>
                        <input
                            value={project.name || ""}
                            onChange={(e) => updateProject(index, "name", e.target.value)}
                            type="text"
                            placeholder="e.g. E-Commerce Platform"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Project Type / Tech Stack */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Project Type / Tech</label>
                        <input
                            value={project.type || ""}
                            onChange={(e) => updateProject(index, "type", e.target.value)}
                            type="text"
                            placeholder="e.g. Full Stack (MERN)"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Description</label>
                        <textarea
                            rows={4}
                            value={project.description || ""}
                            onChange={(e) => updateProject(index, "description", e.target.value)}
                            placeholder="Describe what you built and the impact it had..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm text-gray-800 placeholder:text-gray-400 leading-relaxed transition-all"
                        />
                    </div>

                </div>

            </div>
            ))}
        </div>
      )}

    </div>
  );
};

export default ProjectForm;