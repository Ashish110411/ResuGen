import React, { useState } from 'react';
import { Wrench, Plus, Trash2, GripVertical, Edit3, Lightbulb } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../styles/skills.css';

const Skills = ({ data, updateData }) => {
  const [editingTitle, setEditingTitle] = useState(null);

  const initializeSkills = () => {
    if (data.skillCategories && Array.isArray(data.skillCategories)) {
      return data.skillCategories;
    }

    if (data.expertise || data.languages || data.frameworks || data.tools || data.professional) {
      const legacyCategories = [];

      if (data.languages) {
        legacyCategories.push({
          id: '1',
          title: 'Programming Languages',
          content: data.languages
        });
      }

      if (data.frameworks) {
        legacyCategories.push({
          id: '2',
          title: 'Frameworks & Technologies',
          content: data.frameworks
        });
      }

      if (data.expertise) {
        legacyCategories.push({
          id: '3',
          title: 'Backend Frameworks & Databases',
          content: data.expertise
        });
      }

      if (data.tools) {
        legacyCategories.push({
          id: '4',
          title: 'Tools & Platforms',
          content: data.tools
        });
      }

      if (data.professional) {
        legacyCategories.push({
          id: '5',
          title: 'Professional Skills',
          content: data.professional
        });
      }

      updateData({
        ...data,
        skillCategories: legacyCategories
      });

      return legacyCategories;
    }

    const defaultCategories = [
      { id: '1', title: 'Programming Languages', content: '' },
      { id: '2', title: 'Frameworks & Technologies', content: '' },
      { id: '3', title: 'Tools & Platforms', content: '' }
    ];

    updateData({
      ...data,
      skillCategories: defaultCategories
    });

    return defaultCategories;
  };

  const skillCategories = initializeSkills();

  const addSkillCategory = () => {
    if (skillCategories.length >= 6) return;

    const newCategory = {
      id: Date.now().toString(),
      title: `Skill Category ${skillCategories.length + 1}`,
      content: ''
    };

    updateData({
      ...data,
      skillCategories: [...skillCategories, newCategory]
    });
  };

  const removeSkillCategory = (id) => {
    if (skillCategories.length <= 1) return;

    updateData({
      ...data,
      skillCategories: skillCategories.filter(cat => cat.id !== id)
    });
  };

  const updateSkillCategory = (id, field, value) => {
    updateData({
      ...data,
      skillCategories: skillCategories.map(cat =>
          cat.id === id ? { ...cat, [field]: value } : cat
      )
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(skillCategories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateData({
      ...data,
      skillCategories: items
    });
  };

  const handleTitleEdit = (id, newTitle) => {
    updateSkillCategory(id, 'title', newTitle);
    setEditingTitle(null);
  };

  return (
      <div className="skills-section">
        <div className="section-header">
          <div className="section-title">
            <Wrench className="section-icon" size={24} />
            Skills & Technologies
          </div>
          <div className="section-controls">
          <span className="category-count">
            {skillCategories.length}/6 categories
          </span>
            <button
                onClick={addSkillCategory}
                className="btn-primary add-btn"
                disabled={skillCategories.length >= 6}
                title="Add skill category"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="skills">
            {(provided, snapshot) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`skills-grid ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  {skillCategories.map((category, index) => (
                      <Draggable key={category.id} draggableId={category.id} index={index}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`skill-category ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <div className="skill-category-header">
                                <div className="skill-category-title-row">
                                  <div
                                      {...provided.dragHandleProps}
                                      className="drag-handle"
                                      title="Drag to reorder"
                                  >
                                    <GripVertical size={16} />
                                  </div>

                                  <div className="skill-category-title-section">
                                    {editingTitle === category.id ? (
                                        <input
                                            type="text"
                                            value={category.title}
                                            onChange={(e) => updateSkillCategory(category.id, 'title', e.target.value)}
                                            onBlur={(e) => handleTitleEdit(category.id, e.target.value)}
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') {
                                                handleTitleEdit(category.id, e.target.value);
                                              }
                                            }}
                                            className="title-edit-input"
                                            autoFocus
                                            maxLength={50}
                                        />
                                    ) : (
                                        <div className="skill-category-title">
                                          <span>{category.title}</span>
                                          <button
                                              onClick={() => setEditingTitle(category.id)}
                                              className="edit-title-btn"
                                              title="Edit category name"
                                          >
                                            <Edit3 size={14} />
                                          </button>
                                        </div>
                                    )}
                                  </div>

                                  <div className="skill-category-controls">
                                    <span className="category-number">#{index + 1}</span>
                                    {skillCategories.length > 1 && (
                                        <button
                                            onClick={() => removeSkillCategory(category.id)}
                                            className="remove-btn"
                                            title="Remove category"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <textarea
                                  placeholder={`Enter your ${category.title.toLowerCase()}... (e.g., JavaScript, Python, React, Node.js)`}
                                  value={category.content || ''}
                                  onChange={(e) => updateSkillCategory(category.id, 'content', e.target.value)}
                                  className="textarea-field skills-textarea"
                                  rows={3}
                              />

                              <div className="skill-category-footer">
                        <span className="character-count">
                          {(category.content || '').length} characters
                        </span>
                              </div>
                            </div>
                        )}
                      </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="skills-tips">
          <h4>
            <Lightbulb size={16} />
            Tips for Skills Section:
          </h4>
          <ul>
            <li><strong>Customize categories:</strong> Click the edit icon to rename categories</li>
            <li><strong>Order matters:</strong> Drag categories to prioritize your strongest areas</li>
            <li><strong>Be specific:</strong> List technologies you actually use</li>
            <li><strong>Group related skills:</strong> Keep similar technologies together</li>
            <li><strong>Stay relevant:</strong> Focus on job-relevant skills</li>
            <li><strong>Add experience:</strong> Mention years of experience for key skills</li>
          </ul>
        </div>
      </div>
  );
};

export default Skills;