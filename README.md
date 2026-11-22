# ResuGen 🚀
> **High-Performance, Real-Time LaTeX Resume Builder**  
> Generate pristine, ATS-friendly resumes compiled with native LaTeX in real time.

[![Angular](https://img.shields.io/badge/Frontend-Angular%2015-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![LaTeX](https://img.shields.io/badge/Engine-Tectonic%20LaTeX-008080?logo=latex&logoColor=white)](https://tectonic-typesetting.github.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Overview

**ResuGen** is a modern, full-stack web application that allows engineers, recruiters, and professionals to build and manage professional, beautifully typeset resumes without wrestling with complex LaTeX markup.

It combines an intuitive, distraction-free visual builder with real-time compilation: as you type, changes are compiled into an authentic vector PDF rendered side-by-side with an interactive previewer.

### 🌟 Key Highlights

- **Dual Career-Track Templates**:
  - **💻 Software Development Engineer (SDE)**: Single-column classic tech CV optimized for software developers, tech stacks, live project demos, and GitHub repositories.
  - **👔 Human Resources / Executive (HR)**: Two-column executive CV (70% main timeline, 30% sidebar) tailored for HR professionals, recruiters, and organizational leaders.
- **⚡ Instant Real-Time Preview**: Fast debounce-driven compilation with client-side caching (0ms switching between previously compiled states).
- **🎯 ATS-Friendly Output**: Generates pure vector PDF files compiled via `tectonic` / `pdflatex`, ensuring maximum readability by Automated Tracking Systems (ATS).
- **🎛️ Drag-and-Drop Organization**: Reorder sections dynamically, adjust spacing, and toggle section visibility on the fly.
- **🔗 Custom Hyperlinks**: Add custom social, portfolio, and profile links (e.g., LeetCode, Codeforces, Kaggle, personal website).
- **🎨 Refined Black & Yellow Theme**: Clean, professional design system with native Light Mode and Dark Mode support (no gradients, WCAG-compliant high-contrast typography).
- **🔒 Secure Cloud Synchronization**: JWT-authenticated REST API with MySQL persistence to save, update, and manage multiple resumes.

---

## 📸 Screenshots & Showcase

| SDE Technical Track | HR Executive Track |
| :---: | :---: |
| ![SDE Resume](docs/Jonathan%20Doe%20SDE.jpg) | ![HR Resume](docs/hr-resume-preview.jpg) |

---

## 🏗️ Architecture & Tech Stack

```
ResuGen/
├── docs/                     # Sample resumes and preview screenshots
├── rg-backend/               # Spring Boot 3 REST API (Java 17, Spring Security, MySQL)
│   ├── src/main/java/        # Controllers, Security, JWT, DTOs, Services
│   ├── src/main/resources/   # Database configuration (application.properties)
│   ├── Dockerfile            # Container definition for backend
│   └── pom.xml               # Maven dependencies
├── rg-frontend/              # Angular 15 Single Page Application
│   ├── compiler/             # Embedded LaTeX compilation microservice (Port 8888)
│   │   ├── bin/tectonic.exe  # Standalone LaTeX compiler engine (Windows)
│   │   └── server.js         # HTTP compilation sync server
│   ├── src/app/              # Angular components, reactive forms, LaTeX services
│   ├── src/assets/           # Track preview images & branding
│   ├── start-app.js          # Unified launcher (Compiler + Frontend)
│   └── package.json          # Frontend scripts & dependencies
└── README.md                 # Project documentation
```

### Components

- **Frontend**: Angular 15, Angular CDK (Drag & Drop), Bootstrap 5 utility classes, Google Material Symbols, RxJS.
- **Backend API**: Spring Boot 3.x, Spring Security 6, JWT (`io.jsonwebtoken`), Spring Data JPA, Hibernate, MySQL.
- **Compiler Microservice**: Node.js HTTP server executing standalone `tectonic` (XeTeX engine), accepting raw LaTeX payload and streaming back compiled binary PDFs.

---

## 🚀 Running ResuGen Locally

Follow these step-by-step instructions to get ResuGen running on your local machine.

### 📋 Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: v18.x or v20.x ([Download Node.js](https://nodejs.org/))
- **Java Development Kit (JDK)**: Java 17 or higher ([Eclipse Temurin](https://adoptium.net/) or OpenJDK)
- **Apache Maven**: v3.8+ (Verify with `mvn -version`)
- **MySQL Server**: v8.0+ running locally on port `3306` ([Download MySQL](https://dev.mysql.com/downloads/))

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ashish110411/Resugen.git
cd ResuGen
```

---

### Step 2: Configure and Start the Database

1. Open your MySQL client (MySQL Workbench, HeidiSQL, or CLI):
   ```sql
   CREATE DATABASE IF NOT EXISTS resugen_db;
   ```
2. Verify database credentials in `rg-backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/resugen_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=
   spring.datasource.password=
   ```
   > **Note:** Update `application.properties` or set the environment variables `DATABASE_USER` and `DATABASE_PASS`.

---

### Step 3: Run the Backend API

Open a new terminal window in the project root:

```bash
cd rg-backend
mvn clean spring-boot:run
```

- The backend will start on **`http://localhost:7777`**.
- Spring Boot and Hibernate will automatically generate all necessary tables (`users`, `resumes`) on first startup.
- You can test that the backend is alive by visiting `http://localhost:7777/api/auth/ping` in your browser.

---

### Step 4: Run the Frontend & Local LaTeX Compiler

ResuGen includes a **unified runner** (`start-app.js`) that automatically boots both the embedded LaTeX compiler server (port `8888`) and the Angular development server (port `4200`):

1. Open a new terminal window:
   ```bash
   cd rg-frontend
   npm install
   ```

2. Start the unified runner:
   ```bash
   npm start
   ```

   *Alternatively, you can run them in separate terminals if preferred:*
   - **Compiler Server**: `npm run start:compiler` (Starts local LaTeX engine on port `8888`)
   - **Angular Frontend**: `npm run start:frontend` (Starts Angular dev server on port `4200`)

> 💡 **No TeX Installation Needed on Windows:** The local compiler server bundles `tectonic.exe` in `rg-frontend/compiler/bin/`, allowing real-time PDF compilation out-of-the-box with zero external dependencies.

---

### Step 5: Open the Application

Navigate to **`http://localhost:4200`** in your browser.

1. Click **Get Started** or **Sign In**.
2. Create a new account via the **Create Account** page.
3. Choose your resume track:
   - **SDE Resume** (Technical 1-Column)
   - **HR Resume** (Executive 2-Column)
4. Customize your personal details, experience, skills, and section ordering.
5. Click **Download PDF** to export your ATS-ready resume or **Copy LaTeX** for manual compilation on Overleaf.

---

## 🛠️ Configuration & Port Summary

| Service | Port | Description |
| :--- | :---: | :--- |
| **Angular Frontend** | `4200` | UI, form builders, and live PDF viewer |
| **Spring Boot Backend** | `7777` | REST API (Authentication, Resume CRUD) |
| **LaTeX Compiler** | `8888` | Local Tectonic compilation server |
| **MySQL Database** | `3306` | Persistent storage for users and resumes |

---

## 🧪 Testing & Building for Production

### Frontend Production Build
```bash
cd rg-frontend
npm run build
```
Compiled output will be placed in `rg-frontend/dist/rg-frontend`.

### Backend JAR Packaging
```bash
cd rg-backend
mvn clean package -DskipTests
```
The executable JAR will be located at `rg-backend/target/rg-backend-0.0.1-SNAPSHOT.jar`.

---

## 👤 Author & Connect

**Ashish Chaudhary**

- **GitHub**: [@Ashish110411](https://github.com/Ashish110411)
- **LinkedIn**: [Ashish Chaudhary](https://www.linkedin.com/in/ashish110411/)
- **Portfolio**: [ashish110411.netlify.app](https://ashish110411.netlify.app/)
- **Email**: [ashishchaudhary110411@gmail.com](mailto:ashishchaudhary110411@gmail.com)
- **Star this Repository**: [github.com/Ashish110411/Resugen](https://github.com/Ashish110411/Resugen)

---

## 📄 License

This project is licensed under the MIT License - feel free to use it for personal and commercial projects.
