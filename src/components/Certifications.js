import React from 'react';
import { Award, Plus, Trash2, ExternalLink, Trophy } from 'lucide-react';
import '../styles/certifications.css';

const Certifications = ({ data, updateData }) => {
  const addCertification = () => {
    const newCertifications = [...data, { name: '', link: '' }];
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
        {data.map((cert, index) => (
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
              <div className="certification-icon">
                <Trophy size={24} />
              </div>
              
              <div className="certification-fields">
                <div className="input-group">
                  <label>
                    <Award size={16} />
                    Certification or Achievement
                  </label>
                  <textarea
                    placeholder="AWS Certified Solutions Architect, Google Cloud Professional, Dean's List, Hackathon Winner, etc."
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    className="textarea-field certification-textarea"
                    rows={3}
                  />
                </div>

                <div className="input-group">
                  <label>
                    <ExternalLink size={16} />
                    Verification Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://verify.certification.com/..."
                    value={cert.link}
                    onChange={(e) => updateCertification(index, 'link', e.target.value)}
                    className="input-field"
                  />
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

      {data.length === 0 && (
        <div className="empty-state">
          <Award size={48} className="empty-icon" />
          <p>No certifications or achievements yet</p>
          <button onClick={addCertification} className="btn-primary">
            <Plus size={16} />
            Add Your First Achievement
          </button>
        </div>
      )}

      <div className="certifications-examples">
        <h4>💡 What to include:</h4>
        <div className="examples-grid">
          <div className="example-category">
            <h5>Professional Certifications</h5>
            <ul>
              <li>AWS Certified Solutions Architect</li>
              <li>Google Cloud Professional</li>
              <li>Microsoft Azure Developer</li>
              <li>Cisco Certified Network Associate</li>
            </ul>
          </div>
          <div className="example-category">
            <h5>Academic Achievements</h5>
            <ul>
              <li>Dean's List (Multiple Semesters)</li>
              <li>Graduated Magna Cum Laude</li>
              <li>Academic Scholarship Recipient</li>
              <li>Honor Society Member</li>
            </ul>
          </div>
          <div className="example-category">
            <h5>Competition & Awards</h5>
            <ul>
              <li>Hackathon Winner</li>
              <li>Coding Competition First Place</li>
              <li>Open Source Contributor</li>
              <li>Industry Conference Speaker</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certifications;