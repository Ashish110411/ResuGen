import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ResumeService } from '../../../services/resume.service';
import { ThemeService } from '../../../services/theme.service';
import { TemplateService } from '../../../services/template.service';
import { ResumeListDto } from '../../../models/resume.models';
import { isHrResume } from '../../../models/hr-resume.models';
import { parseErrorMessage } from '../../../utils/error-handler';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  userName = '';
  userEmail = '';
  resumes: ResumeListDto[] = [];
  activeResumeId: number | null = null;
  isDarkMode = false;
  newResumeModalOpen = false;
  newResumeStep: 'confirm' | 'select' = 'confirm';
  pendingAction: 'save' | 'discard' = 'discard';
  private sub = new Subscription();

  constructor(
    private authService: AuthService,
    private resumeService: ResumeService,
    private themeService: ThemeService,
    public templateService: TemplateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'Guest User';
    this.userEmail = this.authService.currentUserValue?.email || '';

    // Subscribe to active resume updates
    this.sub.add(
      this.resumeService.activeResumeId$.subscribe(id => this.activeResumeId = id)
    );

    // Subscribe to reload requests
    this.sub.add(
      this.resumeService.reloadResumes$.subscribe(() => this.loadResumes())
    );

    // Subscribe to theme updates
    this.sub.add(
      this.themeService.isDarkMode$.subscribe(dark => this.isDarkMode = dark)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadResumes(): void {
    this.resumeService.getAllResumes().subscribe({
      next: (list) => {
        this.resumes = list;
        // Verify each resume to guarantee accurate badge and routing
        this.resumes.forEach(r => {
          if (!r.templateType) {
            this.resumeService.getResumeById(r.id).subscribe({
              next: (dto) => {
                r.templateType = isHrResume(dto) ? 'hr' : 'sde';
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Error loading resumes:', err);
      }
    });
  }

  selectResume(resume: ResumeListDto): void {
    if (resume.templateType) {
      this.templateService.setTemplate(resume.templateType === 'hr' ? 'hr' : 'sde');
      this.resumeService.activeResumeId$.next(resume.id);
      return;
    }

    // Fallback: inspect full resume DTO before setting template
    this.resumeService.getResumeById(resume.id).subscribe({
      next: (dto) => {
        const isHr = isHrResume(dto);
        resume.templateType = isHr ? 'hr' : 'sde';
        this.templateService.setTemplate(isHr ? 'hr' : 'sde');
        this.resumeService.activeResumeId$.next(resume.id);
      },
      error: () => {
        this.resumeService.activeResumeId$.next(resume.id);
      }
    });
  }

  createNewResume(): void {
    this.newResumeStep = 'confirm';
    this.newResumeModalOpen = true;
  }

  onSaveAndProceed(): void {
    this.pendingAction = 'save';
    this.newResumeStep = 'select';
  }

  onDiscardAndProceed(): void {
    this.pendingAction = 'discard';
    this.newResumeStep = 'select';
  }

  chooseTemplateAndCreate(type: 'sde' | 'hr'): void {
    this.newResumeModalOpen = false;
    this.resumeService.createNewResumeTrigger$.next(this.pendingAction);
    this.templateService.setTemplate(type);
    this.resumeService.activeResumeId$.next(null);
  }

  closeNewResumeModal(): void {
    this.newResumeModalOpen = false;
    this.newResumeStep = 'confirm';
  }

  deleteResume(event: Event, id: number): void {
    event.stopPropagation(); // Prevent selection when clicking delete
    if (confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      this.resumeService.deleteResume(id).subscribe({
        next: () => {
          // If we deleted the active resume, deselect it
          if (this.activeResumeId === id) {
            this.resumeService.activeResumeId$.next(null);
          }
          this.resumeService.reloadResumes$.next();
        },
        error: (err) => {
          alert('Error deleting resume: ' + parseErrorMessage(err, 'Server error'));
        }
      });
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.resumeService.activeResumeId$.next(null);
    this.router.navigate(['/']);
  }

  getUserInitials(): string {
    if (!this.userName) return 'U';
    const parts = this.userName.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}
