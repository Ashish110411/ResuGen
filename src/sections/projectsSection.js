import escapeLatex from '../common/escapeLatex';

export function generateProjectsSection(projects) {
  if (!projects || !Array.isArray(projects) || !projects.some(p => p && p.name)) return '';

  const projectCommand = `\\newcommand{\\resumeProject}[4]{
\\vspace{0.5mm}\\item
    \\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{#1} & \\textit{\\footnotesize{#3}} \\\\
        \\footnotesize{\\textit{#2}} & \\footnotesize{#4}
    \\end{tabular*}
    \\vspace{-4.4mm}
}
\\vspace{-8pt}`;

  const projectEntries = projects
    .filter(proj => proj && proj.name && proj.name.trim() !== '')
    .map(proj => {
      const descriptions = (proj.description || []).filter(desc => desc && typeof desc === 'string' && desc.trim() !== '');
      const links = [];
      if (proj.github && proj.github.trim() !== '') {
        links.push(`\\href{${proj.github}}{\\textcolor{blue}{(GitHub)}}`);
      }
      if (proj.livesite && proj.livesite.trim() !== '') {
        links.push(`\\href{${proj.livesite}}{\\textcolor{blue}{(Live Site)}}`);
      }
      const linkString = links.join(' ');
      const techWithLinks = proj.technologies ?
        `${escapeLatex(proj.technologies)}${linkString ? ' ' + linkString : ''}` :
        linkString;
      const descriptionList = descriptions.length > 0 ?
        `\n\n \\resumeItemListStart\n${descriptions.map(desc => `\\resumeItem{${escapeLatex(desc)}}`).join('\n')}\n\\resumeItemListEnd` : '';
      return `     \\resumeProject
    {${escapeLatex(proj.name || '')}}{${techWithLinks}}{}${descriptionList}`;
    }).join('\n\n');

  return `${projectCommand}

\\section{Projects}
    \\resumeSubHeadingListStart

${projectEntries}

    \\resumeSubHeadingListEnd
\\vspace{-8pt}`;
}