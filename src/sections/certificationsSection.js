import escapeLatex from '../common/escapeLatex';

export function generateCertificationsSection(certifications) {
  if (!certifications || !Array.isArray(certifications)) return '';
  const validCerts = certifications.filter(c => c && typeof c === 'object' && c.name && c.name.trim() !== '');
  if (validCerts.length === 0) return '';
  const certEntries = validCerts
    .map(cert => {
      let certText = escapeLatex(cert.name);
      if (cert.link && cert.link.trim() !== '') {
        certText += ` \\href{${cert.link}}{\\textcolor{blue}{(Link)}}`;
      }
      return `\\resumeItem{${certText}}`;
    })
    .join('\\vspace{4pt}\n');
  return `\\vspace{-12pt}
\\section{Certifications \\& Achievements}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item{
        \\begin{itemize}[leftmargin=0.15in, itemsep=-2pt]
            ${certEntries}
        \\end{itemize}
    }
\\end{itemize}`;
}