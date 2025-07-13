import React from 'react';
import { Briefcase, Plus, Trash2, Calendar, MapPin, Building } from 'lucide-react';
import '../styles/experience.css';

const Experience = ({ data, updateData }) => {
  const addExperience = () => {
    const newExperience = [...data, {
      company: '',
      duration: '',
      position: '',
      location: '',
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
                <label>
                  <Building size={16} />
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Tech Corp Inc."
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>
                  <Calendar size={16} />
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="May 2025 - June 2025"
                  value={exp.duration}
                  onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>
                  <Briefcase size={16} />
                  Position/Role
                </label>
                <input
                  type="text"
                  placeholder="Software Engineer"
                  value={exp.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>
                  <MapPin size={16} />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="New York, NY"
                  value={exp.location}
                  onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="achievements-section">
              <div className="achievements-header">
                <label>Achievements & Responsibilities</label>
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
                      placeholder="Describe your achievement or responsibility in detail..."
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