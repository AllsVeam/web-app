import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './zitadel/auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getProtectedResource() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getAccessToken()}`
    });

    return this.http.get('/api/protected', { headers });
  }
}
