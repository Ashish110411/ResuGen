import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ResumeService } from '../../../services/resume.service';
import { LatexService } from '../../../services/latex.service';
import { ThemeService } from '../../../services/theme.service';
import { TemplateService } from '../../../services/template.service';
import { isHrResume } from '../../../models/hr-resume.models';
import { ResumeData, SpacingSettings, ResumeDto, CustomSection } from '../../../models/resume.models';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { parseErrorMessage } from '../../../utils/error-handler';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { EducationComponent } from './components/education/education.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { SkillsComponent } from './components/skills/skills.component';
import { CertificationsComponent } from './components/certifications/certifications.component';
import { CustomSectionsComponent } from './components/custom-sections/custom-sections.component';
import { SectionManagerComponent } from './components/section-manager/section-manager.component';

@Component({
  selector: 'app-resume-form',
  templateUrl: './resume-form.component.html',
  styleUrls: ['./resume-form.component.css']
})
export class ResumeFormComponent implements OnInit, OnDestroy {
  @Input() tutorialActiveStep: number | null = null;
  @Input() tutorialActivePanel: string | null = null;
  @Output() startTutorialRequested = new EventEmitter<void>();

  @ViewChild(PersonalInfoComponent) personalInfoComp?: PersonalInfoComponent;
  @ViewChild(EducationComponent) educationComp?: EducationComponent;
  @ViewChild(ExperienceComponent) experienceComp?: ExperienceComponent;
  @ViewChild(ProjectsComponent) projectsComp?: ProjectsComponent;
  @ViewChild(SkillsComponent) skillsComp?: SkillsComponent;
  @ViewChild(CertificationsComponent) certificationsComp?: CertificationsComponent;
  @ViewChild(SectionManagerComponent) sectionManagerComp?: SectionManagerComponent;
  @ViewChildren(CustomSectionsComponent) customSectionsComps?: QueryList<CustomSectionsComponent>;

  activeResumeId: number | null = null;
  resumeForm!: FormGroup;

  // Spacing & Section control variables
  sectionOrder: string[] = ['objective', 'education', 'projects', 'experience', 'skills', 'certifications'];
  visibleSections: Set<string> = new Set(['objective', 'education', 'projects', 'experience', 'skills', 'certifications']);
  vspaceSettings: SpacingSettings = {
    experience: { afterJobTitle: 0, betweenExperiences: 0, betweenAchievements: -0.5 },
    projects: { afterProjectTitle: 0, betweenProjects: 0 }
  };

  // Compile & Preview state
  pdfUrl: SafeResourceUrl | null = null;
  rawPdfUrlString: string | null = null;
  isCompiling = false;
  compilationError = '';
  lastSavedTime = new Date();
  isOnline = navigator.onLine;
  previewMode: 'pdf' | 'latex' = 'pdf';
  latexCode = '';
  saveModalOpen = false;
  saveResumeName = '';
  downloadModalOpen = false;
  isSaving = false;
  resetAfterSave = false;
  isCopied = false;



  private sub = new Subscription();
  private formSub = new Subscription();
  private compileTimer: any = null;
  private compileSub?: Subscription;
  private lastCompiledLatexString: string = '';
  private clientPdfCache = new Map<string, Blob>();
  private customSectionSubject = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private resumeService: ResumeService,
    private latexService: LatexService,
    public themeService: ThemeService,
    public templateService: TemplateService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();

