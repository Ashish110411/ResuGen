import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ResumeDto, ResumeListDto } from '../models/resume.models';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private baseUrl = 'http://localhost:7777/api/resumes';

  // Shared state behavior subjects
  public activeResumeId$ = new BehaviorSubject<number | null>(null);
  public reloadResumes$ = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllResumes(): Observable<ResumeListDto[]> {
    return this.http.get<ResumeListDto[]>(this.baseUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getResumeById(id: number): Observable<ResumeDto> {
    return this.http.get<ResumeDto>(`${this.baseUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createResume(dto: ResumeDto): Observable<ResumeDto> {
    return this.http.post<ResumeDto>(this.baseUrl, dto, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateResume(id: number, dto: ResumeDto): Observable<ResumeDto> {
    return this.http.put<ResumeDto>(`${this.baseUrl}/${id}`, dto, {
      headers: this.authService.getAuthHeaders()
    });
  }



  deleteResume(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.authService.getAuthHeaders(),
      responseType: 'text'
    });
  }
}
