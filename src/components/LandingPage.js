import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Zap, Download, Star, ArrowRight, Eye, Globe } from 'lucide-react';
import '../styles/landing.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/generate');
  };

  const features = [
    {
      icon: <Zap size={24} />,
      title: "Lightning Fast",
      description: "Generate professional resumes in seconds with our optimized LaTeX compilation engine."
    },
    {
      icon: <FileText size={24} />,
      title: "Professional Templates",
      description: "Clean, ATS-friendly templates designed by hiring experts to make you stand out."
    },
    {
      icon: <Download size={24} />,
      title: "Instant Download",
      description: "Get your resume as a high-quality PDF ready for immediate use and sharing."
    },
    {
      icon: <Globe size={24} />,
      title: "Customizable Sections",
      description: "Drag and drop to reorder sections and tailor your resume for any position."
    }
  ];

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
              <nav className="nav">
                <a href="#features" className="nav-link">Features</a>
                <a href="#how-it-works" className="nav-link">How it Works</a>
                <a
                    href="https://github.com/Ashish110411/ResuGen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link star-repo"
                >
                  <Star size={16} />
                  Star Repo
                </a>
                <button onClick={handleGetStarted} className="btn-primary">
                  Get Started
                  <ArrowRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="container">

              <h1 className="hero-title">
                Create Professional Resumes with <span className="hero-highlight">LaTeX Precision</span>
              </h1>
              <p className="hero-description">
                Generate stunning, ATS-friendly resumes in seconds. Our LaTeX-powered engine ensures
                perfect formatting every time, giving you the edge in today's competitive job market.
              </p>
              <div className="hero-actions">
                <button onClick={handleGetStarted} className="btn-primary btn-large">
                  Start Building Now
                  <ArrowRight size={20} />
                </button>
                <a
                    href="/resume.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-btn-secondary btn-large"
                >
                  <Eye size={20} />
                  View Prototype
                </a>
              </div>
              {/* Social Links */}
              <div className="social-links">
                <a
                    href="https://www.linkedin.com/in/ashish110411/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn Profile"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a
                    href="https://github.com/Ashish110411"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub Profile"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                    href="https://ashish110411.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Portfolio Website"
                >
                  <Globe size={28} />
                </a>
                <a
                    href="mailto:ashishchaudhary110411@gmail.com"
                    title="Email"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z"/>
                  </svg>
                </a>
              </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Powerful Features for Perfect Resumes</h2>
              <p className="landing-section-description">
                Everything you need to create, customize, and download your professional resume.
              </p>
            </div>
            <div className="features-grid">
              {features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">
                      {feature.icon}
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="how-it-works">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">How It Works</h2>
              <p className="landing-section-description">
                Create your professional resume in three simple steps.
              </p>
            </div>
            <div className="steps-grid">
              {[
                {
                  step: "01",
                  title: "Fill Your Information",
                  description: "Enter your personal details, education, work experience, projects, skills, and certifications through our intuitive form."
                },
                {
                  step: "02",
                  title: "Customize & Order",
                  description: "Drag and drop to reorder sections, show/hide sections, and customize your skills categories to match your expertise."
                },
                {
                  step: "03",
                  title: "Download PDF",
                  description: "Get your professionally formatted resume as a high-quality PDF, ready for job applications."
                }
              ].map((step, index) => (
                  <div key={index} className="step-card">
                    <div className="step-number">{step.step}</div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creator Section */}
        <section className="creator-section">
          <div className="container">
            <div className="creator-content">
              <h2 className="creator-title">Created by Ashish Choudhary</h2>
              <p className="creator-description">
                Full-stack developer passionate about creating tools that make professional life easier.
              </p>
              <div className="creator-links">
                <a
                    href="https://www.linkedin.com/in/ashish110411/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="creator-link"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                    href="https://github.com/Ashish110411"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="creator-link"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a
                    href="https://ashish110411.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="creator-link"
                >
                  <Globe size={24} />
                  Portfolio
                </a>
                <a
                    href="mailto:ashishchaudhary110411@gmail.com"
                    className="creator-link"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                  </svg>
                  Email
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Build Your Perfect Resume?</h2>
              <p className="cta-description">
                Transform your professional story into a stunning resume that stands out.
              </p>
              <button onClick={handleGetStarted} className="btn-primary btn-large">
                Start Creating Your Resume
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>

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
                  Professional resume generator with LaTeX precision for modern job seekers.
                </p>
              </div>
              <div className="footer-links">
                <div className="footer-column">
                  <h4 className="footer-heading">Connect</h4>
                  <ul className="footer-list">
                    <li><a href="https://github.com/Ashish110411" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                    <li><a href="https://www.linkedin.com/in/ashish110411/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                    <li><a href="mailto:ashishchaudhary110411@gmail.com">Contact</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>
                © 2025 ResuGen. Built with ❤️ by{' '}
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