import React from 'react';
import { Briefcase, Plus, Trash2, Calendar, Building, FileText } from 'lucide-react';
import '../styles/experience.css';

const Experience = ({ data, updateData }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const addExperience = () => {
    const newExperience = [...data, {
      company: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      current: false,
      position: '',
      achievements: ['']
    }];
    updateData(newExperience);
  };

  const removeExperience = (index) => {
    const newExperience = data.filter((_, i) => i !== index);
    updateData(newExperience);
  };

  const updateExperience = (index, field, value) => {
    const newExperience = data.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
    );
    updateData(newExperience);
  };

  const addAchievement = (expIndex) => {
    const newExperience = data.map((exp, i) =>
        i === expIndex ? { ...exp, achievements: [...exp.achievements, ''] } : exp
    );
    updateData(newExperience);
  };

  const removeAchievement = (expIndex, achIndex) => {
    const newExperience = data.map((exp, i) =>
        i === expIndex
            ? { ...exp, achievements: exp.achievements.filter((_, j) => j !== achIndex) }
            : exp
    );
    updateData(newExperience);
  };

  const updateAchievement = (expIndex, achIndex, value) => {
    const newExperience = data.map((exp, i) =>
        i === expIndex
            ? {
              ...exp,
              achievements: exp.achievements.map((ach, j) =>
                  j === achIndex ? value : ach
              )
            }
            : exp
    );
    updateData(newExperience);
  };

  return (
      <div className="experience-section">
        <div className="section-header">
          <div className="section-title">
            <Briefcase className="section-icon" size={24} />
            Work Experience
          </div>
          <button onClick={addExperience} className="btn-primary add-btn">
            <Plus size={16} />
            Add Experience
          </button>
        </div>

        <div className="experience-list">
          {data.map((exp, index) => (
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
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="input-field"
                      />
                    </div>
                  </div>

                  <div className="input-group full-width">
                    <div className="input-wrapper">
                      <Briefcase size={16} className="input-icon" />
                      <input
                          type="text"
                          placeholder="Job Title"
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          className="input-field"
                      />
                    </div>
                  </div>

                  <div className="date-section">
                    <div className="date-group">
                      <span className="date-label">Start Date</span>
                      <div className="date-row">
                        <div className="input-group">
                          <select
                              value={exp.startMonth || ''}
                              onChange={(e) => updateExperience(index, 'startMonth', e.target.value)}
                              className="select-field"
                          >
                            <option value="">Start Month</option>
                            {months.map((month, idx) => (
                                <option key={idx} value={month}>{month}</option>
                            ))}
                          </select>
                        </div>

                        <div className="input-group">
                          <select
                              value={exp.startYear || ''}
                              onChange={(e) => updateExperience(index, 'startYear', e.target.value)}
                              className="select-field"
                          >
                            <option value="">Start Year</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="date-group">
                      <span className="date-label">End Date</span>
                      <div className="current-checkbox">
                        <label className="checkbox-label">
                          <input
                              type="checkbox"
                              checked={exp.current || false}
                              onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                              className="checkbox-input"
                          />
                          Currently working here
                        </label>
                      </div>
                      {!exp.current && (
                          <div className="date-row">
                            <div className="input-group">
                              <select
                                  value={exp.endMonth || ''}
                                  onChange={(e) => updateExperience(index, 'endMonth', e.target.value)}
                                  className="select-field"
                              >
                                <option value="">End Month</option>
                                {months.map((month, idx) => (
                                    <option key={idx} value={month}>{month}</option>
                                ))}
                              </select>
                            </div>

                            <div className="input-group">
                              <select
                                  value={exp.endYear || ''}
                                  onChange={(e) => updateExperience(index, 'endYear', e.target.value)}
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
                        onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
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

        {data.length === 0 && (
            <div className="empty-state">
              <Briefcase size={48} className="empty-icon" />
              <p>No work experience entries yet</p>
              <button onClick={addExperience} className="btn-primary">
                <Plus size={16} />
                Add Your First Experience
              </button>
            </div>
        )}
      </div>
  );
};

export default Experience;