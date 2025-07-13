import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Download, Loader, AlertTriangle, RefreshCw, FileText, Monitor, Smartphone } from 'lucide-react';

import LandingPage from './components/LandingPage';
import PersonalInfo from './components/PersonalInfo';
import Education from './components/Education';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import SectionManager from './components/SectionManager';

import { useLocalStorage, clearAllResumeData } from './utils/localStorage';
import { generateFullLatex } from './utils/latexGenerator';

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
      leetcode: '',
      objective: ''
    },
    education: [{ institution: '', duration: '', degree: '', cgpa: '' }],
    experience: [{ company: '', duration: '', position: '', achievements: [''] }],
    projects: [{ name: '', technologies: '', github: '', livesite: '', description: [''] }],
    skills: {
      skillCategories: [
        { id: '1', title: 'Programming Languages', content: '' },
        { id: '2', title: 'Frameworks & Technologies', content: '' },
        { id: '3', title: 'Tools & Platforms', content: '' }
      ]
    },
    certifications: [{ name: '', link: '' }]
  });

  const [sectionOrder, setSectionOrder] = useLocalStorage('sectionOrder', [
    'objective',
    'education',
    'projects',
    'experience',
    'skills',
    'certifications'
  ]);

  const [visibleSections, setVisibleSections] = useLocalStorage('visibleSections',
      ['objective', 'education', 'projects', 'experience', 'skills', 'certifications'],
      (value) => Array.from(value),
      (value) => new Set(Array.isArray(value) ? value : ['objective', 'education', 'projects', 'experience', 'skills', 'certifications'])
  );

  const [sectionOrderOpen, setSectionOrderOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [viewMode, setViewMode] = useState('desktop');
  const [completionProgress, setCompletionProgress] = useState(0);

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

  const calculateProgress = useCallback(() => {
    let totalFields = 0;
    let filledFields = 0;

    const isFieldFilled = (field) => {
      return field && typeof field === 'string' && field.trim() !== '';
    };

    const visibleSectionsArray = Array.from(visibleSections);

    if (visibleSectionsArray.includes('objective')) {
      totalFields += 1;
      if (isFieldFilled(resumeData.personalInfo.objective)) {
        filledFields += 1;
      }
    }

    const personalFields = [
      resumeData.personalInfo.name,
      resumeData.personalInfo.email,
      resumeData.personalInfo.phone,
      resumeData.personalInfo.linkedin,
      resumeData.personalInfo.github
    ];
    totalFields += personalFields.length;
    filledFields += personalFields.filter(field => isFieldFilled(field)).length;

    if (visibleSectionsArray.includes('education') && Array.isArray(resumeData.education)) {
      resumeData.education.forEach(edu => {
        if (edu && typeof edu === 'object') {
          const eduFields = [edu.institution, edu.duration, edu.degree, edu.cgpa, edu.coursework];
          totalFields += eduFields.length;
          filledFields += eduFields.filter(field => isFieldFilled(field)).length;
        }
      });
    }

    if (visibleSectionsArray.includes('experience') && Array.isArray(resumeData.experience)) {
      resumeData.experience.forEach(exp => {
        if (exp && typeof exp === 'object') {
          const expFields = [exp.company, exp.duration, exp.position, exp.location];
          totalFields += expFields.length;
          filledFields += expFields.filter(field => isFieldFilled(field)).length;

          if (Array.isArray(exp.achievements)) {
            totalFields += exp.achievements.length;
            filledFields += exp.achievements.filter(ach => isFieldFilled(ach)).length;
          }
        }
      });
    }

    if (visibleSectionsArray.includes('projects') && Array.isArray(resumeData.projects)) {
      resumeData.projects.forEach(proj => {
        if (proj && typeof proj === 'object') {
          const projFields = [proj.name, proj.technologies, proj.github, proj.livesite];
          totalFields += projFields.length;
          filledFields += projFields.filter(field => isFieldFilled(field)).length;

          if (Array.isArray(proj.description)) {
            totalFields += proj.description.length;
            filledFields += proj.description.filter(desc => isFieldFilled(desc)).length;
          }
        }
      });
    }

    if (visibleSectionsArray.includes('skills') && resumeData.skills && typeof resumeData.skills === 'object') {
      if (Array.isArray(resumeData.skills.skillCategories)) {
        resumeData.skills.skillCategories.forEach(cat => {
          if (cat && typeof cat === 'object') {
            totalFields += 2;
            if (isFieldFilled(cat.title)) filledFields += 1;
            if (isFieldFilled(cat.content)) filledFields += 1;
          }
        });
      } else {
        const skillFields = [
          resumeData.skills.expertise,
          resumeData.skills.languages,
          resumeData.skills.frameworks,
          resumeData.skills.tools,
          resumeData.skills.professional
        ];
        totalFields += skillFields.length;
        filledFields += skillFields.filter(field => isFieldFilled(field)).length;
      }
    }

    if (visibleSectionsArray.includes('certifications') && Array.isArray(resumeData.certifications)) {
      resumeData.certifications.forEach(cert => {
        if (cert && typeof cert === 'object') {
          const certFields = [cert.name, cert.link];
          totalFields += certFields.length;
          filledFields += certFields.filter(field => isFieldFilled(field)).length;
        }
      });
    }

    const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    setCompletionProgress(progress);
  }, [resumeData, visibleSections]);

  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

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
        education: [{ institution: '', duration: '', degree: '', cgpa: '' }],
        experience: [{ company: '', duration: '', position: '', achievements: [''] }],
        projects: [{ name: '', technologies: '', github: '', livesite: '', description: [''] }],
        skills: {
          skillCategories: [
            { id: '1', title: 'Programming Languages', content: '' },
            { id: '2', title: 'Frameworks & Technologies', content: '' },
            { id: '3', title: 'Tools & Platforms', content: '' }
          ]
        },
        certifications: [{ name: '', link: '' }]
      });

      setSectionOrder(['objective', 'education', 'projects', 'experience', 'skills', 'certifications']);
      setVisibleSections(new Set(['objective', 'education', 'projects', 'experience', 'skills', 'certifications']));
      setLastUpdateTime(new Date());
    }
  }, [setResumeData, setSectionOrder, setVisibleSections]);

  const handleCompile = useCallback(async () => {
    if (!isOnline) {
      setCompilationError('No internet connection. Please check your connection and try again.');
      return;
    }

    setIsCompiling(true);
    setCompilationError('');

    const latexString = generateFullLatex(resumeData, sectionOrder, visibleSections);

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
  }, [resumeData, sectionOrder, visibleSections, pdfUrl, isOnline]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleCompile();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [resumeData, sectionOrder, visibleSections]);

  const renderSection = (sectionType) => {
    if (!visibleSections.has(sectionType)) return null;

    switch(sectionType) {
      case 'objective':
        return null;
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

        <div className={`builder-content ${viewMode}`}>
          <div className="form-panel">
            <div className="form-container">
              <div className="form-content">
                <div className="auto-save-notice">
                  <div className="notice-content">
                    <div className="notice-icon">💾</div>
                    <div className="notice-text">
                      <strong>Real-time Auto-Save</strong>
                      <span>Changes are saved instantly and synced across sessions</span>
                    </div>
                  </div>
                </div>

                <div className="formatting-tip">
                  <div className="tip-content">
                    <div className="tip-icon">💡</div>
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

                  <PersonalInfo
                      data={resumeData.personalInfo}
                      updateData={updatePersonalInfo}
                  />

                  {sectionOrder.map(sectionType => renderSection(sectionType))}
                </div>
              </div>
            </div>
          </div>

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