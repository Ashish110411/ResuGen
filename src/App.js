import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Download, Loader, AlertTriangle, RefreshCw, FileText, Code, Lightbulb } from 'lucide-react';

import LandingPage from './components/LandingPage';
import PersonalInfo from './components/PersonalInfo';
import Education from './components/Education';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import SectionManager from './components/SectionManager';

import { useLocalStorage, clearAllResumeData } from './utils/localStorage';
import { latexResume } from './utils/latexGenerator';

import './styles/global.css';
import './styles/real-time-builder.css';

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useLocalStorage('resumeData', {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      portfolio: '',
      objective: ''
    },
    education: [],
    experience: [],
    projects: [],
    skills: {
      skillCategories: []
    },
    certifications: []
  });

  const [vspaceSettings, setVspaceSettings] = useLocalStorage('vspaceSettings', {
    experience: {
      afterJobTitle: 0,
      betweenExperiences: 0,
      betweenAchievements: -0.5
    },
    projects: {
      betweenProjects: 0,
      betweenPoints: 0
    }
  });

  const [sectionOrder, setSectionOrder] = useLocalStorage('sectionOrder', [
    'objective',
    'education',
    'projects',
    'experience',
    'skills',
    'certifications'
  ]);

  const defaultVisibleSections = ['objective', 'education', 'projects', 'experience', 'skills', 'certifications'];

  const [visibleSections, setVisibleSections] = useLocalStorage(
      'visibleSections',
      new Set(defaultVisibleSections),
      (value) => Array.from(value),
      (value) => new Set(value)
  );

  const [sectionOrderOpen, setSectionOrderOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [previewMode, setPreviewMode] = useState('pdf');
  const [latexCode, setLatexCode] = useState('');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const debounceTimer = useRef(null);

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

  const updateVspaceSettings = useCallback((newSettings) => {
    setVspaceSettings(newSettings);
    setLastUpdateTime(new Date());
  }, [setVspaceSettings]);

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
          objective: ''
        },
        education: [],
        experience: [],
        projects: [],
        skills: {
          skillCategories: []
        },
        certifications: []
      });

      setVspaceSettings({
        experience: {
          afterJobTitle: 0,
          betweenExperiences: 0,
          betweenAchievements: -0.5
        },
        projects: {
          betweenProjects: 0,
          betweenPoints: 0
        }
      });

      setSectionOrder(['objective', 'education', 'projects', 'experience', 'skills', 'certifications']);
      setVisibleSections(new Set(['objective', 'education', 'projects', 'experience', 'skills', 'certifications']));
      setLastUpdateTime(new Date());
    }
  }, [setResumeData, setSectionOrder, setVisibleSections, setVspaceSettings]);

  const handleCompile = useCallback(async () => {
    if (!isOnline) {
      setCompilationError('No internet connection. Please check your connection and try again.');
      return;
    }

    setIsCompiling(true);
    setCompilationError('');

    const latexString = latexResume(resumeData, sectionOrder, visibleSections, vspaceSettings);
    setLatexCode(latexString);

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
          if (textError) errorMessage = textError;
        }
        throw new Error(errorMessage);
      }

      const pdfBlob = await response.blob();
      setPdfUrl(prevUrl => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return URL.createObjectURL(pdfBlob) + '#view=FitH&toolbar=0';
      });
    } catch (error) {
      setCompilationError(error.message);
      setPdfUrl(null);
    } finally {
      setIsCompiling(false);
    }
  }, [resumeData, sectionOrder, visibleSections, vspaceSettings, isOnline]);

  const scheduleCompile = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      handleCompile();
    }, 600);
  }, [handleCompile]);

  useEffect(() => {
    scheduleCompile();
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [resumeData, sectionOrder, visibleSections, vspaceSettings, scheduleCompile]);

  const renderSection = (sectionType) => {
    if (!visibleSections.has(sectionType)) return null;

    switch (sectionType) {
      case 'objective':
        return null;
      case 'education':
        return <Education key="education" data={resumeData.education} updateData={updateEducation} />;
      case 'experience':
        return (
            <Experience
                key="experience"
                data={resumeData.experience}
                updateData={updateExperience}
                vspaceSettings={vspaceSettings}
                updateVspaceSettings={updateVspaceSettings}
            />
        );
      case 'projects':
        return (
            <Projects
                key="projects"
                data={resumeData.projects}
                updateData={updateProjects}
                vspaceSettings={vspaceSettings}
                updateVspaceSettings={updateVspaceSettings}
            />
        );
      case 'skills':
        return <Skills key="skills" data={resumeData.skills} updateData={updateSkills} />;
      case 'certifications':
        return <Certifications key="certifications" data={resumeData.certifications} updateData={updateCertifications} />;
      default:
        return null;
    }
  };

  return (
      <div className="real-time-builder">
        <div className="status-bar">
          <div className="status-left">
            <div className="app-info">
              <div className="app-brand">
                <h1 className="app-title">
                  <img src="/resugen.png" alt="ResuGen" className="app-logo" />
                  ResuGen
                </h1>
              </div>
            </div>
            <div className="real-time-indicators">
              <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                <div className="status-dot"></div>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div className="compilation-status">
                {isCompiling && (
                    <div className="compiling-indicator">
                      <Loader size={16} className="spinning" />
                      <span>Compiling...</span>
                    </div>
                )}
                {!isCompiling && pdfUrl && !compilationError && (
                    <div className="compiled-indicator">
                      <div className="success-dot"></div>
                      <span>Up to date</span>
                    </div>
                )}
                {!isCompiling && compilationError && (
                    <div className="error-indicator">
                      <AlertTriangle size={16} />
                      <span>Compilation Error</span>
                    </div>
                )}
              </div>
              <div className="last-update">
                Last saved: {lastUpdateTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div className="status-right">
            <div className="view-controls">
              <button
                  className={`view-btn ${previewMode === 'pdf' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('pdf')}
                  title="PDF Preview"
              >
                <FileText size={16} />
                PDF
              </button>
              <button
                  className={`view-btn ${previewMode === 'latex' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('latex')}
                  title="LaTeX Code"
              >
                <Code size={16} />
                LaTeX
              </button>
            </div>
            <div className="action-buttons">
              {pdfUrl && (
                  <>
                    <button
                        onClick={handleCompile}
                        className="btn-secondary recompile-btn"
                        style={{ marginRight: '0.6rem' }}
                        title="Recompile the latest LaTeX"
                    >
                      <RefreshCw size={16} />
                      Recompile
                    </button>
                    <button
                        onClick={() => setDownloadModalOpen(true)}
                        className="btn-primary download-btn"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </>
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
        <div className="builder-content">
          <div className="form-panel">
            <div className="form-container">
              <div className="form-content">
                <div className="formatting-tip">
                  <div className="tip-content">
                    <Lightbulb size={16} />
                    <div className="tip-text">
                      <strong>Formatting Tip:</strong> Use *asterisks* to make text <strong>bold</strong>
                    </div>
                  </div>
                </div>
                <div className="sections-container">
                  <SectionManager
                      sectionOrder={sectionOrder}
                      setSectionOrder={setSectionOrder}
                      isOpen={sectionOrderOpen}
                      setIsOpen={setSectionOrderOpen}
                      visibleSections={visibleSections}
                      setVisibleSections={setVisibleSections}
                  />
                  <PersonalInfo data={resumeData.personalInfo} updateData={updatePersonalInfo} />
                  {sectionOrder.map(sectionType => renderSection(sectionType))}
                </div>
              </div>
            </div>
          </div>
          <div className="preview-panel">
            <div className="preview-content">
              {previewMode === 'pdf' && (
                  <>
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
                          </div>
                        </div>
                    )}
                  </>
              )}
              {previewMode === 'latex' && (
                  <div className="latex-preview">
                    <div className="latex-code">
                      <pre><code>{latexCode}</code></pre>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
        {downloadModalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Download Resume As</h3>
                <div className="modal-buttons">
                  <a
                      href={pdfUrl}
                      download="resume.pdf"
                      className="modal-btn-primary"
                      onClick={() => setDownloadModalOpen(false)}
                  >
                    PDF
                  </a>
                  <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(latexCode)}`}
                      download="resume.tex"
                      className="modal-btn-secondary"
                      onClick={() => setDownloadModalOpen(false)}
                  >
                    LaTeX
                  </a>
                </div>
                <button
                    className="modal-close-btn"
                    onClick={() => setDownloadModalOpen(false)}
                    aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

const App = () => (
    <Router>
      <div style={{ backgroundColor: 'var(--primary-black)', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/generate" element={<ResumeBuilder />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </Router>
);

export default App;