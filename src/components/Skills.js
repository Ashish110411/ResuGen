import React from 'react';
import { Wrench, Code, Layers, Users, Zap } from 'lucide-react';
import '../styles/skills.css';

const Skills = ({ data, updateData }) => {
  const handleChange = (field, value) => {
    updateData({ ...data, [field]: value });
  };

  const skillCategories = [
    {
      key: 'expertise',
      label: 'Core Expertise',
      icon: <Zap size={16} />,
      placeholder: 'JavaScript, Python, Data Structures, Algorithms, System Design',
      description: 'Your primary technical skills and areas of expertise'
    },
    {
      key: 'languages',
      label: 'Programming Languages',
      icon: <Code size={16} />,
      placeholder: 'JavaScript, Python, Java, C++, TypeScript, Go',
      description: 'Programming languages you are proficient in'
    },
    {
      key: 'frameworks',
      label: 'Frameworks & Technologies',
      icon: <Layers size={16} />,
      placeholder: 'React, Node.js, Express, Django, Flask, Docker, Kubernetes',
      description: 'Frameworks, libraries, and technologies you work with'
    },
    {
      key: 'tools',
      label: 'Developer Tools',
      icon: <Code size={16} />,
      placeholder: 'Git, VS Code, Docker, AWS, MongoDB, PostgreSQL, Linux',
      description: 'Development tools, platforms, and environments'
    },
    {
      key: 'professional',
      label: 'Professional Skills',
      icon: <Users size={16} />,
      placeholder: 'Team Leadership, Project Management, Agile, Communication',
      description: 'Soft skills and professional competencies'
    }
  ];

  return (
    <div className="skills-section">
      <div className="section-header">
        <div className="section-title">
          <Wrench className="section-icon" size={24} />
          Skills & Technologies
        </div>
      </div>

      <div className="skills-grid">
        {skillCategories.map((category) => (
          <div key={category.key} className="skill-category">
            <div className="skill-category-header">
              <div className="skill-category-title">
                {category.icon}
                <span>{category.label}</span>
              </div>
              <p className="skill-category-description">
                {category.description}
              </p>
            </div>
            
            <textarea
              placeholder={category.placeholder}
              value={data[category.key] || ''}
              onChange={(e) => handleChange(category.key, e.target.value)}
              className="textarea-field skills-textarea"
              rows={3}
            />
          </div>
        ))}
      </div>

      <div className="skills-tips">
        <h4>💡 Tips for Better Skills Section:</h4>
        <ul>
          <li>List skills in order of proficiency (strongest first)</li>
          <li>Include years of experience for key technologies</li>
          <li>Group related technologies together</li>
          <li>Use industry-standard terminology</li>
          <li>Keep it relevant to your target role</li>
        </ul>
      </div>
    </div>
  );
};

export default Skills;