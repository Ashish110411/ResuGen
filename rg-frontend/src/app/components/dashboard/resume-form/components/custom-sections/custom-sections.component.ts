import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CustomSection } from '../../../../../models/resume.models';

@Component({
  selector: 'app-custom-sections',
  templateUrl: './custom-sections.component.html',
  styleUrls: ['./custom-sections.component.css']
})
export class CustomSectionsComponent implements OnChanges {
  @Input() sectionId!: string;
  @Input() customSections!: CustomSection[];
  @Input() visibleSections!: Set<string>;

  @Output() removeSec = new EventEmitter<string>();
  @Output() updateSecName = new EventEmitter<string>();
  @Output() addPt = new EventEmitter<number>();
  @Output() removePt = new EventEmitter<{ csIdx: number, ptIdx: number }>();
  @Output() updatePt = new EventEmitter<{ csIdx: number, ptIdx: number, value: string }>();

  isOpen = true;
  sectionIndex = -1;
  customSection: CustomSection | null = null;

  ngOnChanges(): void {
    this.sectionIndex = this.customSections.findIndex(cs => cs.id === this.sectionId);
    if (this.sectionIndex !== -1) {
      this.customSection = this.customSections[this.sectionIndex];
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  onNameChange(name: string): void {
    this.updateSecName.emit(name);
  }

  onPointChange(ptIdx: number, value: string): void {
    this.updatePt.emit({ csIdx: this.sectionIndex, ptIdx, value });
  }

  onAddPoint(): void {
    this.addPt.emit(this.sectionIndex);
  }

  onRemovePoint(ptIdx: number): void {
    this.removePt.emit({ csIdx: this.sectionIndex, ptIdx });
  }
}
