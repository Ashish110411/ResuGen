import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  GripVertical,
  ChevronDown,
  GraduationCap,
  Briefcase,
  Code,
  Wrench,
  Award,
  Target,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import '../styles/section-manager.css';

const SectionManager = ({ sectionOrder, setSectionOrder, isOpen, setIsOpen, visibleSections, setVisibleSections }) => {
  const sectionConfig = {
    objective: {
      name: 'Career Objective',
      icon: <Target size={20} />,
      description: 'Professional goals and career aspirations'
    },
    education: {
      name: 'Education',
      icon: <GraduationCap size={20} />,
      description: 'Academic background and qualifications'
    },
    experience: {
      name: 'Work Experience',
      icon: <Briefcase size={20} />,
      description: 'Professional work history'
    },
    projects: {
      name: 'Projects',
      icon: <Code size={20} />,
      description: 'Personal and professional projects'
    },
    skills: {
      name: 'Skills & Technologies',
      icon: <Wrench size={20} />,
      description: 'Technical and professional skills'
    },
    certifications: {
      name: 'Certifications & Achievements',
      icon: <Award size={20} />,
      description: 'Certifications, awards, and accomplishments'
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(sectionOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSectionOrder(items);
  };

  const resetToDefault = () => {
    const defaultOrder = ['objective', 'education', 'projects', 'experience', 'skills', 'certifications'];
    setSectionOrder(defaultOrder);
    setVisibleSections(new Set(defaultOrder));
  };

  const toggleSectionVisibility = (sectionId) => {
    const newVisibleSections = new Set(visibleSections);
    if (newVisibleSections.has(sectionId)) {
      newVisibleSections.delete(sectionId);
    } else {
      newVisibleSections.add(sectionId);
    }
    setVisibleSections(newVisibleSections);
  };

  if (!isOpen) {
    return (
        <div className="section-manager collapsed">
          <button
              onClick={() => setIsOpen(true)}
              className="section-manager-toggle"
          >
            <div className="toggle-content">
              <GripVertical size={24} />
              <span>Section Order & Visibility</span>
              <div className="section-stats">
                <span className="section-count">{sectionOrder.length} sections</span>
                <span className="visible-count">{visibleSections.size} visible</span>
              </div>
            </div>
            <ChevronDown size={24} />
          </button>
        </div>
    );
  }

  return (
      <div className="section-manager expanded">
        <div className="section-manager-header">
          <button
              onClick={() => setIsOpen(false)}
              className="section-manager-toggle"
          >
            <div className="toggle-content">
              <GripVertical size={24} />
              <span>Section Order & Visibility</span>
              <div className="section-stats">
                <span className="section-count">{sectionOrder.length} sections</span>
                <span className="visible-count">{visibleSections.size} visible</span>
              </div>
            </div>
            <ChevronDown size={24} className="chevron-expanded" />
          </button>
        </div>

        <div className="section-manager-content">
          <div className="manager-instructions">
            <div className="instructions-text">
              <p>Drag to reorder sections • Toggle to show/hide in resume</p>
            </div>
            <button onClick={resetToDefault} className="reset-button">
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="sections">
              {(provided, snapshot) => (
                  <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`sections-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {sectionOrder.map((sectionId, index) => (
                        <Draggable key={sectionId} draggableId={sectionId} index={index}>
                          {(provided, snapshot) => (
                              <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`section-item ${snapshot.isDragging ? 'dragging' : ''} ${
                                      visibleSections.has(sectionId) ? 'visible' : 'hidden'
                                  }`}
                              >
                                <div className="section-item-content">
                                  <div
                                      {...provided.dragHandleProps}
                                      className="drag-handle"
                                  >
                                    <GripVertical size={16} />
                                  </div>

                                  <div className="section-info">
                                    <div className="section-icon">
                                      {sectionConfig[sectionId]?.icon}
                                    </div>
                                    <div className="section-details">
                                      <div className="section-name">
                                        {sectionConfig[sectionId]?.name}
                                      </div>
                                      <div className="section-description">
                                        {sectionConfig[sectionId]?.description}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="section-controls">
                                    <div className="section-position">#{index + 1}</div>
                                    <button
                                        onClick={() => toggleSectionVisibility(sectionId)}
                                        className={`visibility-toggle ${
                                            visibleSections.has(sectionId) ? 'visible' : 'hidden'
                                        }`}
                                        title={
                                          visibleSections.has(sectionId)
                                              ? 'Hide from resume'
                                              : 'Show in resume'
                                        }
                                    >
                                      {visibleSections.has(sectionId) ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                  </div>
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

          <div className="manager-summary">
            <div className="summary-item">
              <Eye size={14} />
              <span>{visibleSections.size} sections visible</span>
            </div>
            <div className="summary-item">
              <EyeOff size={14} />
              <span>{sectionOrder.length - visibleSections.size} sections hidden</span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SectionManager;