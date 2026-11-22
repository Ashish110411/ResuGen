import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ResumeTemplateType = 'sde' | 'hr';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly STORAGE_KEY = 'resugen_active_template';
  private activeTemplateSubject: BehaviorSubject<ResumeTemplateType>;

  public activeTemplate$;

  constructor() {
    const saved = (localStorage.getItem(this.STORAGE_KEY) as ResumeTemplateType) || 'sde';
    const initial: ResumeTemplateType = (saved === 'hr') ? 'hr' : 'sde';
    this.activeTemplateSubject = new BehaviorSubject<ResumeTemplateType>(initial);
    this.activeTemplate$ = this.activeTemplateSubject.asObservable();
  }

  public get currentTemplate(): ResumeTemplateType {
    return this.activeTemplateSubject.value;
  }

  public setTemplate(template: ResumeTemplateType): void {
    if (template !== this.activeTemplateSubject.value) {
      localStorage.setItem(this.STORAGE_KEY, template);
      this.activeTemplateSubject.next(template);
    }
  }

  public toggleTemplate(): void {
    const next = this.currentTemplate === 'sde' ? 'hr' : 'sde';
    this.setTemplate(next);
  }
}
