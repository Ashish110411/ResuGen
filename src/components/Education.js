import React from 'react';
import { GraduationCap, Plus, Trash2, Calendar, School, Award } from 'lucide-react';
import '../styles/education.css';

const Education = ({ data, updateData }) => {
  const addEducation = () => {
    const newEducation = [...data, {
      institution: '',
      duration: '',
      degree: '',
      cgpa: '',
      coursework: ''
    }];
    updateData(newEducation);
  };

  const removeEducation = (index) => {
    const newEducation = data.filter((_, i) => i !== index);
    updateData(newEducation);
  };

  const updateEducation = (index, field, value) => {
    const newEducation = data.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    updateData(newEducation);
  };

  return (
    <div className="education-section">
      <div className="section-header">
        <div className="section-title">
          <GraduationCap className="section-icon" size={24} />
          Education
        </div>
        <button onClick={addEducation} className="btn-primary add-btn">
          <Plus size={16} />
          Add Education
        </button>
      </div>

      <div className="education-list">
        {data.map((edu, index) => (
          <div key={index} className="education-item">
            {data.length > 1 && (
              <div className="item-header">
                <span className="item-number">#{index + 1}</span>
                <button
                  onClick={() => removeEducation(index)}
                  className="remove-btn"
                  title="Remove Education"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="education-grid">
              <div className="input-group">
                <label>
                  <School size={16} />
                  Institution Name
                </label>
                <input
                  type="text"
                  placeholder="University of Technology"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
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
                  placeholder="Sep 2020 - Present"
                  value={edu.duration}
                  onChange={(e) => updateEducation(index, 'duration', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>
                  <GraduationCap size={16} />
                  Degree & Specialization
                </label>
                <input
                  type="text"
                  placeholder="Bachelor of Computer Science"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>
                  <Award size={16} />
                  Grade (CGPA/%)
                </label>
                <input
                  type="text"
                  placeholder="3.8/4.0 or 85%"
                  value={edu.cgpa}
                  onChange={(e) => updateEducation(index, 'cgpa', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group full-width">
                <label>Relevant Coursework</label>
                <textarea
                  placeholder="Data Structures, Algorithms, Database Systems, Software Engineering"
                  value={edu.coursework}
                  onChange={(e) => updateEducation(index, 'coursework', e.target.value)}
                  className="textarea-field"
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="empty-state">
          <GraduationCap size={48} className="empty-icon" />
          <p>No education entries yet</p>
          <button onClick={addEducation} className="btn-primary">
            <Plus size={16} />
            Add Your First Education
          </button>
        </div>
      )}
    </div>
  );
};

export default Education;