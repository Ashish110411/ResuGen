import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Download, Loader, AlertTriangle, RefreshCw, FileText, Monitor, Smartphone } from 'lucide-react';

// Import components
import LandingPage from './components/LandingPage';
import PersonalInfo from './components/PersonalInfo';
import Education from './components/Education';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import SectionManager from './components/SectionManager';

// Import utilities
import { useLocalStorage, clearAllResumeData } from './utils/localStorage';
import { generateFullLatex } from './utils/latexGenerator';

// Import styles
import './styles/global.css';
import './styles/real-time-builder.css';

const ResumeBuilder = () => {
  // Resume data with localStorage persistence
  // Update the initial resumeData state to include objective
  const [resumeData, setResumeData] = useLocalStorage('resumeData', {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      portfolio: '',
      leetcode: '',
      objective: ''
    },
    education: [{ institution: '', duration: '', degree: '', cgpa: '', coursework: '' }],
    experience: [{ company: '', duration: '', position: '', location: '', achievements: [''] }],
    projects: [{ name: '', technologies: '', github: '', livesite: '', description: [''] }],
    skills: { expertise: '', languages: '', frameworks: '', tools: '', professional: '' },
    certifications: [{ name: '', link: '' }]
  });

  // Section order with localStorage persistence
  const [sectionOrder, setSectionOrder] = useLocalStorage('sectionOrder', [
    'education',
    'projects',
    'experience',
    'skills',
    'certifications'
  ]);

  // Real-time states
  const [sectionOrderOpen, setSectionOrderOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile

  // Progress tracking
  const [completionProgress, setCompletionProgress] = useState(0);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate completion progress
  const calculateProgress = useCallback(() => {
    let totalFields = 0;
    let filledFields = 0;

    // Personal info (7 fields)
    const personalFields = Object.values(resumeData.personalInfo);
    totalFields += personalFields.length;
    filledFields += personalFields.filter(field => field && field.trim() !== '').length;

    // Education (5 fields per entry)
    resumeData.education.forEach(edu => {
      const eduFields = [edu.institution, edu.duration, edu.degree, edu.cgpa, edu.coursework];
      totalFields += eduFields.length;
      filledFields += eduFields.filter(field => field && field.trim() !== '').length;
    });

    // Experience (4 fields + achievements per entry)
    resumeData.experience.forEach(exp => {
      const expFields = [exp.company, exp.duration, exp.position, exp.location];
      totalFields += expFields.length + exp.achievements.length;
      filledFields += expFields.filter(field => field && field.trim() !== '').length;
      filledFields += exp.achievements.filter(ach => ach && ach.trim() !== '').length;
    });

    // Projects (4 fields + descriptions per entry)
    resumeData.projects.forEach(proj => {
      const projFields = [proj.name, proj.technologies, proj.github, proj.livesite];
      totalFields += projFields.length + proj.description.length;
      filledFields += projFields.filter(field => field && field.trim() !== '').length;
      filledFields += proj.description.filter(desc => desc && desc.trim() !== '').length;
    });

    // Skills (5 fields)
    const skillFields = Object.values(resumeData.skills);
    totalFields += skillFields.length;
    filledFields += skillFields.filter(field => field && field.trim() !== '').length;

    // Certifications (2 fields per entry)
    resumeData.certifications.forEach(cert => {
      const certFields = [cert.name, cert.link];
      totalFields += certFields.length;
      filledFields += certFields.filter(field => field && field.trim() !== '').length;
    });

    const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    setCompletionProgress(progress);
  }, [resumeData]);

  // Update progress on data change
  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  // Data update functions with real-time tracking
  const updatePersonalInfo = useCallback((newData) => {
    setResumeData(prev => ({ ...prev, personalInfo: newData }));
    setLastUpdateTime(new Date());
  }, [setResumeData]);

  const updateEducation = useCallback((newData) => {
    setResumeData(prev => ({ ...prev, education: newData }));
    setLastUpdateTime(new Date());
  }, [setResumeData]);

  const updateExperience = useCallback((newData) => {
    setResumeData(prev => ({ ...prev, experience: newData }));
    setLastUpdateTime(new Date());
  }, [setResumeData]);

  const updateProjects = useCallback((newData) => {
    setResumeData(prev => ({ ...prev, projects: newData }));
    setLastUpdateTime(new Date());
  }, [setResumeData]);

  const updateSkills = useCallback((newData) => {
    setResumeData(prev => ({ ...prev, skills: newData }));
    setLastUpdateTime(new Date());
  }, [setResumeData]);

  const updateCertifications = useCallback((newData) => {
    setResumeData(prev => ({ ...prev, certifications: newData }));
    setLastUpdateTime(new Date());
  }, [setResumeData]);

  // Clear all form data
  const clearFormData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
      clearAllResumeData();

      setResumeData({
        personalInfo: {
          name: '',
          email: '',
          phone: '',
          linkedin: '',
          github: '',
          portfolio: '',
          leetcode: '',
          objective: ''
        },
        education: [{ institution: '', duration: '', degree: '', cgpa: '', coursework: '' }],
        experience: [{ company: '', duration: '', position: '', location: '', achievements: [''] }],
        projects: [{ name: '', technologies: '', github: '', livesite: '', description: [''] }],
        skills: { expertise: '', languages: '', frameworks: '', tools: '', professional: '' },
        certifications: [{ name: '', link: '' }]
      });

      setSectionOrder(['education', 'projects', 'experience', 'skills', 'certifications']);
      setLastUpdateTime(new Date());
    }
  }, [setResumeData, setSectionOrder]);

  // Enhanced PDF compilation function with real-time feedback
  const handleCompile = useCallback(async () => {
    if (!isOnline) {
      setCompilationError('No internet connection. Please check your connection and try again.');
      return;
    }

    setIsCompiling(true);
    setCompilationError('');

    const latexString = generateFullLatex(resumeData, sectionOrder);

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
        } catch (e) {
          const textError = await response.text();
          if (textError) { errorMessage = textError; }
        }
        throw new Error(errorMessage);
      }

      const pdfBlob = await response.blob();

      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const newPdfUrl = URL.createObjectURL(pdfBlob) + '#view=FitH&toolbar=0';
      setPdfUrl(newPdfUrl);
    } catch (error) {
      console.error("Compilation failed:", error);
      setCompilationError(error.message);
      setPdfUrl(null);
    } finally {
      setIsCompiling(false);
    }
  }, [resumeData, sectionOrder, pdfUrl, isOnline]);

  // Real-time auto-compile with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleCompile();
    }, 500); // Reduced to 500ms for more real-time feel

    return () => {
      clearTimeout(timeoutId);
    };
  }, [resumeData, sectionOrder]);

  // Section rendering based on type
  const renderSection = (sectionType) => {
    switch(sectionType) {
      case 'education':
        return (
            <Education
                key="education"
                data={resumeData.education}
                updateData={updateEducation}
            />
        );
      case 'experience':
        return (
            <Experience
                key="experience"
                data={resumeData.experience}
                updateData={updateExperience}
            />
        );
      case 'projects':
        return (
            <Projects
                key="projects"
                data={resumeData.projects}
                updateData={updateProjects}
            />
        );
      case 'skills':
        return (
            <Skills
                key="skills"
                data={resumeData.skills}
                updateData={updateSkills}
            />
        );
      case 'certifications':
        return (
            <Certifications
                key="certifications"
                data={resumeData.certifications}
                updateData={updateCertifications}
            />
        );
      default:
        return null;
    }
  };

  return (
      <div className="real-time-builder">
        {/* Top Status Bar */}
        <div className="status-bar">
          <div className="status-left">
            <div className="app-info">
              <h1 className="app-title">ResuGen</h1>
              <span className="creator-info">by Ashish Choudhary</span>
            </div>
            <div className="real-time-indicators">
              <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                <div className="status-dot"></div>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div className="last-update">
                Last saved: {lastUpdateTime.toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="status-center">
            <div className="progress-container">
              <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${completionProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{completionProgress}% Complete</span>
            </div>
          </div>

          <div className="status-right">
            <div className="view-controls">
              <button
                  className={`view-btn ${viewMode === 'desktop' ? 'active' : ''}`}
                  onClick={() => setViewMode('desktop')}
                  title="Desktop View"
              >
                <Monitor size={16} />
              </button>
              <button
                  className={`view-btn ${viewMode === 'mobile' ? 'active' : ''}`}
                  onClick={() => setViewMode('mobile')}
                  title="Mobile View"
              >
                <Smartphone size={16} />
              </button>
            </div>
            <div className="action-buttons">
              {pdfUrl && (
                  <a
                      href={pdfUrl}
                      download="resume.pdf"
                      className="btn-primary download-btn"
                  >
                    <Download size={16} />
                    Download
                  </a>
              )}
              <button
                  onClick={clearFormData}
                  className="btn-secondary reset-btn"
                  title="Clear all data"
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`builder-content ${viewMode}`}>
          {/* Left Panel - Form (0-50%) */}
          <div className="form-panel">
            <div className="form-container">
              <div className="form-content">
                {/* Auto-save notice */}
                <div className="auto-save-notice">
                  <div className="notice-content">
                    <div className="notice-icon">💾</div>
                    <div className="notice-text">
                      <strong>Real-time Auto-Save</strong>
                      <span>Changes are saved instantly and synced across sessions</span>
                    </div>
                  </div>
                </div>

                {/* Bold text tip */}
                <div className="formatting-tip">
                  <div className="tip-content">
                    <div className="tip-icon">💡</div>
                    <div className="tip-text">
                      <strong>Formatting Tip:</strong> Use *asterisks* to make text <strong>bold</strong>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="sections-container">
                  <SectionManager
                      sectionOrder={sectionOrder}
                      setSectionOrder={setSectionOrder}
                      isOpen={sectionOrderOpen}
                      setIsOpen={setSectionOrderOpen}
                  />

                  <PersonalInfo
                      data={resumeData.personalInfo}
                      updateData={updatePersonalInfo}
                  />

                  {sectionOrder.map(sectionType => renderSection(sectionType))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview (50-100%) */}
          <div className="preview-panel">
            <div className="preview-header">
              <div className="preview-title">
                <FileText size={20} />
                <span>Live Preview</span>
              </div>
              <div className="preview-status">
                {isCompiling && (
                    <div className="compiling-indicator">
                      <Loader size={16} className="spinning" />
                      <span>Compiling...</span>
                    </div>
                )}
                {!isCompiling && pdfUrl && (
                    <div className="compiled-indicator">
                      <div className="success-dot"></div>
                      <span>Up to date</span>
                    </div>
                )}
                {!isCompiling && compilationError && (
                    <div className="error-indicator">
                      <AlertTriangle size={16} />
                      <span>Error</span>
                    </div>
                )}
              </div>
            </div>

            <div className="preview-content">
              {isCompiling && (
                  <div className="preview-loading">
                    <div className="loading-animation">
                      <Loader size={48} className="spinning" />
                      <h3>Generating Preview...</h3>
                      <p>Compiling your resume with LaTeX precision</p>
                    </div>
                  </div>
              )}

              {compilationError && !isCompiling && (
                  <div className="preview-error">
                    <div className="error-content">
                      <AlertTriangle size={48} />
                      <h3>Compilation Error</h3>
                      <p>There was an issue generating your resume preview.</p>
                      <details className="error-details">
                        <summary>View Error Details</summary>
                        <pre>{compilationError}</pre>
                      </details>
                      <button onClick={handleCompile} className="btn-primary">
                        <RefreshCw size={16} />
                        Retry Compilation
                      </button>
                    </div>
                  </div>
              )}

              {!isCompiling && !compilationError && pdfUrl && (
                  <div className="preview-pdf">
                    <object
                        data={pdfUrl}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        className="pdf-viewer"
                    >
                      <div className="pdf-fallback">
                        <FileText size={48} />
                        <p>Your browser doesn't support PDF preview.</p>
                        <a href={pdfUrl} className="btn-primary">
                          <Download size={16} /> Download PDF
                        </a>
                      </div>
                    </object>
                  </div>
              )}

              {!isCompiling && !compilationError && !pdfUrl && (
                  <div className="preview-empty">
                    <div className="empty-content">
                      <FileText size={64} />
                      <h3>Start Building Your Resume</h3>
                      <p>Fill in your information on the left to see a live preview here</p>
                      <div className="progress-hint">
                        <span>Progress: {completionProgress}%</span>
                        <div className="mini-progress">
                          <div
                              className="mini-progress-fill"
                              style={{ width: `${completionProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

// Main App with routing
const App = () => {
  return (
      <Router>
        <div style={{ backgroundColor: 'var(--primary-black)', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/builder" element={<ResumeBuilder />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </div>
      </Router>
  );
};

export default App;