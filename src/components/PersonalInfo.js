import React from 'react';
import { User, Mail, Phone, Linkedin, Github, Globe, Code, Target } from 'lucide-react';
import '../styles/personal-info.css';

const PersonalInfo = ({ data, updateData }) => {
  const handleChange = (field, value) => {
    updateData({ ...data, [field]: value });
  };

  return (
      <div className="personal-info-section">
        <div className="section-header">
          <div className="section-title">
            <User className="section-icon" size={24} />
            Personal Information
          </div>
        </div>

        <div className="personal-info-grid">
          <div className="input-group">
            <div className="input-wrapper">
              <User className="input-icon" size={16} />
              <input
                  type="text"
                  placeholder="Full Name"
                  value={data.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                  type="email"
                  placeholder="Email Address"
                  value={data.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <Phone className="input-icon" size={16} />
              <input
                  type="tel"
                  placeholder="Phone Number"
                  value={data.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <Linkedin className="input-icon" size={16} />
              <input
                  type="url"
                  placeholder="LinkedIn Profile URL"
                  value={data.linkedin || ''}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <Github className="input-icon" size={16} />
              <input
                  type="url"
                  placeholder="GitHub Profile URL"
                  value={data.github || ''}
                  onChange={(e) => handleChange('github', e.target.value)}
                  className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <Globe className="input-icon" size={16} />
              <input
                  type="url"
                  placeholder="Portfolio Website URL"
                  value={data.portfolio || ''}
                  onChange={(e) => handleChange('portfolio', e.target.value)}
                  className="input-field"
              />
            </div>
          </div>

          <div className="input-group full-width">
            <div className="input-wrapper">
              <Code className="input-icon" size={16} />
              <input
                  type="url"
                  placeholder="LeetCode Profile URL"
                  value={data.leetcode || ''}
                  onChange={(e) => handleChange('leetcode', e.target.value)}
                  className="input-field"
              />
            </div>
          </div>

          <div className="input-group full-width">
            <div className="input-wrapper textarea-wrapper">
              <Target className="input-icon" size={16} />
              <textarea
                  placeholder="Career Objective - A brief statement describing your career goals and professional aspirations"
                  value={data.objective || ''}
                  onChange={(e) => handleChange('objective', e.target.value)}
                  className="textarea-field"
                  rows={4}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default PersonalInfo;