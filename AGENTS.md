# ResuGen Multi-Template Architecture & Developer Blueprint

This document defines the complete technical blueprint, specifications, and operational rules for **ResuGen**, a high-performance, real-time LaTeX resume generator supporting specialized career tracks:
- **Software Development Engineer (SDE)**: Single-column dense technical CV.
- **Human Resources (HR)**: Two-column modern executive CV powered by `paracol{2}` (70% main column, 30% sidebar).

---

## 1. System Architecture Overview

```
                                  +------------------------------------+
                                  |       ResuGen Angular Frontend     |
                                  |     (Port 4200 / Production CDN)   |
                                  +-----------------+------------------+
                                                    |
                   +--------------------------------+--------------------------------+
                   |                                                                 |
                   v                                                                 v
+------------------------------------+                             +------------------------------------+
|       SDE Resume Workspace         |                             |        HR Resume Workspace         |
|  - Single-column LaTeX engine      |                             |  - Two-column paracol{2} engine    |
|  - Projects, Tech Stack, Education |                             |  - 9 Structured HR Sections        |
|  - Real-time debounced compile     |                             |  - Auto-columning & Spacing        |
+------------------+-----------------+                             +-----------------+------------------+
                   |                                                                 |
                   +--------------------------------+--------------------------------+
                                                    |
                                                    v
                                  +------------------------------------+
                                  |    High-Performance Compiler API   |
                                  |       (Port 8888 / Render/K8s)     |
                                  |  - Tectonic XeTeX engine           |
                                  |  - Zero server memory retention    |
                                  |  - Client cancellation (SIGKILL)   |
                                  |  - Queueing & Concurrency Semaphore|
                                  +------------------------------------+
```

---

## 2. Template Specifications

### 2.1 SDE Template (Classic Technical CV)
- **Layout**: Single-column, full-width `tabularx` blocks.
- **Orientation**: Top-to-bottom timeline with horizontal category badges.
- **Focus**: Projects, GitHub repositories, live demo links, technical skill categories, algorithmic experience.
- **Spacing Units**: Fine-tunable `\vspace` in `em` with presets (`Compact`, `Balanced`, `Spacious`).

### 2.2 HR Template (Professional 2-Column CV)
- **Engine**: LaTeX `paracol{2}` environment with `\columnratio{0.7, 0.3}`.
- **Column Separation**: `\setlength\columnsep{0.05\textwidth}`.
- **Font System**: TeX Gyre Libertine (`\usepackage[sf]{libertine}`) with Computer Modern Bright accents (`cmbright`).
- **Icons**: FontAwesome 5 (`\footnotesize\faPhone`, `\footnotesize\faEnvelope`, `\footnotesize\faMapMarker*`, `\footnotesize\faLinkedin`).

#### Mandatory Section Order for HR CV:
1. **Personal Information**: Full Name, Headline ("Human Resources Professional"), Phone, Email, Location (City, State, Country), LinkedIn Profile.
2. **Professional Summary**: Paragraph highlighting recruitment, employee relations, onboarding, and organizational culture.
3. **Key Skills**: Core HR competencies (Recruitment, Talent Acquisition, Employee Relations, Payroll, Onboarding, Conflict Resolution, etc.).
4. **Work Experience / Internship**: Chronological roles with title, company, location, employment dates, and quantifiable bullet points.
5. **Education**: Degrees, institutions, locations, and completion years.
6. **Certifications**: HR certifications and credentials (e.g. HR Management, Talent Acquisition, HR Analytics).
7. **Technical Skills**: HR software & tools (MS Office, Google Workspace, HRMS, ATS, Payroll systems).
8. **Achievements**: Key achievements and employee engagement milestones.
9. **Languages**: Spoken/written languages.
10. **Custom Sections**: Optional additional sections (e.g., Other Interests, Volunteering, Publications).

---

## 3. Auto-Columning & Spacing Management

### 3.1 Column Distribution Matrix
The generator automatically partitions sections into the two columns to maintain visual balance:

