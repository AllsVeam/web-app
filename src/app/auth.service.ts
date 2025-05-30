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

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

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
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: codeVerifier || '',
    });

    fetch('https://plugin-auth-ofrdfj.us1.zitadel.cloud/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })
      .then(res => res.json())
      .then(tokens => {
        console.log('Tokens:', tokens);
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('id_token', tokens.id_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        // redirige a tu app protegida
        window.location.href = '/#/home';
      })
      .catch(error => {
        console.error('Error al intercambiar el código por tokens:', error);
      });
  }


  /*
  login() {
    const url = `${this.authUrl}?client_id=${encodeURIComponent(this.clientId)}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=openid profile email`;
    console.log("Redirigiendo a:", url);
    window.location.href = url;
  }


  exchangeCodeForToken(code: string) {
    return this.http.get<{ access_token: string; id_token: string; refresh_token?: string }>(
      `http://localhost:18090/callback?code=${code}`
    );
  }
    */

  /*
    exchangeCodeForToken(code: string) {
      const apiUrl = 'http://localhost:18090/api/get-token-direct';  // ajusta el puerto si es necesario
      console.debug("flag1...");
      const body = new HttpParams().set('code', code);

      this.http.post(apiUrl, body).subscribe({
        next: (response: any) => {
          console.log('Token response from backend:', response);
          // Aquí puedes guardar el token en localStorage, sessionStorage o manejarlo como necesites
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('id_token', response.id_token);
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }
        },
        error: (error) => {
          console.error('Failed to exchange code for token:', error);
        }
      });
    }*/

  /*
async handleRedirectCallback() {
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  console.log('Found auth code:', code);
  console.log('Received code:', code);
  this.exchangeCodeForToken(code);
  const body = new HttpParams()
    .set('grant_type', 'authorization_code')
    .set('client_id', this.clientId)
    .set('code', code)
    .set('redirect_uri', this.redirectUri);
  try {
    const tokenResponse = await this.http.post<any>(
      this.tokenUrl,
      body.toString(),
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      }
    ).toPromise();

    console.log('Token response:', tokenResponse);

    localStorage.setItem('access_token', tokenResponse.access_token);
    localStorage.setItem('id_token', tokenResponse.id_token);
    console.log('access_token', tokenResponse.access_token);
    console.log('id_token', tokenResponse.id_token);

    // Clean the URL (remove code & state)
    window.history.replaceState({}, document.title, this.redirectUri);

    console.log("control");
  } catch (error) {
    console.error('Token exchange failed:', error);
  }
}
}


*/
}
