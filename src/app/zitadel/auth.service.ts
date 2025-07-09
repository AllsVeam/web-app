import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { AuthenticationService } from '../core/authentication/authentication.service';
import { Credentials } from '../core/authentication/credentials.model';
import { OAuth2Token } from '../core/authentication/o-auth2-token.model';
import { forEach } from 'lodash';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'https://plugin-auth-ofrdfj.us1.zitadel.cloud/oauth/v2/authorize';
  private clientId = '321191693166683125';
  private api = 'https://localhost:8443/fineract-provider/';
  private frontulr = 'http://localhost:4200/'

  private redirectUri = this.frontulr +'callback';


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
    //return;
    const idToken = localStorage.getItem('id_token');
    const postLogoutRedirectUri = this.frontulr +'#/login';

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    if (!idToken) {
      console.warn('No hay id_token. Redirigiendo a login.');
      window.location.href = postLogoutRedirectUri;
      return;
    }

    sessionStorage.removeItem('mifosXCredentials');
    sessionStorage.removeItem('mifosXZitadelTokenDetails');
    localStorage.removeItem('id_token');
    localStorage.removeItem('code_verifier');
    localStorage.removeItem('mifosXZitadel');

    const logoutUrl = `https://plugin-auth-ofrdfj.us1.zitadel.cloud/oidc/v1/end_session?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
    window.location.href = logoutUrl;
  }

  getAccessToken(): string | null {
    const rawToken = sessionStorage.getItem('mifosXZitadelTokenDetails');

    if (rawToken) {
      const parsedToken: OAuth2Token = JSON.parse(rawToken);
      return parsedToken.access_token;
    }

    return null;
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

    fetch(this.api + 'token', {
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
      .then(
        (tokens: {
          access_token: string;
          id_token: string;
          refresh_token: string;
          expires_in: number;
          token_type: string;
        }) => {
          console.log('Tokens:', tokens);

          const token: OAuth2Token = {
            access_token: tokens.access_token,
            token_type: tokens.token_type,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in,
            scope: 'Bearer'
          };

          localStorage.setItem('id_token', tokens.id_token);
          localStorage.setItem('mifosXZitadel', 'true');
          sessionStorage.setItem('mifosXZitadelTokenDetails', JSON.stringify(token));
          localStorage.setItem('refresh_token', tokens.refresh_token);
          this.scheduleRefresh(tokens.expires_in);
          this.userdetails();
        }
      )
      .catch((error) => {
        console.error('Error al intercambiar el código por tokens:', error);
      });
  }

  userdetails() {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    fetch(this.api + 'userdetails', {
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
        const user = userInfo.object;
        const credentials: Credentials = user;
        this.authenticationService.saveZitadelCredentials(credentials);

        console.log('Llamada DTOToken');
        this.dtoToken();
        window.location.href = '/#/home';
      })
      .catch((error) => {
        console.error('Error al consumir el backend:', error);
      });
  }

  dtoToken() {
    const parsedToken: OAuth2Token = JSON.parse(sessionStorage.getItem('mifosXZitadelTokenDetails'));
    fetch(this.api + 'api/DTO-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: parsedToken.access_token,
        expires_in: Number(parsedToken.expires_in),
        refresh_expires_in: Number(parsedToken.expires_in),
        refresh_token: parsedToken.refresh_token,
        token_type: parsedToken.token_type,
        'not-before-policy': 0,
        session_state: 'c6ad29fa-b41b-4bf1-8056-b175e974a759',
        scope: 'ALL_FUNCTIONS profile email'
      })
    }).then((response) => {
      console.log(response);
    });
  }

  public notification() {
    try {
      fetch(this.api + 'notifications', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({})
      }).then((res) => {
        //console.log(res);
        if (res.status === 401 || res.status === 403) {
          console.warn('Token expirado o inválido');
          //this.logout();
        }
        /*
          else {
            res.json().then(data => console.log('Respuesta:', data));
          }*/
      });
    } catch (error) {
      console.log('❌ Error en la solicitud:', error);
    }
  }

  // Delete
  public deletUser(userId: string) {
    fetch(`${this.api}user/?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.status === 200) {
          this.router.navigate(['/appusers']);
        } else {
          alert(data.msg);
        }
      })
      .catch((error) => {
        alert(error.msg);
        //console.error('Error eliminando usuario:', error);
      });
  }

  // Activar
  public activeUser(userId: string) {
    fetch(`${this.api}user/reactivate?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
        //'Authorization': `Bearer ${this.getAccessToken()}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        window.location.reload();
      })
      .catch((error) => {
        alert(error.msg);
        console.error('Error activando usuario:', error);
      });
  }

  // Desactive
  public desactiveUser(userId: string) {
    fetch(`${this.api}user/desactivate?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
        //'Authorization': `Bearer ${this.getAccessToken()}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        window.location.reload();
      })
      .catch((error) => {
        alert(error.msg);
        console.error('Error activando usuario:', error);
      });
  }

  public getUsers() {
    let getUsers: any[] = [];
    fetch(`${this.api}user/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((response) => {
        const users = response.data?.result;
        if (Array.isArray(users)) {
          users.forEach((element: { human: any }) => {
            const human = element.human;
            if (human) {
              getUsers.push(human);
            }
          });
          console.log(getUsers);
        } else {
          console.error('La respuesta no contiene usuarios válidos');
        }
      })
      .catch((error) => console.error(`Error al obtener los usuarios: ${error}`));
  }

  /*** CRUD to Role */
  public createRole(roleKey: string, displayName: string, group: string) {
    fetch(`${this.api}roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roleKey, displayName, group })
    })
      .then((res) => res.json())
      .then((data) => {
        // Registro exitoso
      })
      .catch((error) => {
        alert(error.msg);
        console.error('Error creando Rol:', error);
      });
  }

  public updateRole(roleKey: string, displayName: string, group: string) {
    fetch(`${this.api}roles/${roleKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ displayName, group })
    })
      .then((res) => res.json())
      .then((data) => {
        // Registro exitoso
      })
      .catch((error) => {
        alert(error.msg);
        console.error('Error Actualizando Rol:', error);
      });
  }

  public deleteRole(roleKey: string) {
    fetch(`${this.api}roles/${roleKey}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        // Rol Eliminado correctamente
      })
      .catch((error) => {
        alert(error.msg);
        console.error(error.msg);
      });
  }


  refreshToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      const rt = localStorage.getItem('refresh_token');

      if (!rt) {
        console.warn('[AuthService] ❌ No existe refresh_token en localStorage. Debes hacer login nuevamente.');
        console.log("logout desde el refreshToken1");
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
          setTimeout(() => {
            console.log('[AuthService] 🔄 Forzando logout tras error en refreshToken');
            this.logout();
          }, 300000);

          reject(err);
        });
    });
  }

  private scheduleRefresh(expiresIn: number) {
    console.log('Programando refresh en', expiresIn-3539, 'segundos');

    const refreshInMs = (expiresIn - 3539) * 1000;
    //const refreshInMs = (expiresIn - 40090) * 1000;
    console.log('Programando refresh en', expiresIn - 3539, 'segundos');

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
}
