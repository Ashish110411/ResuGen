import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  isLoggedIn = false;
  userName = '';
  showResumeModal = false;
  private sub = new Subscription();

  techPills = ['LaTeX Powered', 'PDF Export', 'ATS-Ready'];
  stats = [
    { label: 'Resumes Built', value: '10K+' },
    { label: 'Templates Available', value: '4' },
    { label: 'Export Formats', value: 'PDF, TEX' }
  ];

  features = [
    {
      icon: 'rocket',
      title: 'Instant Resume',
      description: 'Get started and build your resume in moments.'
    },
    {
      icon: 'layout_grid',
      title: 'Modern Designs',
      description: 'Choose clean, minimal templates that look professional.'
    },
    {
      icon: 'cloud_download',
      title: 'Easy Export',
      description: 'Download your resume as PDF or .tex with a click.'
    },
    {
      icon: 'layers',
      title: 'Flexible Sections',
      description: 'Add, remove, or rearrange sections as per your need.'
    }
  ];

  journeyFirstRow = [
    {
      icon: 'person',
      title: 'Fill in your details',
      desc: 'Enter all your personal, education, experience and project info.'
    },
    {
      icon: 'settings',
      title: 'Customize the sections',
      desc: 'Reorder, add, or remove resume sections easily.'
    },
    {
      icon: 'visibility',
      title: 'Hide/Unhide sections',
      desc: 'Show only relevant sections according to requirements, hide others.'
    }
  ];

  journeySecondRow = [
    {
      icon: 'check_circle',
      title: 'Check the live preview',
      desc: 'See your resume as you edit, in real-time PDF.'
    },
    {
      icon: 'download_for_offline',
      title: 'Download PDF',
      desc: 'If happy, download your professional PDF resume.'
    },
    {
      icon: 'open_in_new',
      title: 'Edit in Overleaf',
      desc: 'For advanced changes, download .tex and edit at overleaf.com.'
    }
  ];

  get reversedSecondRow() {
    return [...this.journeySecondRow].reverse();
  }

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.userName = this.authService.getUserName() || 'User';
    }

    this.sub.add(
      this.themeService.isDarkMode$.subscribe(dark => this.isDarkMode = dark)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getStarted(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/builder']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openPreviewModal(): void {
    this.showResumeModal = true;
  }

  closePreviewModal(): void {
    this.showResumeModal = false;
  }
}
