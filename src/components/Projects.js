import React from 'react';
import { Code, Plus, Trash2, Github, ExternalLink, Wrench } from 'lucide-react';
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
                <label>
                  <Code size={16} />
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="My Awesome Project"
                  value={proj.name}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                  className="input-field project-name-input"
                />
              </div>

              <div className="input-group full-width">
                <label>
                  <Wrench size={16} />
                  Technologies Used
                </label>
                <input
                  type="text"
                  placeholder="React, Node.js, MongoDB, Express"
                  value={proj.technologies}
                  onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="project-links">
                <div className="input-group">
                  <label>
                    <Github size={16} />
                    GitHub Repository
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={proj.github}
                    onChange={(e) => updateProject(index, 'github', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label>
                    <ExternalLink size={16} />
                    Live Site URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://myproject.com"
                    value={proj.livesite}
                    onChange={(e) => updateProject(index, 'livesite', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="description-section">
              <div className="description-header">
                <label>Project Description</label>
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
                      placeholder="Describe what you built, technologies used, and your contributions..."
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