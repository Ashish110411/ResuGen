const latexBasics = (str) => {
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
};

const httpProtocol = (url) => {
    if (!url || typeof url !== 'string') return url;
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return `https://${trimmedUrl}`;
    }
    return trimmedUrl;
};

const documentPreamble = () => {
    return `%----------------------------------------------------------------------------------------
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
};

const header = (personalInfo) => {
    const { name, email, phone, linkedin, github, portfolio, hyperlinks } = personalInfo;
    const contactLinks = [];
    if (github) {
        contactLinks.push(`\\href{${httpProtocol(github)}}{\\raisebox{-0.05\\height}\\faGithub\\ GitHub}`);
    }
    if (linkedin) {
        contactLinks.push(`\\href{${httpProtocol(linkedin)}}{\\raisebox{-0.05\\height}\\faLinkedin\\ LinkedIn}`);
    }
    if (portfolio) {
        contactLinks.push(`\\href{${httpProtocol(portfolio)}}{\\raisebox{-0.05\\height}\\faGlobe \\ Portfolio}`);
    }
    if (email) {
        contactLinks.push(`\\href{mailto:${email}}{\\raisebox{-0.05\\height}\\faEnvelope \\ ${latexBasics(email)}}`);
    }
    if (phone) {
        contactLinks.push(`\\href{tel:${phone.replace(/[^\d+]/g, '')}}{\\raisebox{-0.05\\height}\\faMobile \\ ${latexBasics(phone)}}`);
    }
    if (Array.isArray(hyperlinks)) {
        hyperlinks.forEach(hyperlink => {
            if (hyperlink && hyperlink.name && hyperlink.url) {
                contactLinks.push(
                    `\\href{${httpProtocol(hyperlink.url)}}{${latexBasics(hyperlink.name)}}`
                );
            }
        });
    }
    const contactSection = contactLinks.join(' \\ $|$ \\ ');
    return `\\begin{tabularx}{\\linewidth}{@{} C @{}}
\\Huge{${latexBasics(name) || 'Your Name'}} \\\\[7.5pt]
${contactSection} \\\\
\\end{tabularx}`;
};

const renderObjective = (personalInfo) => {
    if (!personalInfo.objective || personalInfo.objective.trim() === '') {
        return '';
    }
    return `\\resheading{Career Objective}
${latexBasics(personalInfo.objective)}
\\vspace{-0.7em}`;
};

const renderEducationInfo = (education) => {
    if (!education || !education.some(e => e && e.institution)) return '';
    const entries = education.filter(e => e.institution).map(edu => {
        const cgpaText = edu.cgpa ? `\\textbf{${latexBasics(edu.cgpa)}}` : '';
        const degreeText = edu.degree ? `\\textit{${latexBasics(edu.degree)}}` : '';
        return `\\textbf{${latexBasics(edu.institution)}} & ${latexBasics(edu.duration)} \\\\
${degreeText} & ${cgpaText} \\\\[6pt]`;
    }).join('\n');
    return `\\resheading{Education}
\\begin{tabularx}{\\linewidth}{@{}X r@{}} 
${entries}
\\end{tabularx}
\\vspace{-0.5em}`;
};

const renderExperience = (experience, vspaceSettings = {}) => {
    if (!experience || !experience.some(e => e && e.company)) return '';
    const expSettings = vspaceSettings.experience || {};
    const afterJobTitle = expSettings.afterJobTitle || 0;
    const betweenExperiences = expSettings.betweenExperiences || 0;
    const betweenAchievements = expSettings.betweenAchievements || -0.5;
    const entries = experience.filter(e => e.company).map((exp, index) => {
        const achievements = exp.achievements.filter(a => a.trim() !== '');
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
        const jobTitleLine = `\\large{\\textbf{${latexBasics(exp.position)}}} - \\textit{${latexBasics(exp.company)}} \\hfill (\\textit{${latexBasics(duration)}}) \\\\`;
        const spacingAfterTitle = `\\vspace{${afterJobTitle}em}`;
        const achievementsList = achievements.length > 0
            ? `${spacingAfterTitle}
\\begin{itemize}[leftmargin=*, itemsep=${betweenAchievements}em]
${achievements.map(ach => `    \\item ${latexBasics(ach)}`).join('\n')}
\\end{itemize}`
            : '';
        const spacingBetweenExps = index < experience.filter(e => e.company).length - 1 ? `\\vspace{${betweenExperiences}em}` : '';
        return `${jobTitleLine}${achievementsList}${spacingBetweenExps}`;
    }).join('\n\n');
    return `\\resheading{Experience}
${entries}`;
};

const renderProjects = (projects, vspaceSettings = {}) => {
    if (!projects || !Array.isArray(projects) || !projects.some(p => p && p.name)) return '';
    const afterProjectTitle = vspaceSettings.projects?.afterProjectTitle ?? 0;
    const betweenProjects = vspaceSettings.projects?.betweenProjects ?? 0;
    const projectEntries = projects
        .filter(proj => proj && proj.name && proj.name.trim() !== '')
        .map((proj, index, arr) => {
            const descriptions = (proj.description || []).filter(desc => desc && typeof desc === 'string' && desc.trim() !== '');
            const projectStatus = proj.status
                ? `\\textit{(${proj.status})}`
                : (proj.ongoing ? '(\\textit{Ongoing})' : proj.date ? `\\textit{(${proj.date})}` : '');
            const links = [];
            if (proj.github) {
                links.push(`\\href{${httpProtocol(proj.github)}}{\\faGithub}`);
            }
            if (proj.livesite) {
                links.push(`\\href{${httpProtocol(proj.livesite)}}{\\faGlobe}`);
            }
            const linkString = links.length > 0 ? ` ${links.join(' ')} ` : '';
            const titleRow = `\\textbf{${latexBasics(proj.name)}} \\textbar \\hspace{2pt} \\textit{Self Project}${linkString}`;
            const descriptionList = descriptions.length > 0
                ? `\\begin{itemize}[leftmargin=*]
  \\small
  \\vspace{${afterProjectTitle}em}
${descriptions.map(desc => `    \\item ${latexBasics(desc)}`).join('\n')}
\\end{itemize}`
                : '';
            const spacingBetweenProjects = (index < arr.length - 1 && betweenProjects !== 0)
                ? `\n\\vspace{${betweenProjects}em}` : '';
            return `\\begin{tabularx}{\\linewidth}{ @{}l X r@{} }
  ${titleRow} & & ${projectStatus} \\\\
\\end{tabularx}
${descriptionList}${spacingBetweenProjects}`;
        }).join('\n\n');
    return `\\resheading{Projects}

${projectEntries}`;
};

const renderSkills = (skills) => {
    let skillEntries = [];
    if (skills.skillCategories && Array.isArray(skills.skillCategories)) {
        skillEntries = skills.skillCategories
            .filter(cat => cat.content && cat.content.trim() !== '')
            .map(cat => `\\item \\textbf{${latexBasics(cat.title)}:} ${latexBasics(cat.content)}`);
    } else {
        if (skills.languages && skills.languages.trim()) {
            skillEntries.push(`\\item \\textbf{Languages:} ${latexBasics(skills.languages)}`);
        }
        if (skills.frameworks && skills.frameworks.trim()) {
            skillEntries.push(`\\item \\textbf{Web Technologies:} ${latexBasics(skills.frameworks)}`);
        }
        if (skills.expertise && skills.expertise.trim()) {
            skillEntries.push(`\\item \\textbf{Backend Frameworks \\& Databases:} ${latexBasics(skills.expertise)}`);
        }
        if (skills.tools && skills.tools.trim()) {
            skillEntries.push(`\\item \\textbf{Tools \\& Platforms:} ${latexBasics(skills.tools)}`);
        }
        if (skills.professional && skills.professional.trim()) {
            skillEntries.push(`\\item \\textbf{Design \\& Creation:} ${latexBasics(skills.professional)}`);
        }
    }
    if (skillEntries.length === 0) return '';
    return `\\resheading{Technical Skills}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{-0.5em}
    ${skillEntries.join('\n    ')}
\\end{itemize}`;
};

const renderCertifications = (certifications) => {
    const validCerts = certifications.filter(c => c && c.title && c.title.trim() !== '');
    if (validCerts.length === 0) return '';
    const certEntries = validCerts.map(cert => {
        const certName = latexBasics(cert.title);
        const certLink = cert.link && cert.link.trim() !== ''
            ? `\\href{${httpProtocol(cert.link)}}{\\faExternalLink*}` : '';
        let dateString = '';
        if (cert.month && cert.year) {
            dateString = `${cert.month} ${cert.year}`;
        } else if (cert.year) {
            dateString = cert.year;
        } else if (cert.month) {
            dateString = cert.month;
        }
        const dateDisplay = dateString ? `\\textit{(${latexBasics(dateString)})}` : '';
        return `    \\item ${certName}  ${certLink}
    \\hfill ${dateDisplay}`;
    }).join('\n\n');
    return `\\resheading{Certifications}
\\begin{itemize}[noitemsep, topsep=0pt, leftmargin=*, align=left]
${certEntries}
\\end{itemize}`;
};

const renderCustomSections = (customSections) => {
    if (!Array.isArray(customSections)) return '';
    return customSections
        .filter(cs => cs.name && cs.points && cs.points.length)
        .map(cs => {
            const points = cs.points.filter(pt => pt && pt.trim());
            if (!cs.name.trim() || points.length === 0) return '';
            return `\\resheading{${latexBasics(cs.name)}}
\\begin{itemize}[leftmargin=*, itemsep=-0.75em]
${points.map(pt => `  \\item ${latexBasics(pt)}`).join('\n')}
\\end{itemize}`;
        })
        .filter(Boolean)
        .join('\n\n');
};

const latexResume = (resumeData, sectionOrder, visibleSections = null, vspaceSettings = {}) => {
    const preamble = documentPreamble();
    const headerSection = header(resumeData.personalInfo);

    const careerObjective = (!visibleSections || visibleSections.has('objective'))
        ? renderObjective(resumeData.personalInfo)
        : '';

    const sections = sectionOrder
        .filter(sectionId => {
            if (sectionId === 'objective') return false;
            if (visibleSections && !visibleSections.has(sectionId)) return false;
            if (['education', 'experience', 'projects', 'skills', 'certifications'].includes(sectionId)) {
                return true;
            }
            if (sectionId.startsWith('customSection-')) {
                return resumeData.customSections && resumeData.customSections.find(cs => cs.id === sectionId);
            }
            return false;
        })
        .map(sectionId => {
            if (sectionId === 'education') return renderEducationInfo(resumeData.education);
            if (sectionId === 'experience') return renderExperience(resumeData.experience, vspaceSettings);
            if (sectionId === 'projects') return renderProjects(resumeData.projects, vspaceSettings);
            if (sectionId === 'skills') return renderSkills(resumeData.skills);
            if (sectionId === 'certifications') return renderCertifications(resumeData.certifications);
            if (sectionId.startsWith('customSection-')) {
                const customSection = resumeData.customSections.find(cs => cs.id === sectionId);
                if (customSection) {
                    return renderCustomSections([customSection]);
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
};

export {
    latexResume,
    latexBasics,
    httpProtocol,
    header,
    renderEducationInfo,
    renderExperience,
    renderProjects,
    renderSkills,
    renderCertifications,
    renderObjective
};