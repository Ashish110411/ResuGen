import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular CDK modules
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Services
import { AuthService } from './services/auth.service';
import { ResumeService } from './services/resume.service';
import { ThemeService } from './services/theme.service';
import { LatexService } from './services/latex.service';

// Components
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/dashboard/sidebar/sidebar.component';
import { ResumeFormComponent } from './components/dashboard/resume-form/resume-form.component';

// Subcomponents for the Resume Builder Form
import { PersonalInfoComponent } from './components/dashboard/resume-form/components/personal-info/personal-info.component';
import { EducationComponent } from './components/dashboard/resume-form/components/education/education.component';
import { ExperienceComponent } from './components/dashboard/resume-form/components/experience/experience.component';
import { ProjectsComponent } from './components/dashboard/resume-form/components/projects/projects.component';
import { SkillsComponent } from './components/dashboard/resume-form/components/skills/skills.component';
import { CertificationsComponent } from './components/dashboard/resume-form/components/certifications/certifications.component';
import { CustomSectionsComponent } from './components/dashboard/resume-form/components/custom-sections/custom-sections.component';
import { SectionManagerComponent } from './components/dashboard/resume-form/components/section-manager/section-manager.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    SidebarComponent,
    ResumeFormComponent,
    PersonalInfoComponent,
    EducationComponent,
    ExperienceComponent,
    ProjectsComponent,
    SkillsComponent,
    CertificationsComponent,
    CustomSectionsComponent,
    SectionManagerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    ClipboardModule
  ],
  providers: [
    AuthService,
    ResumeService,
    ThemeService,
    LatexService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
