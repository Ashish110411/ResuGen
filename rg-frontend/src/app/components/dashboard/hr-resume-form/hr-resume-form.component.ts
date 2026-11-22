import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription, debounceTime } from 'rxjs';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HrLatexService } from '../../../services/hr-latex.service';
import { ThemeService } from '../../../services/theme.service';
import { TemplateService } from '../../../services/template.service';
import { ResumeService } from '../../../services/resume.service';
import { HrResumeData, HrCustomSection, isSdeResume } from '../../../models/hr-resume.models';
import { ResumeDto } from '../../../models/resume.models';
import { parseErrorMessage } from '../../../utils/error-handler';

@Component({
  selector: 'app-hr-resume-form',
  templateUrl: './hr-resume-form.component.html',
  styleUrls: ['./hr-resume-form.component.css']
})
export class HrResumeFormComponent implements OnInit, OnDestroy {
  resumeForm!: FormGroup;

  // Save modal state
  saveModalOpen = false;
  saveResumeName = '';
  isSaving = false;
  activeResumeId: number | null = null;

  // Months and Years for dropdowns
  readonly months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly years: string[] = Array.from({ length: 45 }, (_, i) => (new Date().getFullYear() + 5 - i).toString());

  // Section order & visibility
  sectionOrder: string[] = [
    'summary',
    'keySkills',
    'experience',
    'education',
    'certifications',
    'technicalSkills',
    'achievements',
    'languages'
  ];

  visibleSections: Set<string> = new Set([
    'summary',
    'keySkills',
    'experience',
    'education',
    'certifications',
    'technicalSkills',
    'achievements',
    'languages'
  ]);

  // Column assignment map: Left (70%) vs Right (30%)
  sectionColumnMap: { [key: string]: 'left' | 'right' } = {
    summary: 'left',
    experience: 'left',
    education: 'left',
    keySkills: 'right',
    technicalSkills: 'right',
    certifications: 'right',
    achievements: 'right',
    languages: 'right'
  };

  customSections: HrCustomSection[] = [];

  // Collapsible section accordion states
  sectionOpenStates: { [key: string]: boolean } = {
    personalInfo: true,
    summary: false,
    keySkills: false,
    experience: false,
    education: false,
    certifications: false,
    technicalSkills: false,
    achievements: false,
    languages: false,
    sectionManager: false
  };

  // Preview & Compile state
  pdfUrl: SafeResourceUrl | null = null;
  rawPdfUrlString: string | null = null;
  isCompiling = false;
  compilationError = '';
  lastSavedTime = new Date();
  isOnline = navigator.onLine;
  previewMode: 'pdf' | 'latex' = 'pdf';
  latexCode = '';
  downloadModalOpen = false;
  isCopied = false;
  resetAfterSave = false;

  private sub = new Subscription();
  private compileTimer: any = null;
  private compileSub?: Subscription;
  private lastCompiledLatexString: string = '';
  private clientPdfCache = new Map<string, Blob>();

