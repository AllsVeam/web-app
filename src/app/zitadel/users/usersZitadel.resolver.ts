/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersServiceZitadel } from './usersZitadel.service';

/**
 * UsersZitadel data resolver.
 */

@Injectable()
export class UsersZitadelResolver {
  /**
   * @param {UsersServiceZitadel} usersServiceZitadel Users service.
   */
  constructor(private usersServiceZitadel: UsersServiceZitadel) {}

  resolve(): Observable<any> {
    return this.usersServiceZitadel.getUsers();
  }
}
