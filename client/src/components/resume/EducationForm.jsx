import React from 'react'
import { Plus, Trash2, GraduationCap } from "lucide-react";

const EducationForm = ({ data, onChange }) => {

  const addEducation = () => {
    const newEducation = {
      institution: "",
      degree: "",
      field: "",
      graduation_date: "",
      gpa: ""
    };
    onChange([...data, newEducation]);
  };

  const removeEducation = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6 p-1">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">
            Education
          </h3>
          <p className="text-sm text-gray-500 mt-1">Where did you study?</p>
        </div>

        <button
          onClick={addEducation}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="size-4 group-hover:scale-110 transition-transform" />
          Add Education
        </button>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
          <div className="bg-indigo-50 p-3 rounded-full mb-3">
             <GraduationCap className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-gray-900 font-medium">No education added yet</p>
          <p className="text-sm text-gray-500 mt-1">Showcase your academic background to recruiters.</p>
          <button 
            onClick={addEducation}
            className="mt-4 text-sm text-indigo-600 font-medium hover:underline"
          >
            + Add one now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((education, index) => (
            <div
              key={index}
              className="group relative p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              
              {/* Card Header & Remove Button */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                        {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-700">
                        {education.institution || "New School / University"}
                    </h4>
                </div>

                <button
                  onClick={() => removeEducation(index)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {/* Inputs Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Institution */}
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Institution</label>
                    <input
                    value={education.institution || ""}
                    onChange={(e) =>
                        updateEducation(index, "institution", e.target.value)
                    }
                    type="text"
                    placeholder="e.g. Stanford University"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                    />
                </div>

                {/* Degree */}
                <div>
                     <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Degree</label>
                    <input
                    value={education.degree || ""}
                    onChange={(e) =>
                        updateEducation(index, "degree", e.target.value)
                    }
                    type="text"
                    placeholder="e.g. Bachelor's, Master's"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 placeholder:text-gray-400"
                    />
                </div>

                {/* Field of Study */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Field of Study</label>
                    <input
                    value={education.field || ""}
                    onChange={(e) =>
                        updateEducation(index, "field", e.target.value)
                    }
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 placeholder:text-gray-400"
                    placeholder="e.g. Computer Science"
                    />
                </div>

                {/* Graduation Date */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Graduation Date</label>
                    <input
                    value={education.graduation_date || ""}
                    onChange={(e) =>
                        updateEducation(index, "graduation_date", e.target.value)
                    }
                    type="month"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800"
                    />
                </div>

                 {/* GPA */}
                 <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">GPA (Optional)</label>
                    <input
                    value={education.gpa || ""}
                    onChange={(e) =>
                        updateEducation(index, "gpa", e.target.value)
                    }
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 placeholder:text-gray-400"
                    placeholder="e.g. 3.8/4.0"
                    />
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EducationForm