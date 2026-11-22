import { Injectable } from '@angular/core';
import { HrResumeData, HrCustomSection, HrSpacingSettings } from '../models/hr-resume.models';

@Injectable({
  providedIn: 'root'
})
export class HrLatexService {

  constructor() { }

  public latexBasics(str: string): string {
    if (typeof str !== 'string') return '';
    let result = str.replace(/\*([^*]+)\*/g, '\\textbf{$1}');
    const parts = result.split(/(\\textbf\{[^}]*\})/);
    result = parts.map((part, index) => {
      if (index % 2 === 1) return part;
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
  }

  public httpProtocol(url: string): string {
    if (!url || typeof url !== 'string') return url;
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return `https://${trimmedUrl}`;
    }
    return trimmedUrl;
  }

  public generateHrLatex(
    resumeData: HrResumeData,
    sectionOrder: string[],
    visibleSections: Set<string>,
    sectionColumnMap?: { [key: string]: 'left' | 'right' },
    spacingSettings?: HrSpacingSettings
  ): string {
    const name = this.latexBasics(resumeData.personalInfo.name || 'YOUR NAME').toUpperCase();
    const headline = resumeData.personalInfo.headline ? this.latexBasics(resumeData.personalInfo.headline) : '';

    // Contact supertabular in Right column
    const contactRows: string[] = [];
    if (resumeData.personalInfo.phone) {
      contactRows.push(`    \\footnotesize\\faPhone & ${this.latexBasics(resumeData.personalInfo.phone)} \\\\`);
    }
    if (resumeData.personalInfo.email) {
      const email = this.latexBasics(resumeData.personalInfo.email);
      contactRows.push(`    \\footnotesize\\faEnvelope & \\href{mailto:${email}}{${email}} \\\\`);
    }
    if (resumeData.personalInfo.location) {
      contactRows.push(`    \\footnotesize\\faMapMarker* & ${this.latexBasics(resumeData.personalInfo.location)} \\\\`);
    }
    if (resumeData.personalInfo.linkedin) {
      const lUrl = this.httpProtocol(resumeData.personalInfo.linkedin);
      contactRows.push(`    \\footnotesize\\faLinkedin & \\href{${lUrl}}{LinkedIn Profile} \\\\`);
    }
    if (resumeData.personalInfo.portfolio) {
      const pUrl = this.httpProtocol(resumeData.personalInfo.portfolio);
      contactRows.push(`    \\footnotesize\\faGlobe & \\href{${pUrl}}{Portfolio} \\\\`);
    }
    if (resumeData.personalInfo.hyperlinks && Array.isArray(resumeData.personalInfo.hyperlinks)) {
      resumeData.personalInfo.hyperlinks.forEach(link => {
        if (link && link.name && link.url) {
          const lUrl = this.httpProtocol(link.url);
          const lName = this.latexBasics(link.name);
          contactRows.push(`    \\footnotesize\\faLink & \\href{${lUrl}}{${lName}} \\\\`);
        }
      });
    }

    const contactTable = contactRows.length > 0
      ? `\\vspace{0.005\\textheight}\n\\begin{tabular}{@{}lp{0.82\\linewidth}@{}}\n${contactRows.join('\n')}\n\\end{tabular}`
      : '';

    // Render individual section blocks
    const renderSummary = () => {
      if (!resumeData.personalInfo.summary) return '';
      return `\\section{professional summary}\n${this.latexBasics(resumeData.personalInfo.summary)}`;
    };

    const renderExperience = () => {
      if (!resumeData.experience || resumeData.experience.length === 0) return '';
      const expEntries = resumeData.experience.map(exp => {
        let dur = exp.duration || '';
        if (exp.startMonth || exp.startYear || exp.endMonth || exp.endYear || exp.current) {
          const start = [exp.startMonth, exp.startYear].filter(Boolean).join(' ');
          const end = exp.current ? 'Present' : [exp.endMonth, exp.endYear].filter(Boolean).join(' ');
          if (start && end) {
            dur = `${start} -- ${end}`;
          } else if (start) {
            dur = start;
          } else if (end) {
            dur = end;
          }
        }
        const achItems = (exp.achievements || []).filter(a => a && a.trim()).map(a => `    \\item ${this.latexBasics(a)}`).join('\n');
        const achBlock = achItems ? `\n\\begin{itemize}[\n    noitemsep,\n    leftmargin=3.5mm,\n    rightmargin=0mm,\n    topsep=2pt\n]\n${achItems}\n\\end{itemize}` : '';
        return `\\entry{${this.latexBasics(exp.company)}}\n{${this.latexBasics(exp.position)}}\n{${this.latexBasics(exp.location)}}\n{${this.latexBasics(dur)}}${achBlock}`;
      }).join('\n\n\\vspace{0.75em}\n\n');
      return `\\section{work experience}\n\n${expEntries}`;
    };

    const renderEducation = () => {
      if (!resumeData.education || resumeData.education.length === 0) return '';
      const eduEntries = resumeData.education.map(edu => {
        let yr = edu.year || '';
        if (edu.startMonth || edu.startYear || edu.endMonth || edu.endYear || edu.current) {
          const start = [edu.startMonth, edu.startYear].filter(Boolean).join(' ');
          const end = edu.current ? 'Present' : [edu.endMonth, edu.endYear].filter(Boolean).join(' ');
          if (start && end) {
            yr = `${start} -- ${end}`;
          } else if (start) {
            yr = start;
          } else if (end) {
            yr = end;
          }
        }
        return `\\entry{${this.latexBasics(edu.institution)}}\n{${this.latexBasics(edu.degree)}}\n{${this.latexBasics(edu.location)}}\n{${this.latexBasics(yr)}}`;
      }).join('\n\n\\vspace{0.75em}\n\n');
      return `\\section{education}\n\n${eduEntries}`;
    };

    const renderKeySkills = () => {
      if (!resumeData.keySkills || resumeData.keySkills.length === 0) return '';
      const items = resumeData.keySkills.filter(s => s && s.trim()).map(s => `    \\item ${this.latexBasics(s)}`).join('\n');
      return `\\section{key skills}\n\n\\begin{itemize}[\n    noitemsep,\n    leftmargin=3.5mm,\n    rightmargin=0mm,\n    topsep=2pt\n]\n${items}\n\\end{itemize}`;
    };

    const renderTechnicalSkills = () => {
      if (!resumeData.technicalSkills || resumeData.technicalSkills.length === 0) return '';
      const items = resumeData.technicalSkills.filter(s => s && s.trim()).map(s => `    \\item ${this.latexBasics(s)}`).join('\n');
      return `\\section{technical skills}\n\n\\begin{itemize}[\n    noitemsep,\n    leftmargin=3.5mm,\n    rightmargin=0mm,\n    topsep=2pt\n]\n${items}\n\\end{itemize}`;
    };

    const renderCertifications = () => {
      if (!resumeData.certifications || resumeData.certifications.length === 0) return '';
      const items = resumeData.certifications.filter(c => c && c.trim()).map(c => `    \\item ${this.latexBasics(c)}`).join('\n');
      return `\\section{certifications}\n\n\\begin{itemize}[\n    noitemsep,\n    leftmargin=3.5mm,\n    rightmargin=0mm,\n    topsep=2pt\n]\n${items}\n\\end{itemize}`;
    };

    const renderAchievements = () => {
      if (!resumeData.achievements || resumeData.achievements.length === 0) return '';
      const achItems = resumeData.achievements.filter(a => a && a.trim()).map(a => `    \\item ${this.latexBasics(a)}`).join('\n');
      return `\\section{achievements}\n\n\\begin{itemize}[\n    noitemsep,\n    leftmargin=3.5mm,\n    rightmargin=0mm,\n    topsep=2pt\n]\n${achItems}\n\\end{itemize}`;
    };

    const renderLanguages = () => {
      if (!resumeData.languages || resumeData.languages.length === 0) return '';
      const items = resumeData.languages.filter(l => l && l.trim()).map(l => `    \\item ${this.latexBasics(l)}`).join('\n');
      return `\\section{languages}\n\n\\begin{itemize}[\n    noitemsep,\n    leftmargin=3.5mm,\n    rightmargin=0mm,\n    topsep=2pt\n]\n${items}\n\\end{itemize}`;
    };

    const renderCustomSectionLeft = (cs: HrCustomSection) => {
      const items = (cs.points || []).filter(p => p && p.trim()).map(p => `    \\item ${this.latexBasics(p)}`).join('\n');
      return `\\section{${this.latexBasics(cs.name.toLowerCase())}}\n\n\\begin{itemize}[\n    noitemsep,\n    leftmargin=3.5mm,\n    rightmargin=0mm,\n    topsep=2pt\n]\n${items}\n\\end{itemize}`;
    };

    const renderCustomSectionRight = (cs: HrCustomSection) => {
      const items = (cs.points || []).filter(p => p && p.trim()).map(p => `    \\item ${this.latexBasics(p)}`).join('\n');
      return `\\section{${this.latexBasics(cs.name.toLowerCase())}}\n\n\\begin{itemize}[\n    noitemsep,\n    leftmargin=3.5mm,\n    rightmargin=0mm,\n    topsep=2pt\n]\n${items}\n\\end{itemize}`;
    };

    // Auto-columning logic with column placement override from sectionColumnMap:
    // User can assign any section to Left (0.7) or Right (0.3)
    const leftSections: string[] = [];
    const rightSections: string[] = [];

    const activeOrder = sectionOrder.filter(id => visibleSections.has(id));

    // Default column assignment
    const defaultColumnAssignment: { [key: string]: 'left' | 'right' } = {
      summary: 'left',
      experience: 'left',
      education: 'left',
      keySkills: 'right',
      technicalSkills: 'right',
      certifications: 'right',
      achievements: 'right',
      languages: 'right'
    };

    for (const sectionId of activeOrder) {
      let targetCol: 'left' | 'right' = 'right';
      if (sectionColumnMap && sectionColumnMap[sectionId]) {
        targetCol = sectionColumnMap[sectionId];
      } else if (defaultColumnAssignment[sectionId]) {
        targetCol = defaultColumnAssignment[sectionId];
      } else if (sectionId.startsWith('customSection-')) {
        const cs = (resumeData.customSections || []).find(c => c.id === sectionId);
        if (cs && cs.points && cs.points.length > 0) {
          const avgLen = cs.points.reduce((sum, p) => sum + (p ? p.length : 0), 0) / cs.points.length;
          targetCol = avgLen > 30 ? 'left' : 'right';
        }
      }

      let rendered = '';
      if (sectionId === 'summary') {
        rendered = renderSummary();
      } else if (sectionId === 'experience') {
        rendered = renderExperience();
      } else if (sectionId === 'education') {
        rendered = renderEducation();
      } else if (sectionId === 'keySkills') {
        rendered = renderKeySkills();
      } else if (sectionId === 'technicalSkills') {
        rendered = renderTechnicalSkills();
      } else if (sectionId === 'certifications') {
        rendered = renderCertifications();
      } else if (sectionId === 'achievements') {
        rendered = renderAchievements();
      } else if (sectionId === 'languages') {
        rendered = renderLanguages();
      } else if (sectionId.startsWith('customSection-')) {
        const cs = (resumeData.customSections || []).find(c => c.id === sectionId);
        if (cs && cs.points && cs.points.length > 0) {
          rendered = targetCol === 'left' ? renderCustomSectionLeft(cs) : renderCustomSectionRight(cs);
        }
      }

      if (rendered) {
        if (targetCol === 'left') {
          leftSections.push(rendered);
        } else {
          rightSections.push(rendered);
        }
      }
    }

    const leftColBody = leftSections.join('\n\n');
    const rightColBody = rightSections.join('\n\n');

    return `%                Made with Resugen {https://resugen-rg.netlify.app/}
%----------------------------------------------------------------------------------------
%   DOCUMENT DEFINITION
%----------------------------------------------------------------------------------------
\\documentclass[a4paper,11pt]{article}

\\usepackage[english]{babel}
\\usepackage{cmbright}
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage{fontawesome5}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage[sf]{libertine}
\\usepackage{microtype}
\\usepackage{paracol}
\\usepackage{supertabular}
\\usepackage{titlesec}
\\usepackage{etoolbox}

\\hypersetup{
    colorlinks,
    urlcolor=black,
    linkcolor=black
}

% Geometry
\\geometry{hmargin=1cm, vmargin=1cm}
\\columnratio{0.7, 0.3}
\\setlength\\columnsep{0.05\\textwidth}
\\setlength\\parindent{0pt}
\\setlength{\\smallskipamount}{4pt plus 1pt minus 1pt}
\\setlength{\\medskipamount}{8pt plus 2pt minus 2pt}
\\setlength{\\bigskipamount}{12pt plus 3pt minus 3pt}

% Style
\\pagestyle{empty}
\\sloppy
\\emergencystretch=1.5em

\\titleformat{\\section}
{\\scshape\\LARGE\\raggedright}
{}{0em}{}[\\titlerule]

\\titlespacing{\\section}{0pt}{10pt plus 2pt minus 2pt}{4pt plus 1pt minus 1pt}

% Custom Commands
\\newcommand{\\heading}[2]{
    \\centering{\\sffamily\\Huge #1}\\ifstrequal{#2}{}{}{\\\\\\vspace{2pt}{\\large #2}}
}

\\newcommand{\\entry}[4]{
    {\\textbf{#1}} \\hfill #3 \\\\
    #2 \\hfill #4
}

\\newcommand{\\tableentry}[3]{
    \\textsc{#1} & #2
    \\expandafter\\ifstrequal\\expandafter{#3}{}{\\\\}{\\\\[5pt]}
}

\\begin{document}

\\begin{paracol}{2}

% Name and Professional Headline
\\heading{${name}}{${headline}}

\\switchcolumn

% Contact Information
${contactTable}

\\switchcolumn*

% Left Column: Summary, Experience, Education, Major Sections
${leftColBody}

\\switchcolumn

% Right Column: Key Skills, Tech Skills, Certifications, Achievements, Languages
${rightColBody}

\\end{paracol}

\\vspace*{\\fill}

\\end{document}
`;
  }
}
