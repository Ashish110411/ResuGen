import React, { useEffect, useState } from 'react';
import { Code, Plus, Trash2, Github, ExternalLink, Wrench, FileText, Settings } from 'lucide-react';
import '../styles/projects.css';

const defaultVspaceSettings = {
  projects: {
    afterProjectTitle: 0,
    betweenProjects: 0,
  }
};

const Projects = ({ data, updateData, vspaceSettings = defaultVspaceSettings, updateVspaceSettings }) => {
  const [vspaceOpen, setVspaceOpen] = useState(false);

  useEffect(() => {
    if (!data || data.length === 0) {
      updateData([
        {
          name: '',
          features: '',
          github: '',
          livesite: '',
          description: ['']
        }
      ]);
    }
  }, [data, updateData]);

  const updateVspace = (field, value) => {
    const newSettings = {
      ...vspaceSettings,
      projects: {
        ...vspaceSettings?.projects,
        [field]: value
      }
    };
    updateVspaceSettings?.(newSettings);
  };

  const setProjectVspace = (afterProjectTitle, betweenProjects) => {
    updateVspaceSettings?.({
      ...vspaceSettings,
      projects: {
        ...vspaceSettings?.projects,
        afterProjectTitle,
        betweenProjects
      }
    });
  };

  const addProject = () => {
    updateData([
      ...data,
      {
        name: '',
        features: '',
        github: '',
        livesite: '',
        description: ['']
      }
    ]);
  };

  const removeProject = (index) => {
    if (data.length === 1) return;
    updateData(data.filter((_, i) => i !== index));
  };

  const updateProject = (index, field, value) => {
    updateData(data.map((proj, i) =>
        i === index ? { ...proj, [field]: value } : proj
    ));
  };

  const addDescription = (projIndex) => {
    updateData(data.map((proj, i) =>
        i === projIndex ? { ...proj, description: [...proj.description, ''] } : proj
    ));
  };

  const removeDescription = (projIndex, descIndex) => {
    updateData(data.map((proj, i) =>
        i === projIndex
            ? { ...proj, description: proj.description.filter((_, j) => j !== descIndex) }
            : proj
    ));
  };

  const updateDescription = (projIndex, descIndex, value) => {
    updateData(data.map((proj, i) =>
        i === projIndex
            ? {
              ...proj,
              description: proj.description.map((desc, j) =>
                  j === descIndex ? value : desc
              )
            }
            : proj
    ));
  };

  return (
      <div className="projects-section">
        <div className="section-header">
          <div className="section-title">
            <Code className="section-icon" size={24} />
            Projects
          </div>
          <div className="section-controls">
            <button
                onClick={() => setVspaceOpen(!vspaceOpen)}
                className={`vspace-toggle ${vspaceOpen ? 'active' : ''}`}
            >
              <Settings size={16} />
              Spacing
            </button>
            <button onClick={addProject} className="btn-primary add-btn">
              <Plus size={16} />
              Add Project
            </button>
          </div>
        </div>

        {vspaceOpen && (
            <div className="vspace-controls">
              <div className="vspace-header">
                <h4>Adjust Project Section Spacing</h4>
                <p>Fine-tune vertical spacing between projects</p>
              </div>

              <div className="vspace-options">
                <div className="vspace-control">
                  <label>Between Project Title and Description:</label>
                  <div className="vspace-input-group">
                    <button
                        onClick={() =>
                            updateVspace('afterProjectTitle', Math.max(-10, (vspaceSettings?.projects?.afterProjectTitle || 0) - 0.1))
                        }
                        className="vspace-btn"
                    >-</button>
                    <input
                        type="number"
                        step="0.1"
                        min="-10"
                        max="10"
                        value={vspaceSettings?.projects?.afterProjectTitle || 0}
                        onChange={e =>
                            updateVspace('afterProjectTitle', parseFloat(e.target.value) || 0)
                        }
                        className="vspace-input"
                    />
                    <button
                        onClick={() =>
                            updateVspace('afterProjectTitle', Math.min(10, (vspaceSettings?.projects?.afterProjectTitle || 0) + 0.1))
                        }
                        className="vspace-btn"
                    >+</button>
                    <span className="vspace-unit">em</span>
                  </div>
                </div>

                <div className="vspace-control">
                  <label>Between Projects:</label>
                  <div className="vspace-input-group">
                    <button
                        onClick={() =>
                            updateVspace('betweenProjects', Math.max(-10, (vspaceSettings?.projects?.betweenProjects || 0) - 0.1))
                        }
                        className="vspace-btn"
                    >-</button>
                    <input
                        type="number"
                        step="0.1"
                        min="-10"
                        max="10"
                        value={vspaceSettings?.projects?.betweenProjects || 0}
                        onChange={e =>
                            updateVspace('betweenProjects', parseFloat(e.target.value) || 0)
                        }
                        className="vspace-input"
                    />
                    <button
                        onClick={() =>
                            updateVspace('betweenProjects', Math.min(10, (vspaceSettings?.projects?.betweenProjects || 0) + 0.1))
                        }
                        className="vspace-btn"
                    >+</button>
                    <span className="vspace-unit">em</span>
                  </div>
                </div>
              </div>

              <div className="vspace-presets">
                <button
                    onClick={() => setProjectVspace(-0.8, -0.6)}
                    className="preset-btn compact"
                >
                  Compact
                </button>
                <button
                    onClick={() => setProjectVspace(0, 0)}
                    className="preset-btn balanced"
                >
                  Balanced
                </button>
                <button
                    onClick={() => setProjectVspace(0, 0.8)}
                    className="preset-btn spacious"
                >
                  Spacious
                </button>
              </div>
            </div>
        )}

        <div className="projects-list">
          {data &&
              data.map((proj, index) => (
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
                              onChange={e => updateProject(index, 'name', e.target.value)}
                              className="input-field project-name-input"
                          />
                        </div>
                      </div>

                      <div className="input-group full-width">
                        <div className="input-wrapper">
                          <Wrench size={16} className="input-icon" />
                          <input
                              type="text"
                              placeholder="Key Features or Focus"
                              value={proj.features}
                              onChange={e => updateProject(index, 'features', e.target.value)}
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
                                onChange={e =>
                                    updateProject(index, 'github', e.target.value)
                                }
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
                                onChange={e =>
                                    updateProject(index, 'livesite', e.target.value)
                                }
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
                          onChange={e =>
                              updateDescription(index, descIndex, e.target.value)
                          }
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
      </div>
  );
};

export default Projects;