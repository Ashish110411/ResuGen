const escapeLatex = (str) => {
  if (typeof str !== 'string') return '';

  let result = str.replace(/\*([^*]+)\*/g, '\\textbf{$1}');

  const parts = result.split(/(\\textbf\{[^}]*\})/);

  result = parts.map((part, index) => {
    if (index % 2 === 1) {
      return part;
    }

    return part
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
  }).join('');

  return result;
};

const ensureHttpProtocol = (url) => {
  if (!url || typeof url !== 'string') return url;
  const trimmedUrl = url.trim();
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `https://${trimmedUrl}`;
  }
  return trimmedUrl;
};

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const generateHeader = (personalInfo) => {
  const { name, email, phone, linkedin, github, portfolio, leetcode } = personalInfo;

  const contactLinks = [];

  if (github) {
    contactLinks.push(`\\href{${ensureHttpProtocol(github)}}{\\raisebox{-0.05\\height}\\faGithub\\ GitHub}`);
  }
  if (linkedin) {
    contactLinks.push(`\\href{${ensureHttpProtocol(linkedin)}}{\\raisebox{-0.05\\height}\\faLinkedin\\ LinkedIn}`);
  }
  if (portfolio) {
    contactLinks.push(`\\href{${ensureHttpProtocol(portfolio)}}{\\raisebox{-0.05\\height}\\faGlobe \\ Portfolio}`);
  }
  if (email) {
    contactLinks.push(`\\href{mailto:${email}}{\\raisebox{-0.05\\height}\\faEnvelope \\ ${escapeLatex(email)}}`);
  }
  if (phone) {
    contactLinks.push(`\\href{tel:${phone.replace(/[^\d+]/g, '')}}{\\raisebox{-0.05\\height}\\faMobile \\ ${escapeLatex(phone)}}`);
  }
  if (leetcode) {
    contactLinks.push(`\\href{${ensureHttpProtocol(leetcode)}}{\\raisebox{-0.05\\height}\\faCode \\ LeetCode}`);
  }

  const contactSection = contactLinks.join(' \\ $|$ \\ ');

  return `\\begin{tabularx}{\\linewidth}{@{} C @{}}
\\Huge{${escapeLatex(name) || 'Your Name'}} \\\\[7.5pt]
${contactSection} \\\\
\\end{tabularx}`;
};

const generateEducationSection = (education) => {
  if (!education || !education.some(e => e && e.institution)) return '';

  const entries = education.filter(e => e.institution).map(edu => {
    const cgpaText = edu.cgpa ? `\\hfill ${escapeLatex(edu.cgpa)}` : '';
    const degreeText = edu.degree ? `${escapeLatex(edu.degree)} from ` : '';

    return `${escapeLatex(edu.duration)} & ${degreeText}\\textbf{${escapeLatex(edu.institution)}} ${cgpaText} \\\\`;
  }).join(' \n');

  return `\\section{Education}
\\begin{tabularx}{\\linewidth}{@{}l X@{}}	
${entries}
\\end{tabularx}`;
};

const generateExperienceSection = (experience) => {
  if (!experience || !experience.some(e => e && e.company)) return '';

  const entries = experience.filter(e => e.company).map(exp => {
    const achievements = exp.achievements.filter(a => a.trim() !== '');
    const achievementsList = achievements.length > 0 ?
        `\\begin{itemize}[leftmargin=*, itemsep=-0.5em]
${achievements.map(ach => `    \\item ${escapeLatex(ach)}`).join('\n')}
\\end{itemize}` : '';

    return `\\large{\\textbf{${escapeLatex(exp.position)}}} - \\textit{${escapeLatex(exp.company)}} \\hfill (\\textit{${escapeLatex(exp.duration)}}) \\\\
${achievementsList}`;
  }).join('\n\n');

  return `\\section{Experience}
${entries}`;
};

const generateProjectsSection = (projects) => {
  if (!projects || !Array.isArray(projects) || !projects.some(p => p && p.name)) return '';

  const projectEntries = projects
      .filter(proj => proj && proj.name && proj.name.trim() !== '')
      .map((proj, index) => {
        const descriptions = (proj.description || []).filter(desc => desc && typeof desc === 'string' && desc.trim() !== '');

        const links = [];
        if (proj.github && proj.github.trim() !== '') {
          links.push(`\\href{${ensureHttpProtocol(proj.github)}}{\\raisebox{-0.1em}{\\faGithub}}`);
        }
        if (proj.livesite && proj.livesite.trim() !== '') {
          links.push(`\\href{${ensureHttpProtocol(proj.livesite)}}{\\faGlobe}`);
        }
        const linkString = links.length > 0 ? ` ${links.join(' ')}` : '';

        const techInfo = proj.technologies ? `\\textit{${escapeLatex(proj.technologies)}}` : '\\textit{Self Project}';

        const descriptionList = descriptions.length > 0 ?
            `\\begin{tabularx}{\\linewidth}{@{}X@{}}
    \\begin{itemize}[leftmargin=*]
    \\small
${descriptions.map(desc => `        \\item ${escapeLatex(desc)}`).join('\n')}
    \\end{itemize}
\\end{tabularx}` : '';

        return `\\begin{tabularx}{\\linewidth}{ @{}l X r@{} }
    \\textbf{${escapeLatex(proj.name || '')}} \\textbar \\hspace{2pt} ${techInfo}${linkString} & & (\\textit{Ongoing}) \\\\
\\end{tabularx}
${descriptionList}`;
      }).join('\n\n');

  return `\\section{Projects}

${projectEntries}`;
};