    // Check online status
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    // Listen to selected resume changes from the sidebar
    this.sub.add(
      this.resumeService.activeResumeId$.subscribe(id => {
        this.activeResumeId = id;
        if (id !== null) {
          this.loadResume(id);
        } else {
          this.resetForm();
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
            if (!this.resumeForm.get('name')?.value || this.resumeForm.get('name')?.value === 'Resume') {
              const pName = this.resumeForm.get('personalInfo.name')?.value;
              const autoName = pName ? `${pName} Resume` : `SDE Resume ${new Date().toLocaleDateString()}`;
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

    // Initial sidebar load trigger
    this.resumeService.reloadResumes$.next();

    // Trigger auto-compile on custom section changes with fast debounce
    this.sub.add(
      this.customSectionSubject.pipe(
        debounceTime(400)
      ).subscribe(() => {
        this.autoSaveAndCompile(0);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.formSub.unsubscribe();
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

  updateOnlineStatus(): void {
    this.isOnline = navigator.onLine;
  }

  triggerTutorial(): void {
    this.startTutorialRequested.emit();
  }

  expandSectionForTutorial(sectionId: string): void {
    // Clean up empty entries added by the tutorial first
    this.cleanupAddedTutorialEntries();

    // 1. Collapse all first
    if (this.educationComp) this.educationComp.isOpen = false;
    if (this.experienceComp) {
      this.experienceComp.isOpen = false;
      this.experienceComp.vspaceOpen = false;
    }
    if (this.projectsComp) {
      this.projectsComp.isOpen = false;
      this.projectsComp.vspaceOpen = false;
    }
    if (this.skillsComp) this.skillsComp.isOpen = false;
    if (this.certificationsComp) this.certificationsComp.isOpen = false;
    if (this.sectionManagerComp) this.sectionManagerComp.isOpen = false;
    if (this.customSectionsComps) {
      this.customSectionsComps.forEach(comp => comp.isOpen = false);
    }

    // 2. Expand the targeted section
    if (sectionId === 'education' && this.educationComp) {
      if (this.education.length === 0) {
        this.addEducation();
      }
      this.educationComp.isOpen = true;
    } else if (sectionId === 'experience' && this.experienceComp) {
      if (this.experience.length === 0) {
        this.addExperience();
      }
      this.experienceComp.isOpen = true;
    } else if (sectionId === 'projects' && this.projectsComp) {
      if (this.projects.length === 0) {
        this.addProject();
      }
      this.projectsComp.isOpen = true;
    } else if (sectionId === 'spacing' && this.experienceComp && this.projectsComp) {
      if (this.experience.length === 0) {
        this.addExperience();
      }
      if (this.projects.length === 0) {
        this.addProject();
      }
      this.experienceComp.isOpen = true;
      this.experienceComp.vspaceOpen = true;
      this.projectsComp.isOpen = true;
      this.projectsComp.vspaceOpen = true;
    } else if (sectionId === 'skills' && this.skillsComp) {
      this.skillsComp.isOpen = true;
    } else if (sectionId === 'certifications' && this.certificationsComp) {
      if (this.certifications.length === 0) {
        this.addCertification();
      }
      this.certificationsComp.isOpen = true;
    } else if (sectionId === 'custom' && this.customSectionsComps) {
      if (this.customSectionList.length === 0) {
        this.addCustomSection();
      }
      this.customSectionsComps.forEach(comp => comp.isOpen = true);
    } else if (sectionId === 'section-manager' && this.sectionManagerComp) {
      this.sectionManagerComp.isOpen = true;
    }
    this.cdr.detectChanges();
  }

  collapseAllSections(): void {
    if (this.educationComp) this.educationComp.isOpen = false;
    if (this.experienceComp) {
      this.experienceComp.isOpen = false;
      this.experienceComp.vspaceOpen = false;
    }
    if (this.projectsComp) {
      this.projectsComp.isOpen = false;
      this.projectsComp.vspaceOpen = false;
    }
    if (this.skillsComp) this.skillsComp.isOpen = false;
    if (this.certificationsComp) this.certificationsComp.isOpen = false;
    if (this.sectionManagerComp) this.sectionManagerComp.isOpen = false;
    if (this.customSectionsComps) {
      this.customSectionsComps.forEach(comp => comp.isOpen = false);
    }
    this.cdr.detectChanges();
  }

  restoreAllSections(): void {
    // Clean up empty entries added by the tutorial
    this.cleanupAddedTutorialEntries();

    if (this.educationComp) this.educationComp.isOpen = true;
    if (this.experienceComp) {
      this.experienceComp.isOpen = true;
      this.experienceComp.vspaceOpen = false;
    }
    if (this.projectsComp) {
      this.projectsComp.isOpen = true;
      this.projectsComp.vspaceOpen = false;
    }
    if (this.skillsComp) this.skillsComp.isOpen = true;
    if (this.certificationsComp) this.certificationsComp.isOpen = true;
    if (this.sectionManagerComp) this.sectionManagerComp.isOpen = false;
    if (this.customSectionsComps) {
      this.customSectionsComps.forEach(comp => comp.isOpen = true);
    }
    this.cdr.detectChanges();
  }

  cleanupAddedTutorialEntries(): void {
    // 1. Education
    for (let i = this.education.length - 1; i >= 0; i--) {
      const val = this.education.at(i).value;
      if (!val.institution && !val.degree && !val.duration && !val.cgpa) {
        this.education.removeAt(i);
      }
    }

    // 2. Experience
    for (let i = this.experience.length - 1; i >= 0; i--) {
      const val = this.experience.at(i).value;
      if (!val.company && !val.position && !val.startMonth && !val.startYear) {
        this.experience.removeAt(i);
      }
    }

    // 3. Projects
    for (let i = this.projects.length - 1; i >= 0; i--) {
      const val = this.projects.at(i).value;
      if (!val.name && !val.github && !val.livesite) {
        this.projects.removeAt(i);
      }
    }

    // 4. Certifications
    for (let i = this.certifications.length - 1; i >= 0; i--) {
      const val = this.certifications.at(i).value;
      if (!val.title && !val.link && !val.month && !val.year) {
        this.certifications.removeAt(i);
      }
    }

    // 5. Custom Sections
    this.customSectionList = this.customSectionList.filter(cs => {
      const isEmpty = cs.name === 'Custom Section' && (cs.points.length === 0 || (cs.points.length === 1 && !cs.points[0]));
      if (isEmpty) {
        this.sectionOrder = this.sectionOrder.filter(so => so !== cs.id);
        this.visibleSections.delete(cs.id);
      }
      return !isEmpty;
    });
  }

  initForm(): void {
    this.resumeForm = this.fb.group({
      name: ['My Professional Resume', [Validators.required]],
      personalInfo: this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        linkedin: [''],
        github: [''],
        portfolio: [''],
        objective: [''],
        hyperlinks: this.fb.array([])
      }),
      education: this.fb.array([]),
      experience: this.fb.array([]),
      projects: this.fb.array([]),
      skills: this.fb.group({
        skillCategories: this.fb.array([])
      }),
      certifications: this.fb.array([])
    });

    // Load defaults if empty
    this.addDefaultItems();

    // Setup form change listener
    this.setupFormSubscription();
  }

  setupFormSubscription(): void {
    this.formSub.unsubscribe();
    this.formSub = new Subscription();
    this.formSub.add(
      this.resumeForm.valueChanges.pipe(
        debounceTime(400)
      ).subscribe(() => {
        this.autoSaveAndCompile(0);
      })
    );
  }

  addDefaultItems(): void {
    // Skills default categories
    const categories = this.skillCategories;
    if (categories.length === 0) {
      this.addSkillCategory('Programming Languages', '');
      this.addSkillCategory('Frameworks & Technologies', '');
      this.addSkillCategory('Tools & Platforms', '');
    }
  }

  resetForm(): void {
    this.activeResumeId = null;
    this.sectionOrder = ['objective', 'education', 'projects', 'experience', 'skills', 'certifications'];
    this.visibleSections = new Set(['objective', 'education', 'projects', 'experience', 'skills', 'certifications']);
    this.vspaceSettings = {
      experience: { afterJobTitle: 0, betweenExperiences: 0, betweenAchievements: -0.5 },
      projects: { afterProjectTitle: 0, betweenProjects: 0 }
    };
    this.initForm();
    this.revokePdfUrl();
    this.pdfUrl = null;
    this.rawPdfUrlString = null;
    this.latexCode = '';
    this.compilationError = '';
    this.cdr.detectChanges();
    this.handleCompile();
  }

  revokePdfUrl(): void {
    if (this.rawPdfUrlString) {
      URL.revokeObjectURL(this.rawPdfUrlString);
      this.rawPdfUrlString = null;
    }
  }

  trackBySection(index: number, item: string): string {
    return item;
  }

  // Getters for FormArrays
  get personalInfoGroup(): FormGroup {
    return this.resumeForm.get('personalInfo') as FormGroup;
  }
  get hyperlinks(): FormArray {
    return this.resumeForm.get('personalInfo.hyperlinks') as FormArray;
  }
  get education(): FormArray {
    return this.resumeForm.get('education') as FormArray;
  }
  get experience(): FormArray {
    return this.resumeForm.get('experience') as FormArray;
  }
  get projects(): FormArray {
    return this.resumeForm.get('projects') as FormArray;
  }
  get skillCategories(): FormArray {
    return this.resumeForm.get('skills.skillCategories') as FormArray;
  }
  get certifications(): FormArray {
    return this.resumeForm.get('certifications') as FormArray;
  }
  get customSections(): CustomSection[] {
    // Custom sections are represented inside ResumeData structure. Let's hold them in a localized array or separate form controls if required.
    // In our model customSections is CustomSection[]. Let's keep it simple: we can map customSections to a dynamic list.
    // Wait, in React custom sections are held in resumeData.customSections. Let's create an array for them here!
    return this.customSectionList;
  }

  customSectionList: CustomSection[] = [];

  // Methods to manipulate lists
  addHyperlink(name = '', url = ''): void {
    this.hyperlinks.push(this.fb.group({
      name: [name, Validators.required],
      url: [url, Validators.required]
    }));
  }
  removeHyperlink(idx: number): void {
    this.hyperlinks.removeAt(idx);
    this.autoSaveAndCompile();
  }

  addEducation(inst = '', dur = '', deg = '', cgpa = ''): void {
    this.education.push(this.fb.group({
      institution: [inst, Validators.required],
      duration: [dur, Validators.required],
      degree: [deg, Validators.required],
      cgpa: [cgpa]
    }));
  }
  removeEducation(idx: number): void {
    this.education.removeAt(idx);
    this.autoSaveAndCompile();
  }

  addExperience(comp = '', pos = '', sMonth = '', sYear = '', eMonth = '', eYear = '', curr = false, achievements: string[] = ['']): void {
    const achArray = this.fb.array(achievements.map(a => this.fb.control(a)));

    const expGroup = this.fb.group({
      company: [comp, Validators.required],
      position: [pos, Validators.required],
      startMonth: [sMonth],
      startYear: [sYear],
      endMonth: [{ value: eMonth, disabled: curr }],
      endYear: [{ value: eYear, disabled: curr }],
      current: [curr],
      achievements: achArray
    });

    // Listen to "Currently working here" check changes
    this.sub.add(
      expGroup.get('current')?.valueChanges.subscribe(checked => {
        const eM = expGroup.get('endMonth');
        const eY = expGroup.get('endYear');
        if (checked) {
          eM?.disable();
          eY?.disable();
        } else {
          eM?.enable();
          eY?.enable();
        }
      })
    );

    this.experience.push(expGroup);
  }
  removeExperience(idx: number): void {
    this.experience.removeAt(idx);
    this.autoSaveAndCompile();
  }

  addExperienceAchievement(expIdx: number, val = ''): void {
    const achs = this.experience.at(expIdx).get('achievements') as FormArray;
    achs.push(this.fb.control(val));
  }
  removeExperienceAchievement(expIdx: number, achIdx: number): void {
    const achs = this.experience.at(expIdx).get('achievements') as FormArray;
    achs.removeAt(achIdx);
    this.autoSaveAndCompile();
  }

  addProject(name = '', git = '', live = '', desc: string[] = ['']): void {
    const descArray = this.fb.array(desc.map(d => this.fb.control(d)));
    this.projects.push(this.fb.group({
      name: [name, Validators.required],
      github: [git],
      livesite: [live],
      description: descArray
    }));
  }
  removeProject(idx: number): void {
    this.projects.removeAt(idx);
    this.autoSaveAndCompile();
  }

  addProjectPoint(projIdx: number, val = ''): void {
    const descs = this.projects.at(projIdx).get('description') as FormArray;
    descs.push(this.fb.control(val));
  }
  removeProjectPoint(projIdx: number, ptIdx: number): void {
    const descs = this.projects.at(projIdx).get('description') as FormArray;
    descs.removeAt(ptIdx);
    this.autoSaveAndCompile();
  }

  addSkillCategory(title = '', content = ''): void {
    this.skillCategories.push(this.fb.group({
      id: [Date.now().toString() + Math.random().toString(36).substring(2, 5)],
      title: [title, Validators.required],
      content: [content]
    }));
  }
  removeSkillCategory(idx: number): void {
    this.skillCategories.removeAt(idx);
    this.autoSaveAndCompile();
  }

  addCertification(title = '', link = '', month = '', year = ''): void {
    this.certifications.push(this.fb.group({
      title: [title, Validators.required],
      link: [link],
      month: [month],
      year: [year]
    }));
  }
  removeCertification(idx: number): void {
    this.certifications.removeAt(idx);
    this.autoSaveAndCompile();
  }

  // Custom sections
  onSectionOrderOrVisibilityChange(): void {
    this.autoSaveAndCompile(0);
  }

  addCustomSection(): void {
    const newId = `customSection-${this.customSectionList.length + 1}`;
    this.customSectionList.push({
      id: newId,
      name: 'Custom Section',
      points: ['']
    });
    this.sectionOrder.push(newId);
    this.visibleSections.add(newId);
    this.autoSaveAndCompile();
  }
  removeCustomSection(id: string): void {
    this.customSectionList = this.customSectionList.filter(cs => cs.id !== id);
    this.sectionOrder = this.sectionOrder.filter(so => so !== id);
    this.visibleSections.delete(id);
    this.autoSaveAndCompile();
  }
  updateCustomSectionName(id: string, name: string): void {
    const section = this.customSectionList.find(cs => cs.id === id);
    if (section) {
      section.name = name;
      this.customSectionSubject.next();
    }
  }
  addCustomSectionPoint(csIdx: number): void {
    this.customSectionList[csIdx].points.push('');
    this.autoSaveAndCompile();
  }
  removeCustomSectionPoint(csIdx: number, ptIdx: number): void {
    this.customSectionList[csIdx].points.splice(ptIdx, 1);
    this.autoSaveAndCompile();
  }
  updateCustomSectionPoint(csIdx: number, ptIdx: number, value: string): void {
    this.customSectionList[csIdx].points[ptIdx] = value;
    this.customSectionSubject.next();
  }

  // Load existing resume
  loadResume(id: number): void {
    this.resumeService.getResumeById(id).subscribe({
      next: (dto) => {
        // Strict guard: if this is an HR resume, immediately redirect to HR portal
        if (isHrResume(dto)) {
          this.templateService.setTemplate('hr');
          return;
        }

        this.activeResumeId = dto.id || null;
        this.resumeForm.patchValue({
          name: dto.name
        });

        const data: ResumeData = JSON.parse(dto.resumeData);

        // Reset FormArrays and patch values
        this.hyperlinks.clear();
        if (data.personalInfo.hyperlinks) {
          data.personalInfo.hyperlinks.forEach(hl => this.addHyperlink(hl.name, hl.url));
        }

        this.resumeForm.get('personalInfo')?.patchValue({
          name: data.personalInfo.name,
          email: data.personalInfo.email,
          phone: data.personalInfo.phone,
          linkedin: data.personalInfo.linkedin,
          github: data.personalInfo.github,
          portfolio: data.personalInfo.portfolio,
          objective: data.personalInfo.objective
        });

        this.education.clear();
        if (data.education) {
          data.education.forEach(e => this.addEducation(e.institution, e.duration, e.degree, e.cgpa));
        }

        this.experience.clear();
        if (data.experience) {
          data.experience.forEach(e => this.addExperience(e.company, e.position, e.startMonth, e.startYear, e.endMonth, e.endYear, e.current, e.achievements));
        }

        this.projects.clear();
        if (data.projects) {
          data.projects.forEach(p => this.addProject(p.name, p.github, p.livesite, p.description));
        }

        this.skillCategories.clear();
        if (data.skills && data.skills.skillCategories) {
          data.skills.skillCategories.forEach(sc => this.addSkillCategory(sc.title, sc.content));
        }

        this.certifications.clear();
        if (data.certifications) {
          data.certifications.forEach(c => this.addCertification(c.title, c.link, c.month, c.year));
        }

        this.customSectionList = data.customSections || [];
        this.sectionOrder = JSON.parse(dto.sectionOrder);
        this.visibleSections = new Set(JSON.parse(dto.visibleSections));
        this.vspaceSettings = JSON.parse(dto.vspaceSettings);

        this.lastSavedTime = new Date();
        this.handleCompile();
      },
      error: (err) => {
        alert('Error loading resume details: ' + parseErrorMessage(err, 'Server error'));
      }
    });
  }

  // Save resume to DB
  saveResume(callback?: () => void): void {
    if (this.resumeForm.get('name')?.invalid) {
      alert('Please enter a valid resume name.');
      return;
    }

    this.isSaving = true;

    const resumeData = this.buildResumeData();

    const dto: ResumeDto = {
      name: this.resumeForm.get('name')?.value || 'Resume',
      resumeData: JSON.stringify(resumeData),
      sectionOrder: JSON.stringify(this.sectionOrder),
      visibleSections: JSON.stringify(Array.from(this.visibleSections)),
      vspaceSettings: JSON.stringify(this.vspaceSettings),
      templateType: 'sde'
    };

    if (this.activeResumeId) {
      this.resumeService.updateResume(this.activeResumeId, dto).subscribe({
        next: (saved) => {
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

  // Autosave and compile with debouncing to prevent excessive requests
  autoSaveAndCompile(delayMs: number = 300): void {
    if (this.compileTimer) {
      clearTimeout(this.compileTimer);
      this.compileTimer = null;
    }

    if (delayMs <= 0) {
      this.executeSaveAndCompile();
      return;
    }

    this.compileTimer = setTimeout(() => {
      this.compileTimer = null;
      this.executeSaveAndCompile();
    }, delayMs);
  }

  private executeSaveAndCompile(): void {
    if (this.activeResumeId !== null && this.resumeForm.valid) {
      this.saveResume();
    }
    this.handleCompile();
  }

  openSaveModal(): void {
    this.saveResumeName = this.resumeForm.get('name')?.value || 'My Professional Resume';
    this.saveModalOpen = true;
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



  closeSaveModal(): void {
    this.saveModalOpen = false;
    this.cdr.detectChanges();
  }

  // Clear data
  clearForm(): void {
    if (confirm('Are you sure you want to reset all form fields? This will clear all entered content.')) {
      this.resetForm();
    }
  }

  // Spacing updater helpers with responsive debounced compilation (350ms wait till user stops editing)
  updateVspace(section: 'experience' | 'projects', field: string, change: number): void {
    if (section === 'experience') {
      const s = this.vspaceSettings.experience as any;
      s[field] = Math.round((s[field] + change) * 10) / 10;
    } else {
      const s = this.vspaceSettings.projects as any;
      s[field] = Math.round((s[field] + change) * 10) / 10;
    }
    this.cdr.detectChanges();
    this.autoSaveAndCompile(350);
  }

  setExperiencePreset(afterTitle: number, betweenExps: number): void {
    this.vspaceSettings.experience.afterJobTitle = afterTitle;
    this.vspaceSettings.experience.betweenExperiences = betweenExps;
    this.cdr.detectChanges();
    this.autoSaveAndCompile(100);
  }

  setProjectsPreset(afterTitle: number, betweenProjs: number): void {
    this.vspaceSettings.projects.afterProjectTitle = afterTitle;
    this.vspaceSettings.projects.betweenProjects = betweenProjs;
    this.cdr.detectChanges();
    this.autoSaveAndCompile(100);
  }

  // Compile LaTeX string and request PDF blob
  handleCompile(): void {
    if (this.compileTimer) {
      clearTimeout(this.compileTimer);
      this.compileTimer = null;
    }

    if (this.tutorialActiveStep !== null) {
      return;
    }

    if (!this.isOnline) {
      this.compilationError = 'No internet connection. Unable to compile.';
      return;
    }

    const resumeData: ResumeData = {
      personalInfo: this.resumeForm.get('personalInfo')?.value,
      education: this.resumeForm.get('education')?.value,
      experience: this.resumeForm.get('experience')?.value,
      projects: this.projects.value,
      skills: this.resumeForm.get('skills')?.value,
      certifications: this.resumeForm.get('certifications')?.value,
      customSections: this.customSectionList
    };

    const latexString = this.latexService.generateLatex(
      resumeData,
      this.sectionOrder,
      this.visibleSections,
      this.vspaceSettings
    );

    // Skip redundant recompilation if generated LaTeX is identical to active PDF
    if (this.pdfUrl && latexString === this.lastCompiledLatexString) {
      return;
    }

    // Instant client cache check (zero server load and 0ms latency for re-visited states)
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

    // Cancel in-flight compile request to prevent queue congestion and race conditions
    if (this.compileSub) {
      this.compileSub.unsubscribe();
      this.compileSub = undefined;
    }

    this.isCompiling = true;
    this.compilationError = '';
    this.latexCode = latexString;

    // Local / Production Compiler Endpoint
    const compilerUrl = 'http://localhost:8888/builds/sync'; // For local testing
    // const compilerUrl = 'https://resugen-compiler.onrender.com/builds/sync';

    this.compileSub = this.http.post(compilerUrl, {
      compiler: 'pdflatex',
      resources: [
        { path: 'main.tex', content: latexString }
      ]
    }, { responseType: 'blob' }).subscribe({
      next: (pdfBlob) => {
        this.lastCompiledLatexString = latexString;

        // Store in lightweight client-side cache (max 10 entries)
        if (this.clientPdfCache.size >= 10) {
          const firstKey = this.clientPdfCache.keys().next().value;
          if (firstKey) this.clientPdfCache.delete(firstKey);
        }
        this.clientPdfCache.set(latexString, pdfBlob);

        this.revokePdfUrl();
        this.rawPdfUrlString = URL.createObjectURL(pdfBlob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrlString + '#view=FitH&toolbar=0');
        this.isCompiling = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isCompiling = false;
        this.pdfUrl = null;
        this.rawPdfUrlString = null;

        // Try parsing compiler logs or API error response
        this.compilationError = 'Failed to generate PDF compiled resume. Check LaTeX markup syntax.';
        if (err && err.error && err.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const text = reader.result as string;
              const json = JSON.parse(text);
              if (json.error === 'TOO_MANY_REQUESTS') {
                this.compilationError = `Compiler Busy (429): ${json.message || 'Please wait a moment and try again.'}`;
              } else if (json.error === 'TIMEOUT') {
                this.compilationError = `Compiler Timeout (504): ${json.message || 'LaTeX compilation exceeded 30 seconds.'}`;
              } else if (json.error === 'PAYLOAD_TOO_LARGE') {
                this.compilationError = `Payload Too Large (413): ${json.message || 'Resume size exceeds limit.'}`;
              } else {
                this.compilationError = json.log || json.message || text;
              }
            } catch (e) {
              this.compilationError = (reader.result as string) || 'Unknown compilation error';
            }
            this.cdr.detectChanges();
          };
          reader.readAsText(err.error);
        } else {
          this.compilationError = parseErrorMessage(
            err,
            'Failed to generate PDF compiled resume. Check LaTeX markup syntax.',
            'LaTeX Compiler Service'
          );
          this.cdr.detectChanges();
        }
      }
    });
  }

  downloadLatex(): void {
    const blob = new Blob([this.latexCode], { type: 'application/x-tex' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (this.resumeForm.get('name')?.value || 'resume') + '.tex';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    this.downloadModalOpen = false;
  }

  downloadPdf(): void {
    if (this.rawPdfUrlString) {
      const link = document.createElement('a');
      link.href = this.rawPdfUrlString;
      link.download = (this.resumeForm.get('name')?.value || 'resume') + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.downloadModalOpen = false;
    }
  }

  // Scroll to first invalid field
  scrollToFirstInvalid(): void {
    this.resumeForm.markAllAsTouched();
    this.cdr.detectChanges();
    setTimeout(() => {
      const firstInvalid = document.querySelector('.ng-invalid.ng-touched');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus();
      }
    }, 100);
  }


  buildResumeData(): ResumeData {
    return {
      personalInfo: this.resumeForm.get('personalInfo')?.value || {},
      education: this.resumeForm.get('education')?.value || [],
      experience: this.resumeForm.get('experience')?.value || [],
      projects: this.projects.value || [],
      skills: this.resumeForm.get('skills')?.value || { skillCategories: [] },
      certifications: this.resumeForm.get('certifications')?.value || [],
      customSections: this.customSectionList || []
    };
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
    return this.sanitizer.bypassSecurityTrustHtml(this.syntaxHighlightLatex(this.latexCode, '#10b981'));
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
