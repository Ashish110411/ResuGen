import React from 'react';
import { Code, Plus, Trash2, Github, ExternalLink, Wrench, FileText } from 'lucide-react';
import '../styles/projects.css';

const Projects = ({ data, updateData }) => {
  const addProject = () => {
    const newProjects = [...data, {
      name: '',
      technologies: '',
      github: '',
      livesite: '',
      description: ['']
    }];
    updateData(newProjects);
  };

  const removeProject = (index) => {
    const newProjects = data.filter((_, i) => i !== index);
    updateData(newProjects);
  };

  const updateProject = (index, field, value) => {
    const newProjects = data.map((proj, i) =>
        i === index ? { ...proj, [field]: value } : proj
    );
    updateData(newProjects);
  };

  const addDescription = (projIndex) => {
    const newProjects = data.map((proj, i) =>
        i === projIndex ? { ...proj, description: [...proj.description, ''] } : proj
    );
    updateData(newProjects);
  };

  const removeDescription = (projIndex, descIndex) => {
    const newProjects = data.map((proj, i) =>
        i === projIndex
            ? { ...proj, description: proj.description.filter((_, j) => j !== descIndex) }
            : proj
    );
    updateData(newProjects);
  };

  const updateDescription = (projIndex, descIndex, value) => {
    const newProjects = data.map((proj, i) =>
        i === projIndex
            ? {
              ...proj,
              description: proj.description.map((desc, j) =>
                  j === descIndex ? value : desc
              )
            }
            : proj
    );
    updateData(newProjects);
  };

  return (
      <div className="projects-section">
        <div className="section-header">
          <div className="section-title">
            <Code className="section-icon" size={24} />
            Projects
          </div>
          <button onClick={addProject} className="btn-primary add-btn">
            <Plus size={16} />
            Add Project
          </button>
        </div>

        <div className="projects-list">
          {data.map((proj, index) => (
              <div key={index} className="project-item">
                {data.length > 1 && (
                    <div className="item-header">
                      <span className="item-number">#{index + 1}</span>
                      <button
                          onClick={() => removeProject(index)}
                          className="remove-btn"
                          title="Remove Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                )}

                <div className="project-main-info">
                  <div className="input-group full-width">
                    <div className="input-wrapper">
                      <Code size={16} className="input-icon" />
                      <input
                          type="text"
                          placeholder="Project Name"
                          value={proj.name}
                          onChange={(e) => updateProject(index, 'name', e.target.value)}
                          className="input-field project-name-input"
                      />
                    </div>
                  </div>

                  <div className="input-group full-width">
                    <div className="input-wrapper">
                      <Wrench size={16} className="input-icon" />
                      <input
                          type="text"
                          placeholder="Technologies Used"
                          value={proj.technologies}
                          onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                          className="input-field"
                      />
                    </div>
                  </div>

                  <div className="project-links">
                    <div className="input-group">
                      <div className="input-wrapper">
                        <Github size={16} className="input-icon" />
                        <input
                            type="url"
                            placeholder="GitHub Repository URL"
                            value={proj.github}
                            onChange={(e) => updateProject(index, 'github', e.target.value)}
                            className="input-field"
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-wrapper">
                        <ExternalLink size={16} className="input-icon" />
                        <input
                            type="url"
                            placeholder="Live Demo URL"
                            value={proj.livesite}
                            onChange={(e) => updateProject(index, 'livesite', e.target.value)}
                            className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="description-section">
                  <div className="description-header">
                    <div className="description-title">
                      <FileText size={16} />
                      Project Description
                    </div>
                    <button
                        onClick={() => addDescription(index)}
                        className="btn-secondary add-description-btn"
                    >
                      <Plus size={14} />
                      Add Point
                    </button>
                  </div>

                  <div className="description-list">
                    {proj.description.map((desc, descIndex) => (
                        <div key={descIndex} className="description-item">
                    <textarea
                        placeholder="Describe what you built, technologies used, and your contributions"
                        value={desc}
                        onChange={(e) => updateDescription(index, descIndex, e.target.value)}
                        className="textarea-field description-textarea"
                        rows={3}
                    />
                          {proj.description.length > 1 && (
                              <button
                                  onClick={() => removeDescription(index, descIndex)}
                                  className="remove-description-btn"
                                  title="Remove Description"
                              >
                                <Trash2 size={14} />
                              </button>
                          )}
                        </div>
                    ))}
                  </div>
                </div>
              </div>
          ))}
        </div>

        {data.length === 0 && (
            <div className="empty-state">
              <Code size={48} className="empty-icon" />
              <p>No projects added yet</p>
              <button onClick={addProject} className="btn-primary">
                <Plus size={16} />
                Add Your First Project
              </button>
            </div>
        )}
      </div>
  );
};

export default Projects;