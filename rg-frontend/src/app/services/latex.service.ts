import { Injectable } from '@angular/core';
import { ResumeData, PersonalInfo, Education, Experience, Project, Skills, Certification, CustomSection, SpacingSettings } from '../models/resume.models';

@Injectable({
  providedIn: 'root'
})
export class LatexService {

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

  private documentPreamble(): string {
    return `%                Made with Resugen {https://resugen-rg.netlify.app/}
%----------------------------------------------------------------------------------------
%   DOCUMENT DEFINITION
%----------------------------------------------------------------------------------------
\\documentclass[a4paper,11pt]{article}

%----------------------------------------------------------------------------------------
%   PACKAGES
%----------------------------------------------------------------------------------------
\\usepackage[a4paper, top=0.25in, bottom=0.25in, left=0.4in, right=0.4in, scale=1]{geometry}
\\usepackage{url}
\\usepackage{parskip}
\\usepackage{color}
\\usepackage{graphicx}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage{adjustbox}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{enumitem}
\\usepackage{supertabular}
\\usepackage{titlesec}
\\usepackage{multicol}
\\usepackage{multirow}
\\usepackage[style=authoryear,sorting=ynt,maxbibnames=2]{biblatex}
\\usepackage[colorlinks=true, linkcolor=black, unicode, draft=false]{hyperref}

\\newcolumntype{C}{>{\\centering\\arraybackslash}X}
\\newlength{\\fullcollw}

\\definecolor{sectiongray}{gray}{0.85}
\\newcommand{\\resheading}[1]{%
  \\vspace{0.8em}%
  \\noindent\\colorbox{sectiongray}{%
    \\makebox[\\linewidth][l]{\\Large\\scshape\\textcolor{black}{#1}}%
  }%
  \\vspace{0.2em}%
}

\\titleformat{\\section}{\\Large\\scshape\\raggedright}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{10pt}

\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    urlcolor=black,
    citecolor=black
}

\\addbibresource{citations.bib}
\\setlength\\bibitemsep{1em}
\\setlength{\\fullcollw}{0.47\\textwidth}

\\begin{document}
\\vspace{2em}
\\pagestyle{empty}
`;
  }

  private header(personalInfo: PersonalInfo): string {
    const { name, email, phone, linkedin, github, portfolio, hyperlinks } = personalInfo;
    const contactLinks: string[] = [];
    if (github) {
      contactLinks.push(`\\href{${this.httpProtocol(github)}}{GitHub}`);
    }
    if (linkedin) {
      contactLinks.push(`\\href{${this.httpProtocol(linkedin)}}{LinkedIn}`);
    }
    if (portfolio) {
      contactLinks.push(`\\href{${this.httpProtocol(portfolio)}}{Portfolio}`);
    }
    if (email) {
      contactLinks.push(`\\href{mailto:${email}}{${this.latexBasics(email)}}`);
    }
    if (phone) {
      contactLinks.push(`\\href{tel:${phone.replace(/[^\d+]/g, '')}}{${this.latexBasics(phone)}}`);
    }
    if (Array.isArray(hyperlinks)) {
      hyperlinks.forEach(hyperlink => {
        if (hyperlink && hyperlink.name && hyperlink.url) {
          contactLinks.push(
            `\\href{${this.httpProtocol(hyperlink.url)}}{${this.latexBasics(hyperlink.name)}}`
          );
        }
      });
    }
    const contactSection = contactLinks.join(' \\ $|$ \\ ');
    return `\\begin{tabularx}{\\linewidth}{@{} C @{}}
\\Huge{${this.latexBasics(name) || 'Your Name'}} \\\\[7.5pt]
${contactSection} \\\\
\\end{tabularx}`;
  }

  private renderObjective(personalInfo: PersonalInfo): string {
    if (!personalInfo.objective || personalInfo.objective.trim() === '') {
      return '';
    }
    return `\\resheading{Career Objective}
${this.latexBasics(personalInfo.objective)}
\\vspace{-0.7em}`;
  }

  private renderEducationInfo(education: Education[]): string {
    if (!education || !education.some(e => e && e.institution)) return '';
    const entries = education.filter(e => e.institution).map(edu => {
      const cgpaText = edu.cgpa ? `\\textbf{${this.latexBasics(edu.cgpa)}}` : '';
      const degreeText = edu.degree ? `\\textit{${this.latexBasics(edu.degree)}}` : '';
      return `\\textbf{${this.latexBasics(edu.institution)}} & ${this.latexBasics(edu.duration)} \\\\
${degreeText} & ${cgpaText} \\\\[6pt]`;
    }).join('\n');
    return `\\resheading{Education}
\\begin{tabularx}{\\linewidth}{@{}X r@{}} 
${entries}
\\end{tabularx}
\\vspace{-0.5em}`;
  }