const generateSkillsSection = (skills) => {
  let skillEntries = [];

  if (skills.skillCategories && Array.isArray(skills.skillCategories)) {
    skillEntries = skills.skillCategories
        .filter(cat => cat.content && cat.content.trim() !== '')
        .map(cat => `\\item \\textbf{${escapeLatex(cat.title)}:} ${escapeLatex(cat.content)}`);
  } else {
    if (skills.languages && skills.languages.trim()) {
      skillEntries.push(`\\item \\textbf{Languages:} ${escapeLatex(skills.languages)}`);
    }
    if (skills.frameworks && skills.frameworks.trim()) {
      skillEntries.push(`\\item \\textbf{Web Technologies:} ${escapeLatex(skills.frameworks)}`);
    }
    if (skills.expertise && skills.expertise.trim()) {
      skillEntries.push(`\\item \\textbf{Backend Frameworks \\& Databases:} ${escapeLatex(skills.expertise)}`);
    }
    if (skills.tools && skills.tools.trim()) {
      skillEntries.push(`\\item \\textbf{Tools \\& Platforms:} ${escapeLatex(skills.tools)}`);
    }
    if (skills.professional && skills.professional.trim()) {
      skillEntries.push(`\\item \\textbf{Design \\& Creation:} ${escapeLatex(skills.professional)}`);
    }
  }

  if (skillEntries.length === 0) return '';

  return `\\section{Technical Skills}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{-0.5em}
    ${skillEntries.join('\n    ')}
\\end{itemize}`;
};

const generateCertificationsSection = (certifications) => {
  const validCerts = certifications.filter(c => c && c.name && c.name.trim() !== '');
  if (validCerts.length === 0) return '';

  const certEntries = validCerts.map(cert => {
    const certName = escapeLatex(cert.name);
    const certLink = cert.link && cert.link.trim() !== '' ?
        `\\href{${ensureHttpProtocol(cert.link)}}{\\faLink}` : '';

    return `    \\item ${certName} 
    \\hfill ${certLink} \\textit{(Date)}`;
  }).join('\n\n');

  return `\\section{Certifications}
\\begin{itemize}[noitemsep, topsep=0pt, leftmargin=*, align=left]
${certEntries}
\\end{itemize}`;
};

const getDocumentPreamble = () => {
  const currentDate = getCurrentDate();

  return `% Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): ${currentDate}
% Current User's Login: Ashish110411

\\documentclass[a4paper,11pt]{article}

\\usepackage[a4paper, top=0.2in, bottom=0.2in, left=0.2in, right=0.2in]{geometry}
\\usepackage{url}
\\usepackage{parskip}
\\usepackage{color}
\\usepackage{graphicx}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{adjustbox}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{enumitem}
\\usepackage{supertabular}
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}
\\newlength{\\fullcollw}
\\setlength{\\fullcollw}{0.47\\textwidth}
\\usepackage{titlesec}
\\usepackage{multicol}
\\usepackage{multirow}
\\titleformat{\\section}{\\Large\\scshape\\raggedright}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{10pt}

\\usepackage[colorlinks=true, linkcolor=black, urlcolor=black, citecolor=black, unicode=true, draft=false]{hyperref}

\\begin{document}

\\pagestyle{empty}`;
};

const generateCareerObjectiveSection = (personalInfo) => {
  // Only generate if user has provided an objective
  if (!personalInfo.objective || personalInfo.objective.trim() === '') {
    return '';
  }

  return `\\section{Career Objective}
${escapeLatex(personalInfo.objective)}`;
};

const generateFullLatex = (resumeData, sectionOrder, visibleSections = null) => {
  const preamble = getDocumentPreamble();
  const header = generateHeader(resumeData.personalInfo);

  const careerObjective = (!visibleSections || visibleSections.has('objective'))
      ? generateCareerObjectiveSection(resumeData.personalInfo)
      : '';

  const sectionGenerators = {
    education: () => generateEducationSection(resumeData.education),
    experience: () => generateExperienceSection(resumeData.experience),
    projects: () => generateProjectsSection(resumeData.projects),
    skills: () => generateSkillsSection(resumeData.skills),
    certifications: () => generateCertificationsSection(resumeData.certifications)
  };

  const sections = sectionOrder
      .filter(sectionId => {
        if (sectionId === 'objective') return false;
        if (visibleSections && !visibleSections.has(sectionId)) return false;
        return sectionGenerators[sectionId] && resumeData[sectionId];
      })
      .map(sectionId => sectionGenerators[sectionId]())
      .filter(Boolean)
      .join('\n\n');

  const documentBody = `

${header}

${careerObjective}

${sections}

\\end{document}`;

  return preamble + documentBody;
};

export {
  generateFullLatex,
  escapeLatex,
  ensureHttpProtocol,
  generateHeader,
  generateEducationSection,
  generateExperienceSection,
  generateProjectsSection,
  generateSkillsSection,
  generateCertificationsSection,
  generateCareerObjectiveSection
};