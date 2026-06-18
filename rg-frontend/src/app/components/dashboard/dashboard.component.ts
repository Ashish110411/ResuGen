import { Component, OnInit, ViewChild } from '@angular/core';
import { ResumeFormComponent } from './resume-form/resume-form.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(ResumeFormComponent) resumeFormComp?: ResumeFormComponent;

  showTutorial = false;
  currentStep = 0;
  activePanel = '';
  stepChanging = false;

  tutorialSteps = [
    {
      title: 'Sidebar Panel',
      description: 'Use the sidebar to create new resumes, select a saved resume to edit, switch dark/light themes, or log out of your account.',
      panel: 'sidebar',
      elementId: 'tutorial-sidebar',
      expandSection: null
    },
    {
      title: 'Navbar Actions',
      description: 'Use these action buttons to download documents, compile the LaTeX code manually, reset form data, or save/rename your resume.',
      panel: 'form',
      elementId: 'tutorial-action-buttons',
      expandSection: null
    },
    {
      title: 'Rename & Save',
      description: 'Enter a custom name for your resume here. It will automatically save when you click outside or focus on another field.',
      panel: 'form',
      elementId: 'tutorial-resume-title',
      expandSection: null
    },
    {
      title: 'Basic Details',
      description: 'Provide your personal details, email, links to GitHub/LinkedIn, and your career objective in this section.',
      panel: 'form',
      elementId: 'tutorial-personal-info',
      expandSection: 'objective'
    },
    {
      title: 'Education',
      description: 'Add your academic history, degrees, graduation dates, and GPA/CGPA credentials.',
      panel: 'form',
      elementId: 'tutorial-education',
      expandSection: 'education'
    },
    {
      title: 'Projects',
      description: 'Showcase your software projects, repositories, live URLs, and descriptions of what you built.',
      panel: 'form',
      elementId: 'tutorial-projects',
      expandSection: 'projects'
    },
    {
      title: 'Work Experience',
      description: 'Detail your professional history, company names, job roles, durations, and key achievements.',
      panel: 'form',
      elementId: 'tutorial-experience',
      expandSection: 'experience'
    },
    {
      title: 'Spacing Controls',
      description: 'Fine-tune the vertical spacing between titles, experiences, and project bullets to fit your content perfectly on a single page.',
      panel: 'form',
      elementId: 'tutorial-experience-spacing',
      expandSection: 'spacing'
    },
    {
      title: 'Skills',
      description: 'Categorize your technical skills (languages, frameworks, tools) and list specific technologies.',
      panel: 'form',
      elementId: 'tutorial-skills',
      expandSection: 'skills'
    },
    {
      title: 'Certifications',
      description: 'Add professional certifications, licensing, training, or relevant courses with external links.',
      panel: 'form',
      elementId: 'tutorial-certifications',
      expandSection: 'certifications'
    },
    {
      title: 'Extracurricular / Custom',
      description: 'Add extracurricular accomplishments or custom sections tailored to your personal resume needs.',
      panel: 'form',
      elementId: 'tutorial-custom-sections',
      expandSection: 'custom'
    },
    {
      title: 'Section Reordering & Visibility',
      description: 'Drag and drop items to reorder the sections on your resume. Toggle the checkmarks to show or hide sections instantly.',
      panel: 'form',
      elementId: 'tutorial-section-manager',
      expandSection: 'section-manager'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    const completed = localStorage.getItem('tutorialCompleted');
    if (completed !== 'true') {
      setTimeout(() => {
        this.startTutorial();
      }, 1000);
    }
  }

  startTutorial(): void {
    this.showTutorial = true;
    this.currentStep = 0;
    this.activePanel = this.tutorialSteps[0].panel;
    this.updateHighlight();
  }

  nextStep(): void {
    if (this.currentStep < this.tutorialSteps.length - 1) {
      this.stepChanging = true;
      setTimeout(() => {
        this.currentStep++;
        this.activePanel = this.tutorialSteps[this.currentStep].panel;
        this.updateHighlight();
        this.stepChanging = false;
      }, 150);
    } else {
      this.finishTutorial();
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.stepChanging = true;
      setTimeout(() => {
        this.currentStep--;
        this.activePanel = this.tutorialSteps[this.currentStep].panel;
        this.updateHighlight();
        this.stepChanging = false;
      }, 150);
    }
  }

  skipTutorial(): void {
    this.finishTutorial();
  }

  finishTutorial(): void {
    this.showTutorial = false;
    this.activePanel = '';
    // Remove highlight class from all elements
    document.querySelectorAll('.tutorial-highlight-glow').forEach(el => {
      el.classList.remove('tutorial-highlight-glow');
    });
    this.resumeFormComp?.restoreAllSections();
    localStorage.setItem('tutorialCompleted', 'true');
  }

  updateHighlight(): void {
    // Remove highlight class from all elements
    document.querySelectorAll('.tutorial-highlight-glow').forEach(el => {
      el.classList.remove('tutorial-highlight-glow');
    });

    const activeStep = this.tutorialSteps[this.currentStep];
    if (activeStep) {
      // Toggle expansion inside child components
      if (this.resumeFormComp) {
        if (activeStep.expandSection) {
          this.resumeFormComp.expandSectionForTutorial(activeStep.expandSection);
        } else {
          this.resumeFormComp.collapseAllSections();
        }
      }

      if (activeStep.elementId) {
        setTimeout(() => {
          const el = document.getElementById(activeStep.elementId);
          if (el) {
            el.classList.add('tutorial-highlight-glow');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }
}
