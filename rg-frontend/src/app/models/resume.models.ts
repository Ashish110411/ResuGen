export interface Hyperlink {
  name: string;
  url: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  objective: string;
  hyperlinks?: Hyperlink[];
}

export interface Education {
  institution: string;
  duration: string;
  degree: string;
  cgpa: string;
}

export interface Experience {
  company: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  current: boolean;
  position: string;
  achievements: string[];
}

export interface Project {
  name: string;
  github: string;
  livesite: string;
  description: string[];
}

export interface SkillCategory {
  id: string;
  title: string;
  content: string;
}

export interface Skills {
  skillCategories: SkillCategory[];
}

export interface Certification {
  title: string;
  link: string;
  month: string;
  year: string;
}

export interface CustomSection {
  id: string;
  name: string;
  points: string[];
}

export interface SpacingSettings {
  experience: {
    afterJobTitle: number;
    betweenExperiences: number;
    betweenAchievements: number;
  };
  projects: {
    afterProjectTitle: number;
    betweenProjects: number;
  };
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skills;
  certifications: Certification[];
  customSections: CustomSection[];
}

export interface ResumeDto {
  id?: number;
  name: string;
  resumeData: string; // JSON string of ResumeData
  sectionOrder: string; // JSON string of string[]
  visibleSections: string; // JSON string of string[]
  vspaceSettings: string; // JSON string of SpacingSettings
}

export interface ResumeListDto {
  id: number;
  name: string;
  updatedAt: string;
}
