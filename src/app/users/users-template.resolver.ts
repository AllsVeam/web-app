/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersService } from './users.service';
import { UsersServiceZitadel } from '../zitadel/users/usersZitadel.service';
/**
 * Users template data resolver.
 */
@Injectable()
export class UsersTemplateResolver {
  /**
   * @param {UsersService} usersService Users service.
   */
  constructor(private usersServiceZitadel: UsersServiceZitadel) {}

  /**
   * Returns the users template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.usersServiceZitadel.getUsersTemplate();
  }
}
