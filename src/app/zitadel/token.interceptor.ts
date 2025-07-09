import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    let authReq = req;

    
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    

    return next.handle(authReq).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return from(this.handle401Error(authReq, next));
        }
        return throwError(() => err);
      })
    );
  }

  private async handle401Error(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    try {
      await this.authService.refreshToken();
      const newToken = this.authService.getAccessToken();
      if (newToken) {
        const retriedReq = request.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        return next.handle(retriedReq).toPromise() as Promise<HttpEvent<any>>;
      } else {
        this.authService.logout();
        console.log("no tiene nuevo access token del refresh"); 
        throw new Error('No se obtuvo nuevo access token tras refresh');
      }
    } catch (e) {
      console.log("logout desde el interceptor");
      this.authService.logout();
      throw e;
    }
  }
}
