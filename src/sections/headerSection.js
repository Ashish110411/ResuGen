import escapeLatex from '../common/escapeLatex';

export function generateHeader(personalInfo) {
  const { name, email, phone, linkedin, github, portfolio, leetcode } = personalInfo;
  const contactLinks = [];
  if (email) {
    contactLinks.push(`\\faIcon{envelope}\n    \\href{mailto:${email}}{\\color{black}${escapeLatex(email)}}`);
  }
  if (phone) {
    contactLinks.push(`\\faIcon{phone}\n    \\href{tel:${phone}}{\\color{black}${escapeLatex(phone)}}`);
  }
  if (linkedin) {
    contactLinks.push(`\\faIcon{linkedin}\n    \\href{${linkedin}}{\\color{black}LinkedIn}`);
  }
  if (github) {
    contactLinks.push(`\\faIcon{github}\n    \\href{${github}}{\\color{black}GitHub}`);
  }
  if (portfolio) {
    contactLinks.push(`\\faIcon{code}\n    \\href{${portfolio}}{\\color{black}Portfolio}`);
  }
  if (leetcode) {
    contactLinks.push(`\\faIcon{code-branch}\n    \\href{${leetcode}}{\\color{black}LeetCode}`);
  }
  const contactSection = contactLinks.join(' \\hspace{5px}\n    ');
  return `\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(name) || 'Your Name'}} \\\\ \\vspace{8pt}
    \\small 
    ${contactSection}
\\end{center}

\\vspace{-8pt}`;
}