  constructor(
    private fb: FormBuilder,
    private hrLatexService: HrLatexService,
    public themeService: ThemeService,
    public templateService: TemplateService,
    private resumeService: ResumeService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    // Listen to active resume ID changes from sidebar
    this.sub.add(
      this.resumeService.activeResumeId$.subscribe((id) => {
        if (this.templateService.currentTemplate === 'hr') {
          if (id !== null && id !== this.activeResumeId) {
            this.loadResume(id);
          } else if (id === null && this.activeResumeId !== null) {
            this.resetForm();
          }
        }
      })
    );

    // Listen to create new resume trigger (Save & New or Discard & New)
    this.sub.add(
      this.resumeService.createNewResumeTrigger$.subscribe((action) => {
        if (action === 'discard') {
          this.resetForm();
          this.resumeService.activeResumeId$.next(null);
          this.autoSaveAndCompile(0);
        } else if (action === 'save') {
          if (this.activeResumeId) {
            this.saveResume(() => {
              this.resetForm();
              this.resumeService.activeResumeId$.next(null);
              this.autoSaveAndCompile(0);
            });
          } else {
            if (!this.resumeForm.get('name')?.value || this.resumeForm.get('name')?.value === 'Untitled HR Resume') {
              const pName = this.resumeForm.get('personalInfo.name')?.value;
              const autoName = pName ? `${pName} HR Resume` : `HR Resume ${new Date().toLocaleDateString()}`;
              this.resumeForm.patchValue({ name: autoName });
            }
            this.saveResume(() => {
              this.resetForm();
              this.resumeService.activeResumeId$.next(null);
              this.autoSaveAndCompile(0);
            });
          }
        }
      })
    );

    // Initial compile
    setTimeout(() => {
      this.handleCompile();
    }, 200);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.compileSub) {
      this.compileSub.unsubscribe();
    }
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
    if (this.compileTimer) {
      clearTimeout(this.compileTimer);
    }
    this.clientPdfCache.clear();
    this.revokePdfUrl();
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  updateOnlineStatus(): void {
    this.isOnline = navigator.onLine;
  }

  initForm(): void {
    this.resumeForm = this.fb.group({
      name: ['Untitled HR Resume', [Validators.required]],
      personalInfo: this.fb.group({
        name: ['', [Validators.required]],
        headline: [''],
        phone: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        location: [''],
        linkedin: [''],
        portfolio: [''],
        summary: [''],
        hyperlinks: this.fb.array([])
      }),
      experience: this.fb.array([]),
      education: this.fb.array([]),
      keySkills: this.fb.array([]),
      technicalSkills: this.fb.array([]),
      certifications: this.fb.array([]),
      achievements: this.fb.array([]),
      languages: this.fb.array([])
    });

    // Setup debounced auto-compile on value changes
    this.sub.add(
      this.resumeForm.valueChanges.pipe(
        debounceTime(400)
      ).subscribe(() => {
        this.autoSaveAndCompile(0);
      })
    );
  }

  loadDefaultHrData(): void {
    // 1. Experience
    this.addExperience(
      'Acme Corporation',
      'HR Executive / HR Assistant',
      'New York, USA',
      'Jan 2024 -- Present',
      'Jan',
      '2024',
      '',
      '',
      true,
      [
        'Managed recruitment and selection activities for multiple business units.',
        'Screened resumes and shortlisted suitable candidates for interviews.',
        'Coordinated interviews between candidates and hiring managers.',
        'Maintained employee records and HR documentation with 100% compliance.',
        'Assisted with employee onboarding, orientation, and induction programs.',
        'Supported attendance, leave management, and payroll coordination.'
      ]
    );

    this.addExperience(
      'Global Talent Solutions',
      'HR Intern / HR Trainee',
      'Boston, USA',
      'Jun 2023 -- Dec 2023',
      'Jun',
      '2023',
      'Dec',
      '2023',
      false,
      [
        'Assisted in sourcing and screening candidates across job portals.',
        'Scheduled interviews and communicated professionally with applicants.',
        'Updated employee databases and maintained organized HR files.',
        'Supported daily HR administrative and employee engagement activities.'
      ]
    );

    // 2. Education
    this.addEducation(
      'State University of New York',
      'B.B.A. in Human Resource Management',
      'Albany, USA',
      '2020 -- 2024',
      'Aug',
      '2020',
      'May',
      '2024',
      false
    );
    this.addEducation(
      'Central High School',
      'Higher Secondary Education',
      'New York, USA',
      '2018 -- 2020',
      'Aug',
      '2018',
      'May',
      '2020',
      false
    );

    // 3. Key Skills
    const defaultKeySkills = [
      'Recruitment',
      'Talent Acquisition',
      'Employee Relations',
      'Onboarding',
      'HR Administration',
      'Payroll Coordination',
      'Performance Management',
      'Employee Engagement',
      'Training and Development',
      'Conflict Resolution',
      'Communication',
      'Time Management'
    ];
    defaultKeySkills.forEach(skill => this.addKeySkill(skill));

    // 4. Technical Skills
    const defaultTechSkills = [
      'MS Word',
      'MS Excel',
      'MS PowerPoint',
      'Google Workspace',
      'HRMS Software',
      'ATS Tools'
    ];
    defaultTechSkills.forEach(s => this.addTechnicalSkill(s));

    // 5. Certifications
    const defaultCerts = [
      'HR Management Certificate',
      'Talent Acquisition Specialist',
      'Payroll Management Fundamentals',
      'Advanced Excel for HR',
      'HR Analytics & Metrics'
    ];
    defaultCerts.forEach(c => this.addCertification(c));

    // 6. Achievements
    const defaultAchievements = [
      'Successfully coordinated recruitment activities resulting in 25+ successful hires.',
      'Participated in organizing quarterly employee engagement programs with 95% satisfaction.',
      'Completed comprehensive HR internship training with top performance distinction.'
    ];
    defaultAchievements.forEach(a => this.addAchievement(a));

    // 7. Languages
    const defaultLanguages = ['English (Fluent)', 'Spanish (Conversational)', 'Hindi (Fluent)'];
    defaultLanguages.forEach(l => this.addLanguage(l));

    // 8. Custom section default: Other Interests
    this.customSections.push({
      id: 'customSection-1',
      name: 'Other Interests',
      points: ['Reading Industry Books', 'Learning New HR Skills', 'Team Volunteering Activities']
    });
    this.sectionOrder.push('customSection-1');
    this.visibleSections.add('customSection-1');
    this.sectionColumnMap['customSection-1'] = 'right';
  }