  private renderExperience(experience: Experience[], vspaceSettings: SpacingSettings): string {
    if (!experience || !experience.some(e => e && e.company)) return '';
    const expSettings = vspaceSettings.experience || {};
    const afterJobTitle = expSettings.afterJobTitle || 0;
    const betweenExperiences = expSettings.betweenExperiences || 0;
    const betweenAchievements = expSettings.betweenAchievements || -0.5;
    const entries = experience.filter(e => e.company).map((exp, index) => {
      const achievements = (exp.achievements || []).filter(a => a.trim() !== '');
      let duration = '';
      if (exp.startMonth && exp.startYear) {
        if (exp.current) {
          duration = `${exp.startMonth} ${exp.startYear} - Present`;
        } else if (exp.endMonth && exp.endYear) {
          duration = `${exp.startMonth} ${exp.startYear} - ${exp.endMonth} ${exp.endYear}`;
        } else {
          duration = `${exp.startMonth} ${exp.startYear} - Present`;
        }
      } else if (exp.startYear) {
        if (exp.current) {
          duration = `${exp.startYear} - Present`;
        } else if (exp.endYear) {
          duration = `${exp.startYear} - ${exp.endYear}`;
        } else {
          duration = `${exp.startYear} - Present`;
        }
      }
      const jobTitleLine = `\\large{\\textbf{${this.latexBasics(exp.position)}}} - \\textit{${this.latexBasics(exp.company)}} \\hfill (\\textit{${this.latexBasics(duration)}}) \\\\`;
      const spacingAfterTitle = `\\vspace{${afterJobTitle}em}`;
      const achievementsList = achievements.length > 0
        ? `${spacingAfterTitle}
\\begin{itemize}[leftmargin=*, itemsep=${betweenAchievements}em]
${achievements.map(ach => `    \\item ${this.latexBasics(ach)}`).join('\n')}
\\end{itemize}`
        : '';
      const spacingBetweenExps = index < experience.filter(e => e.company).length - 1 ? `\\vspace{${betweenExperiences}em}` : '';
      return `${jobTitleLine}${achievementsList}${spacingBetweenExps}`;
    }).join('\n\n');
    return `\\resheading{Experience}
${entries}`;
  }

  private renderProjects(projects: Project[], vspaceSettings: SpacingSettings): string {
    if (!projects || !Array.isArray(projects) || !projects.some(p => p && p.name)) return '';

    const afterProjectTitle = vspaceSettings.projects?.afterProjectTitle ?? 0;
    const betweenProjects = vspaceSettings.projects?.betweenProjects ?? 0;

    const projectEntries = projects
      .filter(proj => proj && proj.name && proj.name.trim() !== '')
      .map((proj, index, arr) => {
        const descriptions = (proj.description || [])
          .filter(desc => desc && typeof desc === 'string' && desc.trim() !== '');

        const projectStatus = ''; // In ResuGen React projects didn't show status

        // Build link text instead of icons
        const links: string[] = [];
        if (proj.github) {
          links.push(`\\href{${this.httpProtocol(proj.github)}}{\\textcolor{blue}{\\textit{Repository}}}`);
        }
        if (proj.livesite) {
          links.push(`\\href{${this.httpProtocol(proj.livesite)}}{\\textcolor{blue}{\\textit{Live Demo}}}`);
        }
        const linkString = links.length > 0 ? ` ${links.join(' \\textbar\\hspace{2pt} ')} ` : '';

        // Top title row
        const titleRow = `\\textbf{${this.latexBasics(proj.name)}}${linkString ? ' \\textbar\\hspace{2pt}' + linkString : ''}`;

        // Description block in a separate tabularx
        const descriptionList = descriptions.length > 0
          ? `\\begin{tabularx}{\\linewidth}{@{}X@{}}
  \\begin{itemize}[leftmargin=*]
    \\small
    \\vspace{${afterProjectTitle}em}
${descriptions.map(desc => `    \\item ${this.latexBasics(desc)}`).join('\n')}
  \\end{itemize}
\\end{tabularx}`
          : '';

        const spacingBetweenProjects = (index < arr.length - 1 && betweenProjects !== 0)
          ? `\n\\vspace{${betweenProjects}em}` : '';

        return `\\begin{tabularx}{\\linewidth}{ @{}l X r@{} }
  ${titleRow} & & ${projectStatus} \\\\
\\end{tabularx}
${descriptionList}${spacingBetweenProjects}`;
      }).join('\n\n');

    return `\\resheading{Projects}\n\n${projectEntries}`;
  }

