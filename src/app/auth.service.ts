import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'https://plugin-auth-ofrdfj.us1.zitadel.cloud/oauth/v2/authorize';
  private clientId = '321191693166683125';
  private redirectUri = 'http://localhost:4200/callback';
  //private authUrl = 'https://prueba-fnkj2p.us1.zitadel.cloud/oauth/v2/authorize';
  private tokenUrl = 'https://plugin-auth-ofrdfj.us1.zitadel.cloud/oauth/v2/token';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async login() {
    const codeVerifier = this.generateRandomString();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    localStorage.setItem('code_verifier', codeVerifier);
    const url = `${this.authUrl}?client_id=${encodeURIComponent(this.clientId)}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=openid profile email&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    window.location.href = url;
  }

  logout() {
    const idToken = localStorage.getItem('id_token');
    const postLogoutRedirectUri = 'http://localhost:4200/#/login';

    if (!idToken) {
      console.warn('No hay id_token. Redirigiendo a login.');
      window.location.href = postLogoutRedirectUri;
      return;
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');

    //const logoutUrl = `https://plugin-auth-ofrdfj.us1.zitadel.cloud/oidc/v1/end_session?id_token_hint=${idToken}`;
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
      .then((res) => res.json())
      .then((tokens) => {
        console.log('Tokens:', tokens);
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('id_token', tokens.id_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);

        // Llamar a la función para obtener los datos del usuario
        this.userdetails();

        window.location.href = '/#/home';
      })
      .catch((error) => {
        console.error('Error al intercambiar el código por tokens:', error);
      });
  }

  userdetails() {
    console.log('User details');
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
        console.log('User Info desde backend:', userInfo);
      })
      .catch((error) => {
        console.error('Error al consumir el backend:', error);
      });
  }
}
