import React, { useEffect } from 'react';
import { Award, Plus, Trash2, ExternalLink, Calendar } from 'lucide-react';
import '../styles/certifications.css';

const Certifications = ({ data, updateData }) => {
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
          title: '',
          link: '',
          month: '',
          year: ''
        }
      ]);
    }
    // eslint-disable-next-line
  }, [data]);

  const addCertification = () => {
    const newCertifications = [...data, {
      title: '',
      link: '',
      month: '',
      year: ''
    }];
    updateData(newCertifications);
  };

  const removeCertification = (index) => {
    const newCertifications = data.filter((_, i) => i !== index);
    updateData(newCertifications);
  };

  const updateCertification = (index, field, value) => {
    const newCertifications = data.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
    );
    updateData(newCertifications);
  };

  return (
      <div className="certifications-section">
        <div className="section-header">
          <div className="section-title">
            <Award className="section-icon" size={24} />
            Certifications & Achievements
          </div>
          <button onClick={addCertification} className="btn-primary add-btn">
            <Plus size={16} />
            Add Certification
          </button>
        </div>

        <div className="certifications-list">
          {data && data.map((cert, index) => (
              <div key={index} className="certification-item">
                {data.length > 1 && (
                    <div className="item-header">
                      <span className="item-number">#{index + 1}</span>
                      <button
                          onClick={() => removeCertification(index)}
                          className="remove-btn"
                          title="Remove Certification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                )}

                <div className="certification-content">
                  <div className="certification-fields">
                    <div className="input-group">
                      <div className="input-wrapper">
                        <Award size={16} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Certification or Achievement Title"
                            value={cert.title}
                            onChange={(e) => updateCertification(index, 'title', e.target.value)}
                            className="input-field"
                        />
                      </div>
                    </div>

                    <div className="date-row">
                      <div className="input-group">
                        <div className="input-wrapper">
                          <Calendar size={16} className="input-icon" />
                          <select
                              value={cert.month}
                              onChange={(e) => updateCertification(index, 'month', e.target.value)}
                              className="select-field"
                          >
                            <option value="">Month</option>
                            {months.map((month, idx) => (
                                <option key={idx} value={month}>{month}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-wrapper">
                          <Calendar size={16} className="input-icon" />
                          <select
                              value={cert.year}
                              onChange={(e) => updateCertification(index, 'year', e.target.value)}
                              className="select-field"
                          >
                            <option value="">Year</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-wrapper">
                        <ExternalLink size={16} className="input-icon" />
                        <input
                            type="url"
                            placeholder="Verification Link (Optional)"
                            value={cert.link}
                            onChange={(e) => updateCertification(index, 'link', e.target.value)}
                            className="input-field"
                        />
                      </div>
                      {cert.link && (
                          <a
                              href={cert.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-preview"
                          >
                            <ExternalLink size={14} />
                            View Certificate
                          </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default Certifications;