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
          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="john@example.com"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>LinkedIn Profile</label>
          <input
            type="url"
            placeholder="https://linkedin.com/in/johndoe"
            value={data.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>GitHub Profile</label>
          <input
            type="url"
            placeholder="https://github.com/johndoe"
            value={data.github || ''}
            onChange={(e) => handleChange('github', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>Portfolio Website</label>
          <input
            type="url"
            placeholder="https://johndoe.dev"
            value={data.portfolio || ''}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group full-width">
          <label>LeetCode Profile</label>
          <input
            type="url"
            placeholder="https://leetcode.com/johndoe"
            value={data.leetcode || ''}
            onChange={(e) => handleChange('leetcode', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group full-width">
          <label>
            <Target size={16} />
            Career Objective
          </label>
          <textarea
            placeholder="A brief statement describing your career goals and what you aim to achieve in your professional journey..."
            value={data.objective || ''}
            onChange={(e) => handleChange('objective', e.target.value)}
            className="textarea-field"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;