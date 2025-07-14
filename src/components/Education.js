import React, { useEffect, useState } from 'react';
import { GraduationCap, Plus, Trash2, Calendar, School, Award, ChevronDown } from 'lucide-react';
import '../styles/education.css';

const Education = ({ data, updateData }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!data || data.length === 0) {
      updateData([
        {
          institution: '',
          duration: '',
          degree: '',
          cgpa: ''
        }
      ]);
    }
  }, [data, updateData]);

  const addEducation = () => {
    const newEducation = [...data, {
      institution: '',
      duration: '',
      degree: '',
      cgpa: ''
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
            <button onClick={addEducation} className="btn-primary add-btn">
              <Plus size={16} />
              Add Education
            </button>
          </div>
        </div>

        {open && (
            <div className="education-list">
              {data && data.map((edu, index) => (
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
                        <div className="input-with-icon">
                          <School size={16} className="input-icon" />
                          <input
                              type="text"
                              placeholder="University of Technology"
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              className="input-field"
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-with-icon">
                          <Calendar size={16} className="input-icon" />
                          <input
                              type="text"
                              placeholder="Sep 2020 - Present"
                              value={edu.duration}
                              onChange={(e) => updateEducation(index, 'duration', e.target.value)}
                              className="input-field"
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-with-icon">
                          <GraduationCap size={16} className="input-icon" />
                          <input
                              type="text"
                              placeholder="Bachelor of Computer Science"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              className="input-field"
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-with-icon">
                          <Award size={16} className="input-icon" />
                          <input
                              type="text"
                              placeholder="3.8/4.0 or 85%"
                              value={edu.cgpa}
                              onChange={(e) => updateEducation(index, 'cgpa', e.target.value)}
                              className="input-field"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

export default Education;