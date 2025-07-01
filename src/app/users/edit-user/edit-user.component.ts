/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { UsersService } from '../users.service';

/**
 * Edit User Component.
 */
@Component({
  selector: 'mifosx-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  /** User Data */
  userData: any;
  /** Offices Data */
  officesData: any;
  /** Staff Data */
  staffData: any;
  /** Roles Data */
  rolesData: any;
  /** Edit User form. */
  editUserForm: UntypedFormGroup;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {UsersService} UsersService Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { user: any; usersTemplate: any }) => {
      const fullUserData = data.user;

      // ✅ Aquí accedes correctamente al usuario dentro del array
      this.userData = fullUserData.object?.result?.[0];

      this.officesData = data.usersTemplate.allowedOffices;
      this.rolesData = data.usersTemplate.availableRoles;

      this.createEditUserForm();
      this.officeChanged(this.userData.officeId); // si aplica
    });
  }

  ngOnInit() {
    this.createEditUserForm();
    this.officeChanged(this.userData.officeId);
  }

  /**
   * Creates the edit user form.
   */
  createEditUserForm() {
    const profile = this.userData?.human?.profile || {};
    const email = this.userData?.human?.email?.email || '';
    const phone = this.userData?.human?.phone?.phone || '';
    const gender = profile.gender || 'GENDER_MALE';
    const preferredLanguage = profile.preferredLanguage || 'es';

    this.editUserForm = this.formBuilder.group({
      username: [
        this.userData.userName,
        Validators.required
      ],
      email: [
        email,
        [
          Validators.required,
          Validators.email
        ]
      ],
      firstname: [
        profile.firstName || '',
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')]
      ],
      lastname: [
        profile.lastName || '',
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')]
      ],
      phone: [
        phone,
        Validators.required
      ],
      gender: [
        gender,
        Validators.required
      ],
      preferredLanguage: [
        preferredLanguage,
        Validators.required
      ],
      passwordNeverExpires: [false], // o como lo manejes tú
      officeId: [
        this.userData.officeId || '',
        Validators.required
      ],
      staffId: [null],
      roles: [
        this.userData.selectedRoles?.map((role: any) => role.id) || [],
        Validators.required
      ],
      currentPassword: [''],
      newPassword: ['']
    });
  }

  /**
   * Fetches the staff for the selected office
   * @param officeId the selected office id
   */
  officeChanged(officeId: number) {
    this.staffData = [];
    this.usersService.getStaff(officeId).subscribe((staff: any) => {
      this.staffData = staff;
    });
  }

  /**
   * Submits the user form and edits the user,
   * if successful redirects to the updated user.
   */
  /*
  submit() {
    const editedUser = this.editUserForm.value;
    this.usersService.editUser(this.userData.id, editedUser).subscribe((response: any) => {
      this.router.navigate(
        [
          '../../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }*/

  submit() {
    const form = this.editUserForm.value;

    const payload: any = {
      userId: this.userData.id,
      email: {
        email: form.email,
        isVerified: true
      },
      phone: {
        phone: form.phone,
        isVerified: true
      },
      profile: {
        username: form.username,
        givenName: form.firstname,
        familyName: form.lastname,
        displayName: `${form.firstname} ${form.lastname}`,
        nickName: form.firstname,
        preferredLanguage: form.preferredLanguage,
        gender: form.gender
      }
    };

    // ✅ Incluir solo si ambos campos están llenos
    if (form.currentPassword && form.newPassword) {
      payload.password = {
        currentPassword: form.currentPassword,
        newPassword: {
          password: form.newPassword,
          changeRequired: false
        }
      };
    }

    // Envía al backend
    this.usersService.editUser(this.userData.id, payload).subscribe((response: any) => {
      this.router.navigate(
        [
          '../../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
