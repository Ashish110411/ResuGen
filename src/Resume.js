import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
    Mail, Phone, Linkedin, Github, Globe, Code, FileText, Plus, Trash2, Download, Loader,
    AlertTriangle, ChevronDown, RefreshCw, Briefcase, Wrench, Award, Moon, Sun, GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { generateLatexResume } from './latexTemplate';

// --- Local Storage Hook ---
import { useLocalStorage } from './useLocalStorage';

// --- Dark Mode Context ---
const DarkModeContext = createContext();

export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) throw new Error('useDarkMode must be used within DarkModeProvider');
    return context;
};

export const DarkModeProvider = ({ children }) => {
    const getInitialTheme = () => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) return storedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <DarkModeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(d => !d) }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const DarkModeToggle = () => {
    const { isDark, toggleTheme } = useDarkMode();
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = () => {
        if (isToggling) return;
        setIsToggling(true);
        toggleTheme();
        setTimeout(() => setIsToggling(false), 150);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isToggling}
            className="p-2 rounded-lg surface hover:surface-secondary border border-border"
            style={{ transition: 'background-color 0.1s cubic-bezier(0.4, 0, 0.2, 1)', opacity: isToggling ? 0.7 : 1 }}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-slate-600" />}
        </button>
    );
};

// --- Resume Generator Main Component ---
const initialResumeData = {
    personalInfo: { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', leetcode: '' },
    education: [{ institution: '', duration: '', degree: '', cgpa: '', coursework: '' }],
    experience: [{ company: '', duration: '', position: '', location: '', achievements: [''] }],
    projects: [{ name: '', technologies: '', github: '', livesite: '', description: [''] }],
    skills: { expertise: '', languages: '', frameworks: '', tools: '', professional: '' },
    certifications: [{ name: '', link: '' }]
};
const initialSectionOrder = [
    'education', 'projects', 'experience', 'skills', 'certifications'
];

// --- CollapsibleSection & SectionOrderManager (can be split out for cleanliness) ---
const CollapsibleSection = ({ title, icon, children }) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="collapsible-section border rounded-lg mb-4">
            <button
                className="flex items-center w-full p-3 bg-surface-secondary rounded-t-lg focus:outline-none"
                onClick={() => setOpen((o) => !o)}
                style={{ cursor: 'pointer' }}
            >
                <span className="mr-2">{icon}</span>
                <span className="font-bold flex-1 text-left">{title}</span>
                <ChevronDown size={18} style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: ".2s" }} />
            </button>
            {open && <div className="p-3">{children}</div>}
        </div>
    );
};

