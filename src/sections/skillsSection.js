import escapeLatex from '../common/escapeLatex';

export function generateSkillsSection(skills) {
  if (!skills || typeof skills !== 'object') return '';
  const skillEntries = Object.entries(skills)
    .filter(([key, value]) => key && value && typeof value === 'string' && value.trim() !== '')
    .map(([key, value]) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      return `     \\textbf{${escapeLatex(capitalizedKey)}}{: ${escapeLatex(value)}} \\\\`;
    }).join('\n     \\vspace{3pt}\n');
  if (!skillEntries) return '';
  return `\\section{Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${skillEntries.replace(/\\\\\s*$/, '')}
    }}
 \\end{itemize}`;
}