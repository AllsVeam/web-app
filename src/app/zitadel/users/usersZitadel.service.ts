/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/**
 * UsersZitadel service.
 */
@Injectable({
  providedIn: 'root'
})
export class UsersServiceZitadel {
  private api = 'http://localhost:18090/';

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * @returns {Observable<any>} Users data
   */
  getUsers(): Observable<any[]> {
    return from(fetch(`${this.api}user/`)).pipe(
      switchMap((res) => res.json()),
      map((response) => {
        const out: any[] = [];
        const users = response.data?.result;
        if (Array.isArray(users)) {
          users.forEach((user) => {
            if (user.human) {
              out.push({
                id: user.id,
                firstname: user.human.profile.firstName,
                lastname: user.human.profile.lastName,
                email: user.human.email.email,
                officeName: 'Head Office'
              });
            }
          });
        }
        return out;
      })
    );
  }

  /**
   * @param {string} userId user ID of user.
   * @returns {Observable<any>} User.
   */
  getUser(userId: string): Observable<any> {
    //return this.http.get(`/users/1`);
    const url = `${this.api}user/user?userId=${userId}`;

    return from(
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // si necesitas Authorization, agrégalo
        }
      })
    ).pipe(
      switchMap((res) => res.json()),
      map((response) => {
        const out: any[] = [];
        const u = response.object?.user;
        if (!u) {
          throw new Error('User no encontrado');
        }
        return {
          id: u.userId,
          username: u.username,
          officeId: u.user_uuid ?? null,
          officeName: 'Head Office',
          firstname: u.human?.profile?.givenName,
          lastname: u.human?.profile?.familyName,
          email: u.human?.email?.email,
          passwordNeverExpires: false,
          availableRoles: u.availableRoles ?? [],
          selectedRoles: u.selectedRoles ?? [],
          isSelfServiceUser: u.state
        };
      })
    );
  }
}
