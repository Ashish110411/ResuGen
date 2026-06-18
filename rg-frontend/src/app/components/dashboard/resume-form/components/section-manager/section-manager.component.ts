import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CustomSection } from '../../../../../models/resume.models';

interface SectionDetail {
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-section-manager',
  templateUrl: './section-manager.component.html',
  styleUrls: ['./section-manager.component.css']
})
export class SectionManagerComponent implements OnInit {
  @Input() sectionOrder!: string[];
  @Input() visibleSections!: Set<string>;
  @Input() customSections!: CustomSection[];

  isOpen = false;

  sectionConfigs: { [key: string]: SectionDetail } = {
    objective: { name: 'Career Objective', icon: 'target', description: 'Professional goals and career aspirations' },
    education: { name: 'Education', icon: 'school', description: 'Academic background and qualifications' },
    experience: { name: 'Work Experience', icon: 'work', description: 'Professional work history' },
    projects: { name: 'Projects', icon: 'code', description: 'Personal and professional projects' },
    skills: { name: 'Skills & Technologies', icon: 'construction', description: 'Technical and professional skills' },
    certifications: { name: 'Certifications & Achievements', icon: 'military_tech', description: 'Certifications, awards, and accomplishments' }
  };

  ngOnInit(): void {
  }

  getDraggableSections(): string[] {
    return this.sectionOrder.filter(id => id !== 'objective');
  }

  getSectionConfig(id: string): SectionDetail {
    if (this.sectionConfigs[id]) {
      return this.sectionConfigs[id];
    }
    
    // Check custom section
    const custom = this.customSections.find(cs => cs.id === id);
    return {
      name: custom ? custom.name : 'Custom Section',
      icon: 'list_alt',
      description: 'Custom sections added by user'
    };
  }

  toggleSectionVisibility(id: string): void {
    if (this.visibleSections.has(id)) {
      this.visibleSections.delete(id);
    } else {
      this.visibleSections.add(id);
    }
  }

  onDrop(event: CdkDragDrop<string[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const draggables = this.getDraggableSections();
    const [reorderedItem] = draggables.splice(event.previousIndex, 1);
    draggables.splice(event.currentIndex, 0, reorderedItem);

    // Reconstruct sectionOrder: objective is always fixed first, followed by draggables
    // Update the values in place so Angular handles changes
    this.sectionOrder.length = 0;
    this.sectionOrder.push('objective', ...draggables);
  }

  resetToDefault(): void {
    const customIds = this.customSections.map(cs => cs.id);
    const defaultOrder = [
      'objective',
      'education',
      'projects',
      'experience',
      'skills',
      'certifications',
      ...customIds
    ];

    this.sectionOrder.length = 0;
    this.sectionOrder.push(...defaultOrder);

    this.visibleSections.clear();
    defaultOrder.forEach(id => this.visibleSections.add(id));
  }

  getVisibleCount(): number {
    return this.sectionOrder.filter(id => this.visibleSections.has(id)).length;
  }
}