const SectionOrderManager = ({ sectionOrder, setSectionOrder, isOpen, setIsOpen }) => {
    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(o => !o)}
                className="btn-secondary flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ marginBottom: isOpen ? 8 : 0 }}
            >
                <GripVertical size={16} />
                Reorder Sections
            </button>
            {isOpen && (
                <div className="bg-surface-secondary border rounded-lg p-3 mt-2">
                    <DragDropContext onDragEnd={result => {
                        if (!result.destination) return;
                        const items = Array.from(sectionOrder);
                        const [removed] = items.splice(result.source.index, 1);
                        items.splice(result.destination.index, 0, removed);
                        setSectionOrder(items);
                    }}>
                        <Droppable droppableId="sections-droppable">
                            {provided => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {sectionOrder.map((section, idx) => (
                                        <Draggable key={section} draggableId={section} index={idx}>
                                            {provided => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="flex items-center gap-2 p-2 bg-surface rounded mb-1 border cursor-move"
                                                >
                                                    <GripVertical size={14} />
                                                    <span className="capitalize">{section}</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            )}
        </div>
    );
};

const ResumeGenerator = () => {
    const [resumeData, setResumeData] = useLocalStorage('resumeData', initialResumeData);
    const [sectionOrder, setSectionOrder] = useLocalStorage('sectionOrder', initialSectionOrder);
    const [sectionOrderOpen, setSectionOrderOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isCompiling, setIsCompiling] = useState(false);
    const [compilationError, setCompilationError] = useState('');

    // --- Clear Form Data ---
    const clearFormData = () => {
        localStorage.removeItem('resumeData');
        localStorage.removeItem('sectionOrder');
        setResumeData(initialResumeData);
        setSectionOrder(initialSectionOrder);
    };

    // --- Compile PDF ---
    const handleCompile = useCallback(async () => {
        setIsCompiling(true);
        setCompilationError('');
        const latexString = generateLatexResume(resumeData, { sectionOrder });
        try {
            const response = await fetch('https://latex.ytotech.com/builds/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    compiler: 'pdflatex',
                    resources: [{ path: 'main.tex', content: latexString }]
                })
            });
            if (!response.ok) {
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.log || errorData.message || JSON.stringify(errorData);
                } catch {
                    const textError = await response.text();
                    if (textError) errorMessage = textError;
                }
                throw new Error(errorMessage);
            }
            const pdfBlob = await response.blob();
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(URL.createObjectURL(pdfBlob) + '#view=FitH&toolbar=0');
        } catch (error) {
            setCompilationError(error.message);
            setPdfUrl(null);
        } finally {
            setIsCompiling(false);
        }
    }, [resumeData, sectionOrder, pdfUrl]);

    useEffect(() => {
        const timeoutId = setTimeout(() => { handleCompile(); }, 1000);
        return () => {
            clearTimeout(timeoutId);
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [resumeData, sectionOrder]);

    // -- Data update helpers
    const updateField = (section, index, field, value) => setResumeData(p => ({
        ...p,
        [section]: p[section].map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
    const addEntry = (section, entry) => setResumeData(p => ({ ...p, [section]: [...p[section], entry] }));
    const removeEntry = (section, index) => setResumeData(p => ({ ...p, [section]: p[section].filter((_, i) => i !== index) }));
    const updateAchievements = (expIndex, achIndex, value) => setResumeData(p => ({
        ...p,
        experience: p.experience.map((e, i) => i === expIndex
            ? { ...e, achievements: e.achievements.map((a, j) => j === achIndex ? value : a) }
            : e)
    }));
    const addAchievement = expIndex => setResumeData(p => ({
        ...p,
        experience: p.experience.map((e, i) => i === expIndex
            ? { ...e, achievements: [...e.achievements, ''] }
            : e)
    }));
    const removeAchievement = (expIndex, achIndex) => setResumeData(p => ({
        ...p,
        experience: p.experience.map((e, i) => i === expIndex
            ? { ...e, achievements: e.achievements.filter((_, j) => j !== achIndex) }
            : e)
    }));
    const updateProjectDesc = (projIndex, descIndex, value) => setResumeData(p => ({
        ...p,
        projects: p.projects.map((proj, i) => i === projIndex
            ? { ...proj, description: proj.description.map((d, j) => j === descIndex ? value : d) }
            : proj)
    }));
    const addProjectDesc = projIndex => setResumeData(p => ({
        ...p,
        projects: p.projects.map((proj, i) => i === projIndex
            ? { ...proj, description: [...proj.description, ''] }
            : proj)
    }));
    const removeProjectDesc = (projIndex, descIndex) => setResumeData(p => ({
        ...p,
        projects: p.projects.map((proj, i) => i === projIndex
            ? { ...proj, description: proj.description.filter((_, j) => j !== descIndex) }
            : proj)
    }));

    // --- Render Dynamic Sections ---
    const renderSectionByType = (sectionType) => {
        switch (sectionType) {
            case 'education':
                return (
                    <CollapsibleSection key="education" title="Education" icon={<Code size={24} />}>
                        <div className="flex justify-end mb-3 lg:mb-4">
                            <button onClick={() => addEntry('education', { institution: '', duration: '', degree: '', cgpa: '', coursework: '' })}
                                    className="btn-primary flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium">
                                <Plus size={14} /> Add Education
                            </button>
                        </div>
                        {resumeData.education.map((edu, idx) => (
                            <div key={idx} className="border-t pt-3 lg:pt-4 mt-3 lg:mt-4 first:border-t-0 first:mt-0" style={{ borderColor: 'var(--color-border)' }}>
                                {resumeData.education.length > 1 && (
                                    <div className="flex justify-end mb-2">
                                        <button onClick={() => removeEntry('education', idx)} className="text-red-500 hover:text-red-700 p-1 rounded" title="Remove Education">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                                    <input type="text" placeholder="Institution Name" value={edu.institution}
                                           onChange={e => updateField('education', idx, 'institution', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                    <input type="text" placeholder="Duration (e.g., Sep 2020 - Present)" value={edu.duration}
                                           onChange={e => updateField('education', idx, 'duration', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                    <input type="text" placeholder="Degree & Specialization" value={edu.degree}
                                           onChange={e => updateField('education', idx, 'degree', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                    <input type="text" placeholder="CGPA/GPA" value={edu.cgpa}
                                           onChange={e => updateField('education', idx, 'cgpa', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                </div>
                                <textarea placeholder="Relevant Coursework (comma-separated)" value={edu.coursework}
                                          onChange={e => updateField('education', idx, 'coursework', e.target.value)}
                                          rows={2} className="input-field w-full p-2 lg:p-3 text-sm lg:text-base rounded-lg mt-3 lg:mt-4 focus:outline-none resize-none" />
                            </div>
                        ))}
                    </CollapsibleSection>
                );
            case 'experience':
                return (
                    <CollapsibleSection key="experience" title="Experience" icon={<Briefcase size={24} />}>
                        <div className="flex justify-end mb-3 lg:mb-4">
                            <button onClick={() => addEntry('experience', { company: '', duration: '', position: '', location: '', achievements: [''] })}
                                    className="btn-primary flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium">
                                <Plus size={14} /> Add Experience
                            </button>
                        </div>
                        {resumeData.experience.map((exp, idx) => (
                            <div key={idx} className="border-t pt-3 lg:pt-4 mt-3 lg:mt-4 first:border-t-0 first:mt-0" style={{ borderColor: 'var(--color-border)' }}>
                                {resumeData.experience.length > 1 && (
                                    <div className="flex justify-end mb-2">
                                        <button onClick={() => removeEntry('experience', idx)} className="text-red-500 hover:text-red-700 p-1 rounded" title="Remove Experience">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mb-3 lg:mb-4">
                                    <input type="text" placeholder="Company Name" value={exp.company}
                                           onChange={e => updateField('experience', idx, 'company', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                    <input type="text" placeholder="Duration (e.g., May 2025 – June 2025)" value={exp.duration}
                                           onChange={e => updateField('experience', idx, 'duration', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                    <input type="text" placeholder="Position/Role" value={exp.position}
                                           onChange={e => updateField('experience', idx, 'position', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                    <input type="text" placeholder="Location (e.g., New Delhi)" value={exp.location}
                                           onChange={e => updateField('experience', idx, 'location', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                </div>
                                <div className="space-y-2 lg:space-y-3">
                                    <label className="font-medium text-xs lg:text-sm" style={{ color: 'var(--color-foreground-secondary)' }}>
                                        Achievements/Responsibilities:
                                    </label>
                                    {exp.achievements.map((ach, achIndex) => (
                                        <div key={achIndex} className="flex items-start gap-2">
                      <textarea placeholder="Describe an achievement" value={ach}
                                onChange={e => updateAchievements(idx, achIndex, e.target.value)}
                                rows={2} className="input-field flex-1 p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none resize-none" />
                                            {exp.achievements.length > 1 && (
                                                <button onClick={() => removeAchievement(idx, achIndex)} className="text-red-500 hover:text-red-700 mt-2 p-1 rounded" title="Remove Achievement">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addAchievement(idx)}
                                            className="text-blue-600 hover:text-blue-800 text-xs lg:text-sm font-medium">
                                        + Add Achievement
                                    </button>
                                </div>
                            </div>
                        ))}
                    </CollapsibleSection>
                );
            case 'projects':
                return (
                    <CollapsibleSection key="projects" title="Projects" icon={<Globe size={24} />}>
                        <div className="flex justify-end mb-3 lg:mb-4">
                            <button onClick={() => addEntry('projects', { name: '', technologies: '', github: '', livesite: '', description: [''] })}
                                    className="btn-primary flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium">
                                <Plus size={14} /> Add Project
                            </button>
                        </div>
                        {resumeData.projects.map((proj, idx) => (
                            <div key={idx} className="border-t pt-3 lg:pt-4 mt-3 lg:mt-4 first:border-t-0 first:mt-0" style={{ borderColor: 'var(--color-border)' }}>
                                {resumeData.projects.length > 1 && (
                                    <div className="flex justify-end mb-2">
                                        <button onClick={() => removeEntry('projects', idx)} className="text-red-500 hover:text-red-700 p-1 rounded" title="Remove Project">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mb-3 lg:mb-4">
                                    <input type="text" placeholder="Project Name" value={proj.name}
                                           onChange={e => updateField('projects', idx, 'name', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg md:col-span-2 focus:outline-none" />
                                    <input type="text" placeholder="Technologies Used" value={proj.technologies}
                                           onChange={e => updateField('projects', idx, 'technologies', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg md:col-span-2 focus:outline-none" />
                                    <input type="url" placeholder="GitHub Repository URL" value={proj.github}
                                           onChange={e => updateField('projects', idx, 'github', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                    <input type="url" placeholder="Live Site URL" value={proj.livesite}
                                           onChange={e => updateField('projects', idx, 'livesite', e.target.value)}
                                           className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                </div>
                                <div className="space-y-2 lg:space-y-3">
                                    <label className="font-medium text-xs lg:text-sm" style={{ color: 'var(--color-foreground-secondary)' }}>
                                        Description:
                                    </label>
                                    {proj.description.map((desc, descIndex) => (
                                        <div key={descIndex} className="flex items-start gap-2">
                      <textarea placeholder="Describe the project and your contributions" value={desc}
                                onChange={e => updateProjectDesc(idx, descIndex, e.target.value)}
                                rows={2} className="input-field flex-1 p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none resize-none" />
                                            {proj.description.length > 1 && (
                                                <button onClick={() => removeProjectDesc(idx, descIndex)} className="text-red-500 hover:text-red-700 mt-2 p-1 rounded" title="Remove Description">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addProjectDesc(idx)}
                                            className="text-blue-600 hover:text-blue-800 text-xs lg:text-sm font-medium">
                                        + Add Description Point
                                    </button>
                                </div>
                            </div>
                        ))}
                    </CollapsibleSection>
                );
            case 'skills':
                return (
                    <CollapsibleSection key="skills" title="Skills" icon={<Wrench size={24} />}>
                        <div className="space-y-3 lg:space-y-4">
                            {['expertise', 'languages', 'frameworks', 'tools', 'professional'].map(field => (
                                <textarea key={field}
                                          placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                                          value={resumeData.skills[field]}
                                          onChange={e => setResumeData(p => ({ ...p, skills: { ...p.skills, [field]: e.target.value } }))}
                                          rows={2}
                                          className="input-field w-full p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none resize-none"
                                />
                            ))}
                        </div>
                    </CollapsibleSection>
                );
            case 'certifications':
                return (
                    <CollapsibleSection key="certifications" title="Certifications & Achievements" icon={<Award size={24} />}>
                        <div className="flex justify-end mb-3 lg:mb-4">
                            <button onClick={() => addEntry('certifications', { name: '', link: '' })}
                                    className="btn-primary flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium">
                                <Plus size={14} /> Add Certification
                            </button>
                        </div>
                        <div className="space-y-3 lg:space-y-4">
                            {resumeData.certifications.map((cert, idx) => (
                                <div key={idx} className="border-t pt-3 lg:pt-4 first:border-t-0 first:pt-0" style={{ borderColor: 'var(--color-border)' }}>
                                    {resumeData.certifications.length > 1 && (
                                        <div className="flex justify-end mb-2">
                                            <button onClick={() => removeEntry('certifications', idx)} className="text-red-500 hover:text-red-700 p-1 rounded" title="Remove Certification">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    <textarea placeholder="Certification name, issuing organization, etc." value={cert.name}
                              onChange={e => updateField('certifications', idx, 'name', e.target.value)}
                              rows={2} className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none resize-none" />
                                        <input type="url" placeholder="Certification Link (optional)" value={cert.link}
                                               onChange={e => updateField('certifications', idx, 'link', e.target.value)}
                                               className="input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg focus:outline-none" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>
                );
            default:
                return null;
        }
    };

    // --- Main Layout ---
    return (
        <div className="flex flex-col lg:flex-row min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="w-full lg:w-1/2 flex flex-col form-section" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="form-container scrollable-content">
                    <div className="form-content-wrapper">
                        <div className="flex justify-between items-center mb-4 lg:mb-8 sticky top-0 z-10 bg-opacity-95 backdrop-blur-sm p-2 -m-2 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                            <div className="truncate pr-2">
                                <h1 className="text-xl lg:text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>ResumeForge</h1>
                                <div className="text-xs lg:text-sm" style={{ color: 'var(--color-foreground-secondary)' }}>
                                    <span className="opacity-60">Created by </span>
                                    <span className="font-medium">Ashish Choudhary</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                                <DarkModeToggle />
                                {pdfUrl && (
                                    <a href={pdfUrl} download="resume.pdf" className="btn-primary flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium">
                                        <Download size={14} /> <span className="hidden sm:inline">Download</span>
                                    </a>
                                )}
                                <button onClick={clearFormData} className="btn-secondary flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium" title="Clear all saved form data">
                                    <RefreshCw size={14} /><span className="hidden sm:inline">Reset</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-3 lg:p-4 rounded-lg mb-4 lg:mb-6" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)' }}>
                            <p className="text-sm lg:text-base">
                                💾 <strong>Auto-Save:</strong> Your form data is automatically saved as you type and will persist even if you close the browser or reload the page.
                            </p>
                        </div>
                        <div className="p-3 lg:p-4 rounded-lg mb-4 lg:mb-6" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)' }}>
                            <p className="text-sm lg:text-base">
                                💡 <strong>Tip:</strong> You can now make text bold by enclosing it in asterisks. For example, writing <code>*your text here*</code> will render as <strong>your text here</strong>.
                            </p>
                        </div>
                        <div className="space-y-4 lg:space-y-6 pb-8">
                            <SectionOrderManager
                                sectionOrder={sectionOrder}
                                setSectionOrder={setSectionOrder}
                                isOpen={sectionOrderOpen}
                                setIsOpen={setSectionOrderOpen}
                            />
                            <CollapsibleSection title="Personal Information" icon={<FileText size={24} />}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                                    {Object.entries(resumeData.personalInfo).map(([field, value], idx) => (
                                        <input
                                            key={field}
                                            type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'url'}
                                            placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1') + (field === 'name' ? '' : ' URL')}
                                            value={value}
                                            onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, [field]: e.target.value } }))}
                                            className={`input-field p-2 lg:p-3 text-sm lg:text-base rounded-lg${field === 'leetcode' ? ' md:col-span-2' : ''} focus:outline-none`}
                                        />
                                    ))}
                                </div>
                            </CollapsibleSection>
                            {sectionOrder.map(renderSectionByType)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col pdf-section" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
                <div className="pdf-container surface rounded-lg lg:rounded-none flex items-center justify-center p-2 lg:p-4 m-2 lg:m-4 lg:mt-4"
                     style={{ height: 'calc(100vh - 1rem)', minHeight: '400px', maxHeight: 'calc(100vh - 1rem)' }}>
                    {isCompiling && (
                        <div className="text-center" style={{ color: 'var(--color-foreground-secondary)' }}>
                            <Loader size={window.innerWidth < 1024 ? 32 : 48} className="animate-spin mb-2 lg:mb-4 mx-auto" />
                            <p className="text-xs lg:text-base">Compiling PDF with your saved data...</p>
                        </div>
                    )}
                    {compilationError && !isCompiling && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-2 lg:p-4 m-2 lg:m-4 rounded-md w-full h-full overflow-y-auto">
                            <div className="flex items-center">
                                <AlertTriangle size={window.innerWidth < 1024 ? 20 : 24} className="mr-2 lg:mr-3 flex-shrink-0" />
                                <p className="font-bold text-sm lg:text-base">Compilation Failed</p>
                            </div>
                            <p className="text-xs lg:text-sm mt-1 lg:mt-2 mb-1 lg:mb-2">Please check your inputs for special characters. The error from the compiler is shown below:</p>
                            <pre className="text-xs mt-1 lg:mt-2 p-1 lg:p-2 bg-red-50 rounded whitespace-pre-wrap font-mono break-all max-h-32 lg:max-h-none overflow-y-auto">{compilationError}</pre>
                        </div>
                    )}
                    {!isCompiling && !compilationError && pdfUrl && (
                        <object data={pdfUrl} type="application/pdf" width="100%" height="100%" className="rounded-lg">
                            <div className="text-center p-4">
                                <p className="text-sm lg:text-base mb-2" style={{ color: 'var(--color-foreground-secondary)' }}>Your browser does not support PDFs.</p>
                                <a href={pdfUrl} className="btn-primary inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium">
                                    <Download size={16} /> Download PDF
                                </a>
                            </div>
                        </object>
                    )}
                    {!isCompiling && !compilationError && !pdfUrl && (
                        <div className="text-center" style={{ color: 'var(--color-foreground-secondary)' }}>
                            <p className="text-sm lg:text-base">Your resume preview will appear here.</p>
                            <p className="text-xs lg:text-sm">Start typing to see it live!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeGenerator;