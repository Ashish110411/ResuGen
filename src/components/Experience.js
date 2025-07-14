import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Building, FileText, Settings, ChevronDown } from 'lucide-react';
import '../styles/experience.css';

const defaultVspaceSettings = {
  experience: {
    afterJobTitle: 0,
    betweenExperiences: 0
  }
};

const Experience = ({
                      data,
                      updateData,
                      vspaceSettings = defaultVspaceSettings,
                      updateVspaceSettings
                    }) => {
  const [vspaceOpen, setVspaceOpen] = useState(false);

  // NEW: open/close for the whole section
  const [open, setOpen] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!data || data.length === 0) {
      updateData([
        {
          company: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          current: false,
          position: '',
          achievements: ['']
        }
      ]);
    }
  }, [data, updateData]);

  const updateVspace = (field, value) => {
    const newSettings = {
      ...vspaceSettings,
      experience: {
        ...vspaceSettings.experience,
        [field]: value
      }
    };
    updateVspaceSettings(newSettings);
  };

  const setExperienceVspace = (afterJobTitle, betweenExperiences) => {
    updateVspaceSettings({
      ...vspaceSettings,
      experience: {
        ...vspaceSettings.experience,
        afterJobTitle,
        betweenExperiences
      }
    });
  };

  const addExperience = () => {
    updateData([
      ...data,
      {
        company: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        current: false,
        position: '',
        achievements: ['']
      }
    ]);
  };

  const removeExperience = (index) => {
    if (data.length === 1) return;
    updateData(data.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    updateData(data.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
    ));
  };

  const addAchievement = (expIndex) => {
    updateData(data.map((exp, i) =>
        i === expIndex ? { ...exp, achievements: [...exp.achievements, ''] } : exp
    ));
  };

  const removeAchievement = (expIndex, achIndex) => {
    updateData(data.map((exp, i) =>
        i === expIndex
            ? { ...exp, achievements: exp.achievements.filter((_, j) => j !== achIndex) }
            : exp
    ));
  };

  const updateAchievement = (expIndex, achIndex, value) => {
    updateData(data.map((exp, i) =>
        i === expIndex
            ? {
              ...exp,
              achievements: exp.achievements.map((ach, j) =>
                  j === achIndex ? value : ach
              )
            }
            : exp
    ));
  };

  return (
      <div className="experience-section">
        <div className="section-header">
          <div className="section-title">
            <Briefcase className="section-icon" size={24} />
            Work Experience
          </div>
          <div className="section-controls">
            <button
                className="section-toggle-btn"
                onClick={() => setOpen(o => !o)}
                title={open ? "Collapse section" : "Expand section"}
                aria-label={open ? "Collapse section" : "Expand section"}
                type="button"
            >
              {open
                  ? <ChevronDown size={24} className="chevron-expanded" />
                  : <ChevronDown size={24} />
              }
            </button>
            <button
                onClick={() => setVspaceOpen(!vspaceOpen)}
                className={`vspace-toggle ${vspaceOpen ? 'active' : ''}`}
                title="Adjust Spacing"
            >
              <Settings size={16} />
              Spacing
            </button>
            <button onClick={addExperience} className="btn-primary add-btn">
              <Plus size={16} />
              Add Experience
            </button>
          </div>
        </div>

        {open && (
            <>
              {vspaceOpen && (
                  <div className="vspace-controls">
                    <div className="vspace-header">
                      <h4>Adjust Experience Section Spacing</h4>
                      <p>Fine-tune the vertical spacing in your experience section</p>
                    </div>

                    <div className="vspace-options">
                      <div className="vspace-control">
                        <label>Between Job Title and Achievements:</label>
                        <div className="vspace-input-group">
                          <button
                              onClick={() =>
                                  updateVspace('afterJobTitle', Math.max(-10, (vspaceSettings.experience?.afterJobTitle || 0) - 0.1))
                              }
                              className="vspace-btn"
                          >-</button>
                          <input
                              type="number"
                              step="0.1"
                              min="-10"
                              max="10"
                              value={vspaceSettings.experience?.afterJobTitle || 0}
                              onChange={e =>
                                  updateVspace('afterJobTitle', parseFloat(e.target.value) || 0)
                              }
                              className="vspace-input"
                          />
                          <button
                              onClick={() =>
                                  updateVspace('afterJobTitle', Math.min(10, (vspaceSettings.experience?.afterJobTitle || 0) + 0.1))
                              }
                              className="vspace-btn"
                          >+</button>
                          <span className="vspace-unit">em</span>
                        </div>
                      </div>

                      <div className="vspace-control">
                        <label>Between Different Work Experiences:</label>
                        <div className="vspace-input-group">
                          <button
                              onClick={() =>
                                  updateVspace('betweenExperiences', Math.max(-10, (vspaceSettings.experience?.betweenExperiences || 0) - 0.1))
                              }
                              className="vspace-btn"
                          >-</button>
                          <input
                              type="number"
                              step="0.1"
                              min="-10"
                              max="10"
                              value={vspaceSettings.experience?.betweenExperiences || 0}
                              onChange={e =>
                                  updateVspace('betweenExperiences', parseFloat(e.target.value) || 0)
                              }
                              className="vspace-input"
                          />
                          <button
                              onClick={() =>
                                  updateVspace('betweenExperiences', Math.min(10, (vspaceSettings.experience?.betweenExperiences || 0) + 0.1))
                              }
                              className="vspace-btn"
                          >+</button>
                          <span className="vspace-unit">em</span>
                        </div>
                      </div>
                    </div>

                    <div className="vspace-presets">
                      <button
                          onClick={() => setExperienceVspace(-1.5, -0.3)}
                          className="preset-btn compact"
                      >
                        Compact
                      </button>
                      <button
                          onClick={() => setExperienceVspace(-1, 0)}
                          className="preset-btn balanced"
                      >
                        Balanced
                      </button>
                      <button
                          onClick={() => setExperienceVspace(-0.4, 0.5)}
                          className="preset-btn spacious"
                      >
                        Spacious
                      </button>
                    </div>
                  </div>
              )}

              <div className="experience-list">
                {data &&
                    data.map((exp, index) => (
                        <div key={index} className="experience-item">
                          {data.length > 1 && (
                              <div className="item-header">
                                <span className="item-number">#{index + 1}</span>
                                <button
                                    onClick={() => removeExperience(index)}
                                    className="remove-btn"
                                    title="Remove Experience"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                          )}

                          <div className="experience-grid">
                            <div className="input-group">
                              <div className="input-wrapper">
                                <Building size={16} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Company Name"
                                    value={exp.company}
                                    onChange={e => updateExperience(index, 'company', e.target.value)}
                                    className="input-field"
                                />
                              </div>
                            </div>

                            <div className="input-group">
                              <div className="input-wrapper">
                                <Briefcase size={16} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Job Title"
                                    value={exp.position}
                                    onChange={e => updateExperience(index, 'position', e.target.value)}
                                    className="input-field"
                                />
                              </div>
                            </div>

                            <div className="date-section">
                              <div className="date-container">
                                <div className="date-row">
                                  <div className="date-field">
                                    <select
                                        value={exp.startMonth || ''}
                                        onChange={e => updateExperience(index, 'startMonth', e.target.value)}
                                        className="select-field"
                                    >
                                      <option value="">Start Month</option>
                                      {months.map((month, idx) => (
                                          <option key={idx} value={month}>{month}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="date-field">
                                    <select
                                        value={exp.startYear || ''}
                                        onChange={e => updateExperience(index, 'startYear', e.target.value)}
                                        className="select-field"
                                    >
                                      <option value="">Start Year</option>
                                      {years.map(year => (
                                          <option key={year} value={year}>{year}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="checkbox-container">
                                  <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={exp.current || false}
                                        onChange={e => updateExperience(index, 'current', e.target.checked)}
                                        className="checkbox-input"
                                    />
                                    Currently working here
                                  </label>
                                </div>

                                {!exp.current && (
                                    <div className="date-row">
                                      <div className="date-field">
                                        <select
                                            value={exp.endMonth || ''}
                                            onChange={e => updateExperience(index, 'endMonth', e.target.value)}
                                            className="select-field"
                                        >
                                          <option value="">End Month</option>
                                          {months.map((month, idx) => (
                                              <option key={idx} value={month}>{month}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="date-field">
                                        <select
                                            value={exp.endYear || ''}
                                            onChange={e => updateExperience(index, 'endYear', e.target.value)}
                                            className="select-field"
                                        >
                                          <option value="">End Year</option>
                                          {years.map(year => (
                                              <option key={year} value={year}>{year}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="achievements-section">
                            <div className="achievements-header">
                              <div className="achievements-title">
                                <FileText size={16} />
                                Achievements & Responsibilities
                              </div>
                              <button
                                  onClick={() => addAchievement(index)}
                                  className="btn-secondary add-achievement-btn"
                              >
                                <Plus size={14} />
                                Add Achievement
                              </button>
                            </div>

                            <div className="achievements-list">
                              {exp.achievements.map((ach, achIndex) => (
                                  <div key={achIndex} className="achievement-item">
                          <textarea
                              placeholder="Describe your achievement or responsibility in detail"
                              value={ach}
                              onChange={e => updateAchievement(index, achIndex, e.target.value)}
                              className="textarea-field achievement-textarea"
                              rows={3}
                          />
                                    {exp.achievements.length > 1 && (
                                        <button
                                            onClick={() => removeAchievement(index, achIndex)}
                                            className="remove-achievement-btn"
                                            title="Remove Achievement"
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
            </>
        )}
      </div>
  );
};

export default Experience;