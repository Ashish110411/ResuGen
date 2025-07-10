import { generateEducationSection } from './sections/educationSection';
import { generateExperienceSection } from './sections/experienceSection';
import { generateProjectsSection } from './sections/projectsSection';
import { generateSkillsSection } from './sections/skillsSection';
import { generateCertificationsSection } from './sections/certificationsSection';
import { generateHeader } from './sections/headerSection';

// You can also keep getDocumentPreamble here as a utility
function getDocumentPreamble() {
  return `<your full latex preamble, as before>`;
}

export function generateLatexResume(resumeData, options = {}) {
  const {
    personalInfo,
    education,
    experience,
    projects,
    skills,
    certifications
  } = resumeData;

  const sections = [];
  if (options.includeEducation !== false) {
    const eduSection = generateEducationSection(education);
    if (eduSection) sections.push(eduSection);
  }
  if (options.includeProjects !== false) {
    const projSection = generateProjectsSection(projects);
    if (projSection) sections.push(projSection);
  }
  if (options.includeExperience !== false) {
    const expSection = generateExperienceSection(experience);
    if (expSection) sections.push(expSection);
  }
  if (options.includeSkills !== false) {
    const skillsSection = generateSkillsSection(skills);
    if (skillsSection) sections.push(skillsSection);
  }
  if (options.includeCertifications !== false) {
    const certSection = generateCertificationsSection(certifications);
    if (certSection) sections.push(certSection);
  }

  return `${getDocumentPreamble()}

\\begin{document}
${generateHeader(personalInfo)}

${sections.join('\n\n')}

\\end{document}`;
}