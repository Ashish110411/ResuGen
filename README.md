# ResuGen

ResuGen is an innovative web application that provides a live LaTeX resume builder, tailored for users unfamiliar with LaTeX coding. It offers a seamless way to craft ATS-friendly resumes using a simple, guided form interface—trusted by thousands and designed by hiring experts to help your skills shine.

---

## Table of Contents

1. [Demo](#demo)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [How It Works](#how-it-works)
5. [Getting Started](#getting-started)
6. [Technologies Used](#technologies-used)
7. [License](#license)

---

## Demo

Try the app live: [https://resugen-rg.netlify.app/](https://resugen-rg.netlify.app/)

> **Recommended:** For the best experience, use a desktop browser.

---

## Features

- **Real-time LaTeX Compilation:** Instantly preview your resume as you edit.
- **Download Options:** Export your resume as PDF or LaTeX (.tex) files.
- **Creative UI:** Engaging, professional, and user-friendly interface.
- **Section Control:** Show or hide any resume section as needed.
- **Custom Skill Categories:** Rename skill sections to fit your expertise.
- **Adjustable Spacing:** Select from compact, balanced, or spacious layouts.
- **Local Storage Support:** Your data persists in your browser; reset all with one click.
- **ATS-Friendly:** Designed for compatibility with applicant tracking systems.

---
### **Added New Features (13-08)**
1. **Custom hyperlinks:** Users can now include additional links in their personal details, such as HackerRank, Google Scholar, Codeforces, and more.
2. **Custom section:** You can add any section of your choice to the resume (e.g., Volunteering, Leadership, etc.), with flexible content.

### **Updated Old Features (13-08)**
1. **Recompile button:** Added a button to manually trigger recompilation of the LaTeX preview.
2. **Removed last updated details:** Footer showing "Last updated" has been removed for clearer output.
3. **Career Objective section fixed at top:** The Career Objective section is always at the top (non-draggable). It is optional to fill—users can hide it if desired.

---

## Screenshots

Below are sample screenshots of ResuGen in action.

### 1. Home / Entry Page
![sample1](assets/sample1.png)

### 2. Personal Information Input
![sample2](assets/sample2.png)

### 3. Education Section
![sample3](assets/sample3.png)

### 4. Experience Section
![sample4](assets/sample4.png)

### 5. Skills Section
![sample5](assets/sample5.png)

### 6. Projects Section
![sample6](assets/sample6.png)

### 7. Certifications Section
![sample7](assets/sample7.png)

### 8. Custom Section
![sample8](assets/sample9.png)

### 9. Section Reordering and Showing/Hiding
![sample9](assets/sample8.png)

## Final Resume Preview
![sample9](assets/resume.jpg)

---

## How It Works

1. **Fill Out Simple Forms:** Enter your details in dedicated sections for personal info, education, experience, skills, projects, etc.
2. **Real-Time Preview:** The app compiles your input and displays a live LaTeX-rendered preview.
3. **Customize:** Show/hide sections, rename skill categories, and choose your preferred spacing.
4. **Export:** Download your resume instantly as a polished PDF or the raw LaTeX source.
5. **Persistence:** Your data is saved locally until you reset it.

---

## Getting Started

### Online Usage

No installation required—just visit [https://resugen-rg.netlify.app/](https://resugen-rg.netlify.app/) in your desktop browser.

### Local Installation

To run ResuGen locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ashish110411/ResuGen.git
   cd ResuGen
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run with Docker

You can build and run ResuGen using Docker:

1. **Build the Docker image:**
   ```bash
   docker build -t resugen .
   ```
2. **Run the container:**
   ```bash
   docker run -p 3000:3000 resugen
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Technologies Used

- **JavaScript** – Main application logic
- **CSS** – Styling and responsive design
- **HTML** – Structure
- **React** – Frontend framework
- **LaTeX** – Resume rendering

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For support and questions:

📧 Email: ashishchaudhary110411@gmail.com

🐛 Issues: [GitHub Issues](https://github.com/Ashish110411/ResuGen/issues)

---

Version: 1.4.7  
Built with ❤️ by Ashish110411