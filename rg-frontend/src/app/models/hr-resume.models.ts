export interface HrHyperlink {
  name: string;
  url: string;
}

export interface HrPersonalInfo {
  name: string;
  headline?: string; // e.g. "Human Resources Professional" (optional)
  phone: string;
  email: string;
  location: string; // e.g. "City, State, Country"
  linkedin: string;
  portfolio?: string;
  hyperlinks?: HrHyperlink[];
  summary: string; // Professional Summary
}

export interface HrEducation {
  institution: string;
  degree: string;
  location: string;
  year?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  current?: boolean;
}

export interface HrExperience {
  company: string;
  position: string;
  location: string;
  duration?: string; // e.g. "Month Year -- Present"
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  current?: boolean;
  achievements: string[];
}

export interface HrCustomSection {
  id: string;
  name: string;
  points: string[];
}

export interface HrResumeData {
  personalInfo: HrPersonalInfo;
  education: HrEducation[];
  experience: HrExperience[];
  keySkills: string[];
  technicalSkills: string[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  customSections: HrCustomSection[];
}

export interface HrSpacingSettings {
  sectionSpacing: number; // pt adjustment
  itemSpacing: number;    // pt adjustment
}

export function isHrResume(dto: any): boolean {
  if (!dto) return false;
  if (dto.templateType === 'hr') return true;
  if (dto.templateType === 'sde') return false;
  try {
    const raw = dto.resumeData;
    if (!raw) return false;
    if (typeof raw === 'string') {
      if (raw.includes('"templateType":"hr"') || raw.includes('"templateType": "hr"')) return true;
      if (raw.includes('"keySkills"') || raw.includes('"headline"')) return true;
      const data = JSON.parse(raw);
      if (data.templateType === 'hr') return true;
      if (data.keySkills || (data.personalInfo && data.personalInfo.headline)) return true;
    } else if (typeof raw === 'object') {
      if (raw.templateType === 'hr') return true;
      if (raw.keySkills || (raw.personalInfo && raw.personalInfo.headline)) return true;
    }
  } catch (e) {}
  return false;
}

export function isSdeResume(dto: any): boolean {
  return !isHrResume(dto);
}
