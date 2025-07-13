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
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import '../styles/section-manager.css';

const SectionManager = ({ sectionOrder, setSectionOrder, isOpen, setIsOpen }) => {
  const [visibleSections, setVisibleSections] = useState(new Set(sectionOrder));

  const sectionConfig = {
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
    const defaultOrder = ['education', 'projects', 'experience', 'skills', 'certifications'];
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
            <span>Customize Section Order</span>
            <div className="section-count">{sectionOrder.length} sections</div>
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
            <span>Customize Section Order</span>
            <div className="section-count">{sectionOrder.length} sections</div>
          </div>
          <ChevronDown size={24} className="chevron-expanded" />
        </button>
      </div>

      <div className="section-manager-content">
        <div className="manager-instructions">
          <p>
            Drag and drop to reorder sections. Toggle visibility to show/hide sections in your resume.
          </p>
          <button onClick={resetToDefault} className="reset-button">
            <RotateCcw size={16} />
            Reset to Default Order
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
                              {visibleSections.has(sectionId) ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <div className="section-order">#{index + 1}</div>
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

        <div className="manager-footer">
          <div className="footer-stats">
            <span className="stat">
              <Eye size={16} />
              {visibleSections.size} visible
            </span>
            <span className="stat">
              <EyeOff size={16} />
              {sectionOrder.length - visibleSections.size} hidden
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionManager;