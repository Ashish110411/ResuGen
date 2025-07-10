import escapeLatex from '../common/escapeLatex';

export function generateExperienceSection(experience) {
  if (!experience || !Array.isArray(experience) || !experience.some(e => e && e.company)) return '';
  const experienceEntries = experience
    .filter(exp => exp && exp.company && exp.company.trim() !== '')
    .map(exp => {
      const achievements = (exp.achievements || []).filter(ach => ach && typeof ach === 'string' && ach.trim() !== '');
      const achievementsList = achievements.length > 0 ?
        `\n    \\resumeItemListStart\n${achievements.map(ach => `        \\resumeItem{${escapeLatex(ach)}}`).join('\n')}\n    \\resumeItemListEnd` : '';
      return `   \\resumeSubheading
    {${escapeLatex(exp.company || '')}}{${escapeLatex(exp.duration || '')}}
    {${escapeLatex(exp.position || '')}}{${escapeLatex(exp.location || '')}}${achievementsList}`;
    }).join('\n\n');

  return `\\section{Experience}
  \\resumeSubHeadingListStart

${experienceEntries}

  \\resumeSubHeadingListEnd`;
}