  private renderSkills(skills: Skills): string {
    const skillEntries: string[] = [];
    if (skills.skillCategories && Array.isArray(skills.skillCategories)) {
      skills.skillCategories
        .filter(cat => cat.content && cat.content.trim() !== '')
        .forEach(cat => skillEntries.push(`\\item \\textbf{${this.latexBasics(cat.title)}:} ${this.latexBasics(cat.content)}`));
    }
    if (skillEntries.length === 0) return '';
    return `\\resheading{Technical Skills}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{-0.5em}
    ${skillEntries.join('\n    ')}
\\end{itemize}`;
  }

  private renderCertifications(certifications: Certification[]): string {
    const validCerts = certifications.filter(c => c && c.title && c.title.trim() !== '');
    if (validCerts.length === 0) return '';

    const certEntries = validCerts.map(cert => {
      const certName = this.latexBasics(cert.title);
      const certLink = cert.link && cert.link.trim() !== ''
        ? `\\href{${this.httpProtocol(cert.link)}}{\\textcolor{blue}{\\textit{Certificate}}}`
        : '';

      let dateString = '';
      if (cert.month && cert.year) {
        dateString = `${cert.month}'${cert.year.slice(-2)}`;
      } else if (cert.year) {
        dateString = `'${cert.year.slice(-2)}`;
      } else if (cert.month) {
        dateString = cert.month;
      }
      const dateDisplay = dateString ? `\\textit{(${this.latexBasics(dateString)})}` : '';

      return `    \\item ${certName} 
    \\hfill ${certLink} ${dateDisplay}`;
    }).join('\n\n');

    return `\\resheading{Certifications}
\\begin{itemize}[noitemsep, topsep=0pt, leftmargin=*, align=left]
    \\vspace{-0.5em}
${certEntries}
\\end{itemize}`;
  }

  private renderCustomSections(customSections: CustomSection[]): string {
    if (!Array.isArray(customSections)) return '';
    return customSections
      .filter(cs => cs.name && cs.points && cs.points.length)
      .map(cs => {
        const points = cs.points.filter(pt => pt && pt.trim());
        if (!cs.name.trim() || points.length === 0) return '';
        return `\\resheading{${this.latexBasics(cs.name)}}
\\begin{itemize}[leftmargin=*, itemsep=-0.75em]
${points.map(pt => `  \\item ${this.latexBasics(pt)}`).join('\n')}
\\end{itemize}`;
      })
      .filter(Boolean)
      .join('\n\n');
  }

  public generateLatex(resumeData: ResumeData, sectionOrder: string[], visibleSections: Set<string>, vspaceSettings: SpacingSettings): string {
    const preamble = this.documentPreamble();
    const headerSection = this.header(resumeData.personalInfo);

    const careerObjective = visibleSections.has('objective')
      ? this.renderObjective(resumeData.personalInfo)
      : '';

    const sections = sectionOrder
      .filter(sectionId => {
        if (sectionId === 'objective') return false;
        if (!visibleSections.has(sectionId)) return false;
        if (['education', 'experience', 'projects', 'skills', 'certifications'].includes(sectionId)) {
          return true;
        }
        if (sectionId.startsWith('customSection-')) {
          return resumeData.customSections && resumeData.customSections.some(cs => cs.id === sectionId);
        }
        return false;
      })
      .map(sectionId => {
        if (sectionId === 'education') return this.renderEducationInfo(resumeData.education);
        if (sectionId === 'experience') return this.renderExperience(resumeData.experience, vspaceSettings);
        if (sectionId === 'projects') return this.renderProjects(resumeData.projects, vspaceSettings);
        if (sectionId === 'skills') return this.renderSkills(resumeData.skills);
        if (sectionId === 'certifications') return this.renderCertifications(resumeData.certifications);
        if (sectionId.startsWith('customSection-')) {
          const customSection = resumeData.customSections.find(cs => cs.id === sectionId);
          if (customSection) {
            return this.renderCustomSections([customSection]);
          }
        }
        return '';
      })
      .filter(Boolean)
      .join('\n\n');

    const documentBody = `

${headerSection}

${careerObjective}

${sections}

\\end{document}`;

    return preamble + documentBody;
  }
}
