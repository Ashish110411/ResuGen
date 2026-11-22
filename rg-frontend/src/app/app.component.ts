import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'rg-frontend';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Ping LaTeX compiler API as soon as the frontend application starts
    const healthUrl = `${environment.compilerUrl}/`;

    this.http.get(healthUrl).subscribe({
      next: (res) => console.log('[Compiler API] Connected to LaTeX compiler service:', res),
      error: (err) => console.warn('[Compiler API] Compiler health check:', err.message)
    });
  }
}