  // Getters for FormArrays
  get experience(): FormArray {
    return this.resumeForm.get('experience') as FormArray;
  }
  get education(): FormArray {
    return this.resumeForm.get('education') as FormArray;
  }
  get keySkills(): FormArray {
    return this.resumeForm.get('keySkills') as FormArray;
  }
  get technicalSkills(): FormArray {
    return this.resumeForm.get('technicalSkills') as FormArray;
  }
  get certifications(): FormArray {
    return this.resumeForm.get('certifications') as FormArray;
  }
  get achievements(): FormArray {
    return this.resumeForm.get('achievements') as FormArray;
  }
  get languages(): FormArray {
    return this.resumeForm.get('languages') as FormArray;
  }
  get hyperlinks(): FormArray {
    return this.resumeForm.get('personalInfo.hyperlinks') as FormArray;
  }

  addHyperlink(name: string = '', url: string = ''): void {
    this.hyperlinks.push(this.fb.group({
      name: [name, Validators.required],
      url: [url, Validators.required]
    }));
  }

  removeHyperlink(idx: number): void {
    this.hyperlinks.removeAt(idx);
  }

  // Experience methods
  addExperience(
    company = '',
    position = '',
    location = '',
    duration = '',
    startMonth = '',
    startYear = '',
    endMonth = '',
    endYear = '',
    current = false,
    achievements: string[] = ['']
  ): void {
    const achArray = this.fb.array(achievements.map(a => this.fb.control(a)));
    this.experience.push(this.fb.group({
      company: [company, Validators.required],
      position: [position, Validators.required],
      location: [location],
      duration: [duration],
      startMonth: [startMonth],
      startYear: [startYear],
      endMonth: [endMonth],
      endYear: [endYear],
      current: [current],
      achievements: achArray
    }));
  }
  removeExperience(idx: number): void {
    this.experience.removeAt(idx);
    this.autoSaveAndCompile(0);
  }
  addExperienceAchievement(expIdx: number, val = ''): void {
    const achs = this.experience.at(expIdx).get('achievements') as FormArray;
    achs.push(this.fb.control(val));
    this.autoSaveAndCompile(0);
  }
  removeExperienceAchievement(expIdx: number, achIdx: number): void {
    const achs = this.experience.at(expIdx).get('achievements') as FormArray;
    achs.removeAt(achIdx);
    this.autoSaveAndCompile(0);
  }

