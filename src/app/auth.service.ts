import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { AuthenticationService } from '../app/core/authentication/authentication.service';
import { Credentials } from './core/authentication/credentials.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'https://plugin-auth-ofrdfj.us1.zitadel.cloud/oauth/v2/authorize';
  private clientId = '321191693166683125';
  private redirectUri = 'http://localhost:4200/callback';
  //private authUrl = 'https://prueba-fnkj2p.us1.zitadel.cloud/oauth/v2/authorize';
  private tokenUrl = 'https://plugin-auth-ofrdfj.us1.zitadel.cloud/oauth/v2/token';

  private refreshTimeoutId: any = null;

  constructor(
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async login() {
    const codeVerifier = this.generateRandomString();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    localStorage.setItem('code_verifier', codeVerifier);
    const url =
      `${this.authUrl}` +
      `?client_id=${encodeURIComponent(this.clientId)}` +
      `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
      `&response_type=code` +
      `&scope=openid profile email offline_access` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;
    window.location.href = url;
  }

  logout() {
    const idToken = localStorage.getItem('id_token');
    const postLogoutRedirectUri = 'http://localhost:4200/#/login';

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    if (!idToken) {
      console.warn('No hay id_token. Redirigiendo a login.');
      window.location.href = postLogoutRedirectUri;
      return;
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('mifosXCredentials');
    sessionStorage.removeItem('mifosXCredentials');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('code_verifier');

    const logoutUrl = `https://plugin-auth-ofrdfj.us1.zitadel.cloud/oidc/v1/end_session?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
    window.location.href = logoutUrl;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  generateRandomString(length = 128) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  }

  exchangeCodeForTokens(code: string, codeVerifier: string | null) {
    const payload = {
      code: code,
      code_verifier: codeVerifier || ''
    };

    fetch('http://localhost:18090/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error al intercambiar código: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((tokens: { access_token: string; id_token: string; refresh_token: string; expires_in: number }) => {
        console.log('Tokens:', tokens);
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('id_token', tokens.id_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        localStorage.setItem('expires_in', tokens.expires_in.toString());
        console.debug('[AuthService] ← Tokens guardados en localStorage:', tokens);
        this.scheduleRefresh(tokens.expires_in);
        this.userdetails();
      })
      .catch((error) => {
        console.error('Error al intercambiar el código por tokens:', error);
      });
  }

  /*
  refreshToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      const rt = localStorage.getItem('refresh_token');
      if (!rt) {
        console.warn('No existe refresh_token en localStorage. Debes hacer login nuevamente.');
        this.logout();
        return reject('Sin refresh_token');
      }
      const payload = new URLSearchParams();
      payload.set('grant_type', 'refresh_token');
      payload.set('refresh_token', rt);
      payload.set('client_id', this.clientId);

      console.log('[AuthService] → Iniciando refreshToken()');

      fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error al refrescar token: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then(
          (tokens: {
            access_token: string;
            id_token: string;
            refresh_token: string;
            expires_in: number;
            refresh_expires_in: number;
          }) => {
            console.log('[AuthService] ← Nuevos tokens recibidos en refresh:', tokens);
            console.log('Nuevo set de tokens obtenido por refresh:', tokens);

            localStorage.setItem('access_token', tokens.access_token);
            localStorage.setItem('id_token', tokens.id_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);
            localStorage.setItem('expires_in', tokens.expires_in.toString());
            localStorage.setItem('refresh_expires_in', tokens.refresh_expires_in.toString());

            this.scheduleRefresh(tokens.expires_in);

            resolve();
          }
        )
        .catch((err) => {
          console.error('refreshToken falló, forzando logout:', err);
          this.logout();
          reject(err);
        });
    });
  }
*/
  refreshToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      const rt = localStorage.getItem('refresh_token');

      if (!rt) {
        console.warn('[AuthService] ❌ No existe refresh_token en localStorage. Debes hacer login nuevamente.');
        this.logout();
        return reject('Sin refresh_token');
      }

      const payload = new URLSearchParams();
      payload.set('grant_type', 'refresh_token');
      payload.set('refresh_token', rt);
      payload.set('client_id', this.clientId);

      console.log('[AuthService] 🔄 Iniciando refreshToken()');

      fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      })
        .then((res) => {
          if (!res.ok) {
            console.error(`[AuthService] ❌ Error HTTP en refresh: ${res.status} ${res.statusText}`);
            return res.text().then((text) => {
              console.error('[AuthService] ❌ Cuerpo de error:', text);
              throw new Error(text);
            });
          }
          return res.json();
        })
        .then((tokens) => {
          console.log('[AuthService] ✅ Respuesta del token refresh:', tokens);

          if (!tokens || !tokens.access_token || !tokens.expires_in) {
            throw new Error('La respuesta del servidor no tiene los campos esperados.');
          }

          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('id_token', tokens.id_token ?? '');
          localStorage.setItem('refresh_token', tokens.refresh_token ?? '');
          localStorage.setItem('expires_in', tokens.expires_in.toString());
          localStorage.setItem('refresh_expires_in', tokens.refresh_expires_in?.toString() ?? '');
          localStorage.setItem('token_start_time', Date.now().toString());

          this.scheduleRefresh(tokens.expires_in);
          resolve();
        })
        .catch((err) => {
          console.warn('[AuthService] ❌ refreshToken falló, forzando logout en 2 segundos');
          console.warn('→ Error:', err);
          console.warn('→ refresh_token usado:', rt);

          // Esperar 2 segundos antes de hacer logout para que se vea en consola
          setTimeout(() => {
            this.logout();
          }, 300000);

          reject(err);
        });
    });
  }

  dtoToken() {
    console.log('DTO token test');
    console.log(localStorage.getItem('access_token'));

    fetch('http://localhost:18090/api/DTO-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: localStorage.getItem('access_token'),
        expires_in: Number(localStorage.getItem('expires_in')),
        refresh_expires_in: Number(localStorage.getItem('refresh_expires_in')),
        refresh_token: localStorage.getItem('refresh_token'),
        token_type: 'Bearer',
        'not-before-policy': 0,
        session_state: 'c6ad29fa-b41b-4bf1-8056-b175e974a759',
        scope: 'ALL_FUNCTIONS profile email'
      })
    }).then((response) => {
      console.log(response);
    });
  }

  userdetails() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    fetch('http://localhost:18090/userdetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: accessToken })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al obtener datos del usuario desde backend');
        }
        return res.json();
      })
      .then((userInfo) => {
        const credentials: Credentials = {
          authenticated: true,
          officeId: 0,
          officeName: 'Home local',
          permissions: [],
          roles: undefined,
          userId: 0,
          username: userInfo.name,
          shouldRenewPassword: true
        };

        /*

        const Credentials = {
          accessToken?: userInfo.string,
          authenticated: userInfo.boolean,
          base64EncodedAuthenticationKey?: string,
          isTwoFactorAuthenticationRequired?: boolean,
          officeId: userInfo.number,
          officeName: userInfo.string,
          staffId?: userInfo.number,
          staffDisplayName?: userInfo.string,
          organizationalRole?: userInfo.any,
          permissions: userInfo.string[],
          roles: userInfo.any,
          userId: userInfo.number,
          username: userInfo.string,
          shouldRenewPassword: userInfo.boolean,
          rememberMe?: userInfo.boolean,
        }
          */

        this.authenticationService.saveZitadelCredentials(credentials);

        console.log('Llamada DTOToken');
        this.dtoToken();
        window.location.href = '/#/home';
      })
      .catch((error) => {
        console.error('Error al consumir el backend:', error);
      });
  }

  private scheduleRefresh(expiresIn: number) {
    //console.log('Programando refresh en', expiresIn, 'segundos');

    //const refreshInMs = (expiresIn - 60) * 1000;
    const refreshInMs = (expiresIn - 43100) * 1000;
    console.log('Programando refresh en', expiresIn - 43139, 'segundos');

    if (refreshInMs <= 0) {
      console.log('expiresIn muy pequeño o negativo, refrescando de inmediato');
      this.refreshToken();
      return;
    }

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    this.refreshTimeoutId = setTimeout(() => {
      this.refreshToken();
    }, refreshInMs);
  }

  private decodeJwtPayload(token: string): { [key: string]: any } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = atob(payloadBase64);
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  public isAccessTokenExpired(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return true;

    const payload = this.decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
  }

  public isSessionValid(): boolean {
    const start = Number(localStorage.getItem('token_start_time'));
    const expiresIn = Number(localStorage.getItem('expires_in')) * 1000;

    if (!start || !expiresIn) {
      return false;
    }

    const now = Date.now();
    return now < start + expiresIn;
  }

  public startSessionValidator(): void {
    setInterval(() => {
      const stillValid = this.isSessionValid();
      console.log(`[AuthService] La sesión está ${stillValid ? 'activa' : 'expirada'}.`);
    }, 20000); // cada 20 segundos
  }
}