| Column | Ratio | Assigned Sections | Formatting Style |
|---|---|---|---|
| **Left Column (0)** | **70%** | Name & Headline<br>Professional Summary<br>Work Experience / Internship<br>Education<br>Major Custom Sections | Narrative paragraph<br>`\entry{...}{...}{...}{...}`<br>`itemize` with `leftmargin=3.5mm` |
| **Right Column (1)** | **30%** | Contact Info (Supertabular)<br>Key Skills<br>Technical Skills<br>Certifications<br>Achievements<br>Languages<br>Compact Custom Sections | `supertabular` with `\tableentry`<br>Bullet lists (`\textbullet`)<br>FontAwesome icon table |

### 3.2 Synchronization & Paracol Flow
```latex
\begin{paracol}{2}
  % LEFT: Headline & Name
  \heading{ALEX MORGAN}{Human Resources Professional}

  \switchcolumn
  % RIGHT: Contact Table
  \vspace{0.01\textheight}
  \begin{supertabular}{ll} ... \end{supertabular}

  \switchcolumn* % Synchronizes baseline between columns

  % LEFT: Primary Timeline & Narrative
  \section{professional summary} ...
  \section{work experience} ...
  \section{education} ...

  \switchcolumn % Switches to sidebar column

  % RIGHT: Skills, Credentials & Attributes
  \section{key skills} ...
  \section{technical skills} ...
  \section{certifications} ...
  \section{achievements} ...
  \section{languages} ...
\end{paracol}
```

---

## 4. Reordering, Show/Hide & Custom Sections Rules

1. **Reordering**:
   - The user can reorder any section via the Section Manager.
   - Within each column, sections are rendered in the exact order specified by the user's `sectionOrder` array.
2. **Show / Hide (`visibleSections`)**:
   - Every section can be toggled on/off.
   - If a section is hidden, it is excluded from LaTeX generation without leaving blank spaces or empty headings.
3. **Custom Sections**:
   - Custom sections support dynamic titles and bullet points.
   - Long custom sections automatically default to the left column, while concise custom sections (or interests) format as bulleted right-column entries.

---

## 5. Performance, Debounce & Zero-Load Protocol

To maintain sub-second responsiveness without degrading server performance:

1. **Client-Side Debouncing**:
   - Form keystrokes: Single `400ms` debounce -> triggers compile.
   - Spacing adjustments (`+`/`-`): `350ms` debounce (UI updates instantly in DOM).
   - Preset buttons: `100ms` debounce.
   - Deduplication: If generated LaTeX matches `lastCompiledLatexString`, compile is skipped.
   - Client Cache: The browser maintains an in-memory `Map<string, Blob>` (max 10 entries) of recently generated PDFs for instant 0ms restoration upon undo/preset toggling.
2. **Compiler Engine (`compiler/server.js`)**:
   - Uses `tectonic.exe --untrusted -C --chatter minimal main.tex`.
   - `-C` (`--only-cached`) forces Tectonic to use locally cached packages, dropping compile time from >1000ms to ~600ms.
   - Zero Server Memory Retention: No PDF buffers stored in Node.js RAM; temporary directories are wiped via `fs.rmSync` immediately upon streaming response.
   - Request Abort: When the client cancels or unmounts an in-flight request, `res.on('close')` terminates the `tectonic` child process immediately with `SIGKILL`.
   - Queueing: Maximum 5 concurrent jobs; excess requests wait in a lightweight FIFO queue rather than triggering HTTP 429.

---

## 6. Template Switching Protocol

- A switching control on the navigation bar allows users to toggle between:
  - `SDE Resume` (Software Development Engineer)
  - `HR Resume` (Human Resources Professional)
- Selection is persisted in browser `localStorage` (`resugen_active_template`).
- SDE state and HR state are cleanly decoupled: switching templates does not corrupt or overwrite the other profile's form data.

---

## 7. Developer Rules for Future Templates

When adding new resume templates (e.g. Finance, Marketing, Academic):
1. **Never alter existing templates**: Create dedicated models and generator functions.
2. **Sanitize LaTeX**: Always pass user inputs through `latexBasics()` to escape TeX reserved characters (`&`, `%`, `$`, `#`, `_`, `{`, `}`, `~`, `^`, `\`).
3. **Keep Compiler Stateless**: Do not introduce stateful backend caches; rely on client-side caching and offline Tectonic bundles.
4. **Maintain Reversibility**: Support clean switching and isolated local storage states.
