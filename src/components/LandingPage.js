import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  LayoutGrid,
  CloudDownload,
  Layers,
  User2,
  Mail,
  Linkedin,
  Github,
  Globe,
  Star,
  X,
  ArrowRight,
  Settings,
  Eye,
  CheckCircle,
  FileDown,
  ExternalLink,
  Code,
} from "lucide-react";
import "../styles/landing.css";

function highlightLastWord(text) {
  const words = text.trim().split(" ");
  if (words.length === 1) {
    return <span className="title-highlight">{text}</span>;
  }
  const last = words.pop();
  return (
      <>
        {words.join(" ")} <span className="title-highlight">{last}</span>
      </>
  );
}

const featureItems = [
  {
    icon: <Rocket size={28} />,
    title: "Instant Resume",
    description: "Get started and build your resume in moments.",
  },
  {
    icon: <LayoutGrid size={28} />,
    title: "Modern Designs",
    description: "Choose clean, minimal templates that look professional.",
  },
  {
    icon: <CloudDownload size={28} />,
    title: "Easy Export",
    description: "Download your resume as PDF or .tex with a click.",
  },
  {
    icon: <Layers size={28} />,
    title: "Flexible Sections",
    description: "Add, remove, or rearrange sections as per your need.",
  },
];

// Journey steps - now placed below left/right main split
const journeySteps = [
  {
    icon: <User2 size={28} />,
    title: "Fill in your details",
    desc: "Enter your personal, education, experience and project info.",
  },
  {
    icon: <Settings size={28} />,
    title: "Customize the sections",
    desc: "Reorder, add, or remove resume sections easily.",
  },
  {
    icon: <Eye size={28} />,
    title: "Hide/Unhide sections",
    desc: "Show only relevant sections, hide others.",
  },
  {
    icon: <CheckCircle size={28} />,
    title: "Check the live preview",
    desc: "See your resume as you edit, in real-time PDF.",
  },
  {
    icon: <FileDown size={28} />,
    title: "Download PDF",
    desc: "If happy, download your professional PDF resume.",
  },
  {
    icon: <ExternalLink size={28} />,
    title: "Edit in Overleaf",
    desc: "For advanced changes, download .tex and edit at overleaf.com.",
  },
  {
    icon: <Code size={28} />,
    title: "Compile LaTeX Here (Soon)",
    desc: "Direct LaTeX compilation in ResuGen is coming soon!",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [showResumeModal, setShowResumeModal] = useState(false);

  const handleBegin = () => {
    navigate("/generate");
  };

  return (
      <div className="landing-page">
        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="header-content">
              <div className="logo">
                <img src="/resugen.png" alt="ResuGen" className="logo-icon" />
                <h1 className="logo-text">ResuGen</h1>
              </div>
              <div>
                <a
                    href="https://github.com/Ashish110411/ResuGen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="star-my-repo-btn"
                >
                  <Star size={18} />
                  Star My Repo
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Split */}
        <main className="main-split minimal-main-split">
          {/* Left: Resume Image */}
          <div className="minimal-main-left">
            <div className="resume-image-container">
              <div className="resume-image-title">
                {highlightLastWord("Your Resume Preview")}
              </div>
              <div className="resume-image-wrapper">
                <img
                    src="/resume.jpg"
                    alt="Resume Preview"
                    className="hero-resume-img minimal-resume-img"
                    onClick={() => setShowResumeModal(true)}
                    style={{ cursor: "pointer" }}
                />
              </div>
              <div className="resume-image-tip">Click to view full screen</div>
            </div>
          </div>
          {/* Right: Minimalistic Info */}
          <div className="minimal-main-right">
            <section className="hero-main-info minimal-hero-main-info">
              <h1 className="center-title">
                {highlightLastWord("Make Your Resume Effortlessly")}
              </h1>
              <p className="center-description">
                Fast, modern, and distraction-free resume builder.
              </p>
              <div className="hero-actions minimal-hero-actions" style={{ justifyContent: "center", display: "flex" }}>
                <button onClick={handleBegin} className="btn-primary btn-large">
                  Get Started
                  <Rocket size={18} />
                </button>
              </div>
              <div className="minimal-social-links">
                <a href="https://www.linkedin.com/in/ashish110411/" target="_blank" rel="noopener noreferrer" title="LinkedIn"><Linkedin size={20} /></a>
                <a href="https://github.com/Ashish110411" target="_blank" rel="noopener noreferrer" title="GitHub"><Github size={20} /></a>
                <a href="https://ashish110411.netlify.app/" target="_blank" rel="noopener noreferrer" title="Portfolio"><Globe size={20} /></a>
                <a href="mailto:ashishchaudhary110411@gmail.com" title="Email"><Mail size={20} /></a>
              </div>
            </section>

            {/* Features */}
            <section id="features" className="features features-side minimal-features-side">
              <h2 className="minimal-section-title">
                {highlightLastWord("Features")}
              </h2>
              <div className="minimal-feature-row">
                {featureItems.map((feature, idx) => (
                    <div key={idx} className="minimal-feature-box">
                      <span className="minimal-feature-icon">{feature.icon}</span>
                      <div className="minimal-feature-title">{feature.title}</div>
                      <p className="minimal-feature-desc">{feature.description}</p>
                    </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Journey Steps - BELOW the main split */}
        <div className="journey-steps-center">
          <div className="journey-steps-title">
            {highlightLastWord("Your Journey")}
          </div>
          <div className="journey-steps-row">
            {journeySteps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="journey-step-box">
                    <span className="journey-step-icon">{step.icon}</span>
                    <div className="journey-step-title">{step.title}</div>
                    <div className="journey-step-desc">{step.desc}</div>
                  </div>
                  {idx < journeySteps.length - 1 && (
                      <span className="journey-step-arrow">
                  <ArrowRight size={28} />
                </span>
                  )}
                </React.Fragment>
            ))}
          </div>
        </div>

        {/* Resume Fullscreen Modal */}
        {showResumeModal && (
            <div className="resume-modal" onClick={() => setShowResumeModal(false)}>
              <div className="resume-modal-content" onClick={e => e.stopPropagation()}>
                <button
                    className="resume-modal-close"
                    onClick={() => setShowResumeModal(false)}
                >
                  <X size={28} />
                </button>
                <img
                    src="/resume.jpg"
                    alt="Resume Full View"
                    className="resume-modal-img"
                />
              </div>
            </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <div className="footer-logo">
                  <div className="logo">
                    <img
                        src="/resugen.png"
                        alt="ResuGen"
                        className="logo-icon"
                    />
                    <span className="logo-text">ResuGen</span>
                  </div>
                </div>
                <p className="footer-description">
                  Effortless resume creation for everyone.
                </p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>
                © 2025 ResuGen. Made by{' '}
                <a
                    href="https://www.linkedin.com/in/ashish110411/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  Ashish Choudhary
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
};

export default LandingPage;