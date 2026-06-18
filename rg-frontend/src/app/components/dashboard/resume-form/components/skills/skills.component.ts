import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent {
  @Input() skillCategoriesArray!: FormArray;
  @Input() visibleSections!: Set<string>;

  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();

  isOpen = true;
  editingTitleId: string | null = null;

  getFormGroup(idx: number): FormGroup {
    return this.skillCategoriesArray.at(idx) as FormGroup;
  }

  // Handle CDK drag and drop
  onDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const from = event.previousIndex;
    const to = event.currentIndex;

    const control = this.skillCategoriesArray.at(from);
    this.skillCategoriesArray.removeAt(from);
    this.skillCategoriesArray.insert(to, control);
  }

  setEditingTitle(id: string): void {
    this.editingTitleId = id;
  }

  stopEditingTitle(): void {
    this.editingTitleId = null;
  }
}