  // Education methods
  addEducation(
    institution = '',
    degree = '',
    location = '',
    year = '',
    startMonth = '',
    startYear = '',
    endMonth = '',
    endYear = '',
    current = false
  ): void {
    this.education.push(this.fb.group({
      institution: [institution, Validators.required],
      degree: [degree, Validators.required],
      location: [location],
      year: [year],
      startMonth: [startMonth],
      startYear: [startYear],
      endMonth: [endMonth],
      endYear: [endYear],
      current: [current]
    }));
  }
  removeEducation(idx: number): void {
    this.education.removeAt(idx);
    this.autoSaveAndCompile(0);
  }

  // Key Skills methods
  addKeySkill(val = ''): void {
    this.keySkills.push(this.fb.control(val, Validators.required));
  }
  removeKeySkill(idx: number): void {
    this.keySkills.removeAt(idx);
    this.autoSaveAndCompile(0);
  }

  // Technical Skills methods
  addTechnicalSkill(val = ''): void {
    this.technicalSkills.push(this.fb.control(val, Validators.required));
  }
  removeTechnicalSkill(idx: number): void {
    this.technicalSkills.removeAt(idx);
    this.autoSaveAndCompile(0);
  }

  // Certifications methods
  addCertification(val = ''): void {
    this.certifications.push(this.fb.control(val, Validators.required));
  }
  removeCertification(idx: number): void {
    this.certifications.removeAt(idx);
    this.autoSaveAndCompile(0);
  }

  // Achievements methods
  addAchievement(val = ''): void {
    this.achievements.push(this.fb.control(val, Validators.required));
  }
  removeAchievement(idx: number): void {
    this.achievements.removeAt(idx);
    this.autoSaveAndCompile(0);
  }

  // Languages methods
  addLanguage(val = ''): void {
    this.languages.push(this.fb.control(val, Validators.required));
  }
  removeLanguage(idx: number): void {
    this.languages.removeAt(idx);
    this.autoSaveAndCompile(0);
  }

  // Custom Sections
  addCustomSection(): void {
    const id = `customSection-${this.customSections.length + 1}`;
    this.customSections.push({
      id,
      name: 'Custom Section',
      points: ['']
    });
    this.sectionOrder.push(id);
    this.visibleSections.add(id);
    this.sectionColumnMap[id] = 'right';
    this.autoSaveAndCompile(0);
  }
  removeCustomSection(id: string): void {
    this.customSections = this.customSections.filter(cs => cs.id !== id);
    this.sectionOrder = this.sectionOrder.filter(so => so !== id);
    this.visibleSections.delete(id);
    delete this.sectionColumnMap[id];
    this.autoSaveAndCompile(0);
  }
  updateCustomSectionName(id: string, name: string): void {
    const section = this.customSections.find(cs => cs.id === id);
    if (section) {
      section.name = name;
      this.autoSaveAndCompile(400);
    }
  }
  addCustomSectionPoint(idx: number): void {
    this.customSections[idx].points.push('');
    this.autoSaveAndCompile(0);
  }
  removeCustomSectionPoint(idx: number, ptIdx: number): void {
    this.customSections[idx].points.splice(ptIdx, 1);
    this.autoSaveAndCompile(0);
  }
  updateCustomSectionPoint(idx: number, ptIdx: number, val: string): void {
    this.customSections[idx].points[ptIdx] = val;
    this.autoSaveAndCompile(400);
  }

  // Column toggle
  setSectionColumn(sectionId: string, col: 'left' | 'right'): void {
    this.sectionColumnMap[sectionId] = col;
    this.autoSaveAndCompile(0);
  }

  get leftColumnSections(): string[] {
    return this.sectionOrder.filter(id => (this.sectionColumnMap[id] || 'left') === 'left');
  }

  get rightColumnSections(): string[] {
    return this.sectionOrder.filter(id => this.sectionColumnMap[id] === 'right');
  }

