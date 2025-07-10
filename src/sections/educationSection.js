import escapeLatex from '../common/escapeLatex';

export function generateEducationSection(education) {
  if (!education || !Array.isArray(education) || !education.some(e => e && e.institution)) return '';
  const educationEntries = education
    .filter(edu => edu && edu.institution && edu.institution.trim() !== '')
    .map(edu => {
      const coursework = edu.coursework && edu.coursework.trim() !== '' ?
        `\n    \\resumeItemListStart\n      \\item {\\textit{Relevant Coursework:} ${escapeLatex(edu.coursework)}}\n    \\resumeItemListEnd\n    \\vspace{-7pt}` : '';
      const cgpaText = edu.cgpa && edu.cgpa.trim() !== '' ? `\\textbf{CGPA: ${escapeLatex(edu.cgpa)}}` : '';
      return `    \\resumeSubheading
    {${escapeLatex(edu.institution || '')}}{${escapeLatex(edu.duration || '')}}
    {${escapeLatex(edu.degree || '')}}{${cgpaText}}${coursework}`;
    }).join('\n\n');

  return `\\section{Education}
  \\resumeSubHeadingListStart
${educationEntries}
  \\resumeSubHeadingListEnd`;
}