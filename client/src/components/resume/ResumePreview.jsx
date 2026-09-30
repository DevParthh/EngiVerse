import React from 'react';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import MinimalImageTemplate from './templates/MinimalImageTemplate';

// --- 1. Global Date Formatter Helper ---
// Yeh function check karega: Agar date already text hai (Jan 2022) toh wahi dikhayega.
// Agar date object hai, toh usko convert karega. "Invalid Date" error nahi aayega.
const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Agar text hai (jaise "Present" ya "Jan 2022"), toh direct return karo
    if (/[a-zA-Z]/.test(dateString)) return dateString;

    // Agar ISO date hai, toh format karo
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback to original text

    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const ResumePreview = ({ data, template, accentColor, classes = "" }) => {

    // --- 2. Pass formatDate to all templates ---
    const renderTemplate = () => {
        switch (template) {
            case "modern":
                return <ModernTemplate data={data} accentColor={accentColor} formatDate={formatDate} />;

            case "minimal":
                return <MinimalTemplate data={data} accentColor={accentColor} formatDate={formatDate} />;

            case "minimal-image":
                return <MinimalImageTemplate data={data} accentColor={accentColor} formatDate={formatDate} />;

            default:
                return <ClassicTemplate data={data} accentColor={accentColor} formatDate={formatDate} />;
        }
    };

    return (
        <div className='w-full bg-gray-100 min-h-screen p-4 flex justify-center'>
            <div
                id="resume-preview"
                className={"bg-white shadow-lg " + classes}
                style={{ width: '8.5in', minHeight: '11in' }} // Ensure US Letter size ratio on screen
            >
                {renderTemplate()}
            </div>

            {/* --- 3. Optimized Print Styles --- */}
            <style>
                {`
                @media print {
                    @page {
                        size: auto;
                        margin: 0mm;
                    }

                    html, body {
                        width: 210mm;
                        height: 297mm; /* A4 size fallback */
                        margin: 0;
                        padding: 0;
                        overflow: visible; /* Allows multi-page resumes */
                    }

                    /* Hide everything except the resume */
                    body * {
                        visibility: hidden;
                    }

                    /* Show the resume container */
                    #resume-preview, #resume-preview * {
                        visibility: visible;
                    }

                    #resume-preview {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact; /* Ensures background colors/images print */
                    }
                }
                `}
            </style>
        </div>
    );
};

export default ResumePreview;