  moveSectionToColumn(sectionId: string, col: 'left' | 'right'): void {
    this.sectionColumnMap[sectionId] = col;
    this.autoSaveAndCompile(0);
  }

  onColumnDrop(event: CdkDragDrop<any>, targetCol: 'left' | 'right'): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same column
      const currentList = targetCol === 'left' ? [...this.leftColumnSections] : [...this.rightColumnSections];
      moveItemInArray(currentList, event.previousIndex, event.currentIndex);
      const otherList = targetCol === 'left' ? this.rightColumnSections : this.leftColumnSections;
      this.sectionOrder = targetCol === 'left' ? [...currentList, ...otherList] : [...otherList, ...currentList];
    } else {
      // Dragged across columns
      const sourceCol = targetCol === 'left' ? 'right' : 'left';
      const sourceList = sourceCol === 'left' ? [...this.leftColumnSections] : [...this.rightColumnSections];
      const targetList = targetCol === 'left' ? [...this.leftColumnSections] : [...this.rightColumnSections];
      const movedId = sourceList[event.previousIndex];
      if (movedId) {
        this.sectionColumnMap[movedId] = targetCol;
        sourceList.splice(event.previousIndex, 1);
        targetList.splice(event.currentIndex, 0, movedId);
        this.sectionOrder = targetCol === 'left' ? [...targetList, ...sourceList] : [...sourceList, ...targetList];
      }
    }
    this.autoSaveAndCompile(0);
  }

  // Section visibility and reordering
  toggleSectionVisibility(id: string): void {
    if (this.visibleSections.has(id)) {
      this.visibleSections.delete(id);
    } else {
      this.visibleSections.add(id);
    }
    this.autoSaveAndCompile(0);
  }

  getSectionLabel(id: string): string {
    const labels: { [key: string]: string } = {
      summary: 'Professional Summary',
      keySkills: 'Key Skills',
      experience: 'Work Experience / Internship',
      education: 'Education',
      certifications: 'Certifications',
      technicalSkills: 'Technical Skills',
      achievements: 'Achievements',
      languages: 'Languages'
    };
    if (labels[id]) return labels[id];
    if (id.startsWith('customSection-')) {
      const cs = this.customSections.find(c => c.id === id);
      return cs ? cs.name : 'Custom Section';
    }
    return id;
  }

  getSectionIcon(id: string): string {
    const icons: { [key: string]: string } = {
      summary: 'badge',
      keySkills: 'star',
      experience: 'work',
      education: 'school',
      certifications: 'workspace_premium',
      technicalSkills: 'build',
      achievements: 'military_tech',
      languages: 'translate'
    };
    if (icons[id]) return icons[id];
    return 'category';
  }

  toggleAccordion(section: string): void {
    this.sectionOpenStates[section] = !this.sectionOpenStates[section];
  }

  // Save Modal
  openSaveModal(): void {
    this.saveResumeName = this.resumeForm.get('name')?.value || 'HR Professional Resume';
    this.saveModalOpen = true;
    this.cdr.detectChanges();
  }

  closeSaveModal(): void {
    this.saveModalOpen = false;
    this.cdr.detectChanges();
  }

  confirmSaveResume(): void {
    if (!this.saveResumeName || !this.saveResumeName.trim()) {
      alert('Please enter a valid resume name.');
      return;
    }
    this.resumeForm.patchValue({ name: this.saveResumeName.trim() });
    const shouldReset = this.resetAfterSave;
    this.resetAfterSave = false;
    this.saveResume(() => {
      if (shouldReset) {
        this.resetForm();
        this.resumeService.activeResumeId$.next(null);
        this.autoSaveAndCompile(0);
      }
    });
    this.saveModalOpen = false;
    this.cdr.detectChanges();
  }

  saveResume(callback?: () => void): void {
    if (this.resumeForm.get('name')?.invalid) {
      alert('Please enter a valid resume name.');
      return;
    }

    this.isSaving = true;
    const hrData = this.buildHrData();
    const dataToSave = {
      ...hrData,
      templateType: 'hr'
    };

    const dto: ResumeDto = {
      name: this.resumeForm.get('name')?.value || 'HR Professional Resume',
      resumeData: JSON.stringify(dataToSave),
      sectionOrder: JSON.stringify(this.sectionOrder),
      visibleSections: JSON.stringify(Array.from(this.visibleSections)),
      vspaceSettings: JSON.stringify(this.sectionColumnMap),
      templateType: 'hr'
    };

    if (this.activeResumeId) {
      this.resumeService.updateResume(this.activeResumeId, dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.lastSavedTime = new Date();
          this.resumeService.reloadResumes$.next();
          if (callback) callback();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Error updating resume: ' + parseErrorMessage(err, 'Server error'));
        }
      });
    } else {
      this.resumeService.createResume(dto).subscribe({
        next: (saved) => {
          this.isSaving = false;
          this.activeResumeId = saved.id || null;
          this.resumeService.activeResumeId$.next(saved.id || null);
          this.lastSavedTime = new Date();
          this.resumeService.reloadResumes$.next();
          if (callback) callback();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Error creating resume: ' + parseErrorMessage(err, 'Server error'));
        }
      });
    }
  }

  loadResume(id: number): void {
    this.resumeService.getResumeById(id).subscribe({
      next: (dto) => {
        // Strict guard: if this is an SDE resume, immediately redirect to SDE portal!
        if (isSdeResume(dto)) {
          this.templateService.setTemplate('sde');
          return;
        }

        this.activeResumeId = dto.id || null;
        this.resumeForm.patchValue({
          name: dto.name
        });

        try {
          const data: any = JSON.parse(dto.resumeData);
          if (data.personalInfo) {
            this.resumeForm.get('personalInfo')?.patchValue(data.personalInfo);
            this.hyperlinks.clear();
            if (data.personalInfo.hyperlinks && Array.isArray(data.personalInfo.hyperlinks)) {
              data.personalInfo.hyperlinks.forEach((h: any) => {
                this.addHyperlink(h.name || '', h.url || '');
              });
            }
          }

          if (data.experience && Array.isArray(data.experience)) {
            this.experience.clear();
            data.experience.forEach((exp: any) => {
              this.addExperience(
                exp.company || '',
                exp.position || '',
                exp.location || '',
                exp.duration || '',
                exp.startMonth || '',
                exp.startYear || '',
                exp.endMonth || '',
                exp.endYear || '',
                !!exp.current,
                exp.achievements || ['']
              );
            });
          }

          if (data.education && Array.isArray(data.education)) {
            this.education.clear();
            data.education.forEach((edu: any) => {
              this.addEducation(
                edu.institution || '',
                edu.degree || '',
                edu.location || '',
                edu.year || '',
                edu.startMonth || '',
                edu.startYear || '',
                edu.endMonth || '',
                edu.endYear || '',
                !!edu.current
              );
            });
          }

          if (data.keySkills && Array.isArray(data.keySkills)) {
            this.keySkills.clear();
            data.keySkills.forEach((s: string) => this.addKeySkill(s));
          }

          if (data.technicalSkills && Array.isArray(data.technicalSkills)) {
            this.technicalSkills.clear();
            data.technicalSkills.forEach((s: string) => this.addTechnicalSkill(s));
          }

          if (data.certifications && Array.isArray(data.certifications)) {
            this.certifications.clear();
            data.certifications.forEach((c: string) => this.addCertification(c));
          }

          if (data.achievements && Array.isArray(data.achievements)) {
            this.achievements.clear();
            data.achievements.forEach((a: string) => this.addAchievement(a));
          }

          if (data.languages && Array.isArray(data.languages)) {
            this.languages.clear();
            data.languages.forEach((l: string) => this.addLanguage(l));
          }

          if (data.customSections && Array.isArray(data.customSections)) {
            this.customSections = data.customSections;
          }

          if (dto.sectionOrder) {
            this.sectionOrder = JSON.parse(dto.sectionOrder);
          }

          if (dto.visibleSections) {
            this.visibleSections = new Set(JSON.parse(dto.visibleSections));
          }

          if (dto.vspaceSettings) {
            try {
              const colMap = JSON.parse(dto.vspaceSettings);
              if (colMap && typeof colMap === 'object') {
                this.sectionColumnMap = { ...this.sectionColumnMap, ...colMap };
              }
            } catch (e) {}
          }
        } catch (e) {
          console.error('Error parsing HR resume data:', e);
        }

        this.handleCompile();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading resume:', err);
      }
    });
  }

  clearForm(): void {
    if (confirm('Are you sure you want to reset all form fields? This will clear all entered content.')) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.activeResumeId = null;
    this.resumeForm.reset({
      name: 'Untitled HR Resume',
      personalInfo: {
        name: '',
        headline: '',
        phone: '',
        email: '',
        location: '',
        linkedin: '',
        portfolio: '',
        summary: ''
      }
    });
    this.experience.clear();
    this.education.clear();
    this.keySkills.clear();
    this.technicalSkills.clear();
    this.certifications.clear();
    this.achievements.clear();
    this.languages.clear();
    this.hyperlinks.clear();
    this.customSections = [];
    this.sectionOrder = [
      'summary',
      'keySkills',
      'experience',
      'education',
      'certifications',
      'technicalSkills',
      'achievements',
      'languages'
    ];
    this.visibleSections = new Set(this.sectionOrder);
    this.sectionColumnMap = {
      summary: 'left',
      experience: 'left',
      education: 'left',
      keySkills: 'right',
      technicalSkills: 'right',
      certifications: 'right',
      achievements: 'right',
      languages: 'right'
    };
    this.pdfUrl = null;
    this.rawPdfUrlString = null;
    this.lastCompiledLatexString = '';
    this.cdr.detectChanges();
  }

  // Debounced Compilation
  autoSaveAndCompile(delayMs: number = 300): void {
    if (this.compileTimer) {
      clearTimeout(this.compileTimer);
      this.compileTimer = null;
    }

    if (delayMs <= 0) {
      this.handleCompile();
      return;
    }

    this.compileTimer = setTimeout(() => {
      this.compileTimer = null;
      this.handleCompile();
    }, delayMs);
  }

  buildHrData(): HrResumeData {
    return {
      personalInfo: this.resumeForm.get('personalInfo')?.value,
      education: this.education.value,
      experience: this.experience.value,
      keySkills: this.keySkills.value,
      technicalSkills: this.technicalSkills.value,
      certifications: this.certifications.value,
      achievements: this.achievements.value,
      languages: this.languages.value,
      customSections: this.customSections
    };
  }

  handleCompile(): void {
    if (this.compileTimer) {
      clearTimeout(this.compileTimer);
      this.compileTimer = null;
    }

    if (!this.isOnline) {
      this.compilationError = 'No internet connection. Unable to compile.';
      return;
    }

    const hrData = this.buildHrData();
    const latexString = this.hrLatexService.generateHrLatex(
      hrData,
      this.sectionOrder,
      this.visibleSections,
      this.sectionColumnMap
    );

    if (this.pdfUrl && latexString === this.lastCompiledLatexString) {
      return;
    }

    // Client-side cache check (0ms response, 0 server load)
    if (this.clientPdfCache.has(latexString)) {
      const cachedBlob = this.clientPdfCache.get(latexString)!;
      this.lastCompiledLatexString = latexString;
      this.revokePdfUrl();
      this.rawPdfUrlString = URL.createObjectURL(cachedBlob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrlString + '#view=FitH&toolbar=0');
      this.isCompiling = false;
      this.cdr.detectChanges();
      return;
    }

    if (this.compileSub) {
      this.compileSub.unsubscribe();
      this.compileSub = undefined;
    }

    this.isCompiling = true;
    this.compilationError = '';
    this.latexCode = latexString;

    const compilerUrl = 'http://localhost:8888/builds/sync';

    this.compileSub = this.http.post(compilerUrl, {
      compiler: 'pdflatex',
      resources: [
        { path: 'main.tex', content: latexString }
      ]
    }, { responseType: 'blob' }).subscribe({
      next: (pdfBlob) => {
        this.lastCompiledLatexString = latexString;

        if (this.clientPdfCache.size >= 10) {
          const firstKey = this.clientPdfCache.keys().next().value;
          if (firstKey) this.clientPdfCache.delete(firstKey);
        }
        this.clientPdfCache.set(latexString, pdfBlob);

        this.revokePdfUrl();
        this.rawPdfUrlString = URL.createObjectURL(pdfBlob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrlString + '#view=FitH&toolbar=0');
        this.isCompiling = false;
        this.lastSavedTime = new Date();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isCompiling = false;
        this.pdfUrl = null;
        this.rawPdfUrlString = null;
        this.compilationError = 'Failed to generate PDF compiled resume. Check LaTeX markup syntax.';

        if (err && err.error && err.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const text = reader.result as string;
              const json = JSON.parse(text);
              this.compilationError = json.log || json.message || text;
            } catch (e) {
              this.compilationError = (reader.result as string) || 'Unknown compilation error';
            }
            this.cdr.detectChanges();
          };
          reader.readAsText(err.error);
        } else {
          this.compilationError = parseErrorMessage(err, 'Compilation failed');
          this.cdr.detectChanges();
        }
      }
    });
  }

  downloadPdf(): void {
    if (!this.rawPdfUrlString) return;
    const a = document.createElement('a');
    a.href = this.rawPdfUrlString;
    const fileName = (this.resumeForm.get('name')?.value || 'HR_Resume').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.downloadModalOpen = false;
  }

  downloadLatex(): void {
    const blob = new Blob([this.latexCode], { type: 'application/x-tex' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (this.resumeForm.get('name')?.value || 'HR_Resume').replace(/[^a-zA-Z0-9_-]/g, '_') + '.tex';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    this.downloadModalOpen = false;
  }

  revokePdfUrl(): void {
    if (this.rawPdfUrlString) {
      URL.revokeObjectURL(this.rawPdfUrlString);
      this.rawPdfUrlString = null;
    }
  }

  copyLatexCode(): void {
    if (!this.latexCode) return;
    navigator.clipboard.writeText(this.latexCode).then(() => {
      this.isCopied = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.isCopied = false;
        this.cdr.detectChanges();
      }, 2000);
    });
  }

  get highlightedLatex(): SafeHtml {
    if (!this.latexCode) return '';
    return this.sanitizer.bypassSecurityTrustHtml(this.syntaxHighlightLatex(this.latexCode, '#facc15'));
  }

  private syntaxHighlightLatex(code: string, tagColor: string): string {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = escaped.split('\n');
    const highlightedLines = lines.map(line => {
      const commentIndex = line.indexOf('%');
      if (commentIndex === 0) {
        return `<span style="color: #94a3b8; font-style: italic;">${line}</span>`;
      }

      let beforeComment = line;
      let commentPart = '';
      if (commentIndex > 0 && line[commentIndex - 1] !== '\\') {
        beforeComment = line.substring(0, commentIndex);
        commentPart = `<span style="color: #94a3b8; font-style: italic;">${line.substring(commentIndex)}</span>`;
      }

      let highlighted = beforeComment.replace(/(\\[a-zA-Z]+[*]?)/g, `<span style="color: ${tagColor}; font-weight: 600;">$1</span>`);

      highlighted = highlighted
        .replace(/(\{)([^\}]+)(\})/g, `<span style="color: #cbd5e1;">$1</span>$2<span style="color: #cbd5e1;">$3</span>`)
        .replace(/(\[)([^\]]+)(\])/g, `<span style="color: #e2e8f0;">$1</span>$2<span style="color: #e2e8f0;">$3</span>`);

      return highlighted + commentPart;
    });

    return highlightedLines.join('\n');
  }
}
