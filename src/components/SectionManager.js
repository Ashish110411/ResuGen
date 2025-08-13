import React from 'react';
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
  EyeOff,
  FileText,
} from 'lucide-react';
import '../styles/section-manager.css';

const SectionManager = ({
                          sectionOrder,
                          setSectionOrder,
                          isOpen,
                          setIsOpen,
                          visibleSections,
                          setVisibleSections,
                          customSections = []
                        }) => {
  const sectionConfig = {
    objective: { name: 'Career Objective', icon: <Target size={20} />, description: 'Professional goals and career aspirations' },
    education: { name: 'Education', icon: <GraduationCap size={20} />, description: 'Academic background and qualifications' },
    experience: { name: 'Work Experience', icon: <Briefcase size={20} />, description: 'Professional work history' },
    projects: { name: 'Projects', icon: <Code size={20} />, description: 'Personal and professional projects' },
    skills: { name: 'Skills & Technologies', icon: <Wrench size={20} />, description: 'Technical and professional skills' },
    certifications: { name: 'Certifications & Achievements', icon: <Award size={20} />, description: 'Certifications, awards, and accomplishments' }
  };

  const getCustomSectionDetails = id => {
    const section = customSections.find(cs => cs.id === id);
    if (!section) return null;
    return { name: section.name || id, icon: <FileText size={20} />, description: "Custom section added" };
  };

  const validSectionIds = sectionOrder.filter(id =>
      id !== 'objective' && (sectionConfig[id] || customSections.find(cs => cs.id === id))
  );

  const handleOnDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(validSectionIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    // Add 'objective' back to the front:
    setSectionOrder(['objective', ...items]);
  };

  const resetToDefault = () => {
    const customIDs = customSections.map(cs => cs.id);
    const defaultOrder = [
      'objective',
      'education',
      'projects',
      'experience',
      'skills',
      'certifications',
      ...customIDs
    ];
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
                <span className="section-count">{1 + validSectionIds.length} sections</span>
                <span className="visible-count">{[...visibleSections].filter(id => id === 'objective' || validSectionIds.includes(id)).length} visible</span>
              </div>
            </div>
            <ChevronDown size={24} />
          </button>
        </div>
    );
  }

  const careerObjectiveConfig = sectionConfig['objective'];
  const isObjectiveVisible = visibleSections.has('objective');

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
                <span className="section-count">{1 + validSectionIds.length} sections</span>
                <span className="visible-count">{[...visibleSections].filter(id => id === 'objective' || validSectionIds.includes(id)).length} visible</span>
              </div>
            </div>
            <ChevronDown size={24} className="chevron-expanded" />
          </button>
        </div>
        <div className="section-manager-content">
          <div className="manager-instructions">
            <div className="instructions-text">
              <p>Drag to reorder sections below • Toggle to show/hide in resume<br/>
                <em>Changing the order may slightly adjust spacing in your resume</em></p>
            </div>
            <button onClick={resetToDefault} className="reset-button">
              <RotateCcw size={14}/>
              Reset
            </button>
          </div>
          {/* Career Objective fixed at top, only show/hide */}
          <div className="sections-list non-draggable">
            <div className={`section-item career-objective ${isObjectiveVisible ? 'visible' : 'hidden'}`}>
              <div className="section-item-content">
                <div className="section-info">
                  <div className="section-icon">
                    {careerObjectiveConfig.icon}
                  </div>
                  <div className="section-details">
                    <div className="section-name">
                      {careerObjectiveConfig.name}
                    </div>
                    <div className="section-description">
                      {careerObjectiveConfig.description}
                    </div>
                  </div>
                </div>
                <div className="section-controls">
                  <div className="section-position">Top</div>
                  <button
                      onClick={() => toggleSectionVisibility('objective')}
                      className={`visibility-toggle ${isObjectiveVisible ? 'visible' : 'hidden'}`}
                      title={
                        isObjectiveVisible
                            ? 'Hide from resume'
                            : 'Show in resume'
                      }
                  >
                    {isObjectiveVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* All other sections draggable */}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="sections">
              {(provided, snapshot) => (
                  <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`sections-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {validSectionIds.map((sectionId, index) => {
                      let config = sectionConfig[sectionId];
                      if (!config && sectionId.startsWith('customSection-')) {
                        config = getCustomSectionDetails(sectionId);
                      }
                      if (!config) return null;
                      return (
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
                                        {config?.icon}
                                      </div>
                                      <div className="section-details">
                                        <div className="section-name">
                                          {config?.name}
                                        </div>
                                        <div className="section-description">
                                          {config?.description}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="section-controls">
                                      <div className="section-position">#{index + 2}</div>
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
                      );
                    })}
                    {provided.placeholder}
                  </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="manager-summary">
            <div className="summary-item">
              <Eye size={14} />
              <span>
              {[...visibleSections].filter(id => id === 'objective' || validSectionIds.includes(id)).length} sections visible
            </span>
            </div>
            <div className="summary-item">
              <EyeOff size={14} />
              <span>
              {(1 + validSectionIds.length) - [...visibleSections].filter(id => id === 'objective' || validSectionIds.includes(id)).length} sections hidden
            </span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SectionManager;