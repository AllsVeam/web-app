/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ConfigurationWizardService } from 'app/configuration-wizard/configuration-wizard.service';
/** Custom Services */
import { UsersServiceZitadel } from '../usersZitadel.service';

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
   * @param {UsersServiceZitadel} UsersServiceZitadel Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private UsersServiceZitadel: UsersServiceZitadel,
    private usersService: UsersServiceZitadel,
    private configurationWizardService: ConfigurationWizardService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { user: any; usersTemplate: any }) => {
      const fullUserData = data.user;

      this.userData = fullUserData.object?.result?.[0];

      this.officesData = data.usersTemplate.allowedOffices;
      this.rolesData = data.usersTemplate.availableRoles;

      this.createEditUserForm();
      //this.officeChanged(this.userData.officeId); // si aplica
    });
  }

  countryCodes = [
    { code: '+1', name: 'USA' },
    { code: '+52', name: 'México' },
    { code: '+54', name: 'Argentina' },
    { code: '+57', name: 'Colombia' },
    { code: '+34', name: 'España' }
  ];

  ngOnInit() {
    this.createEditUserForm();
    //this.officeChanged(this.userData.officeId);
  }

  /**
   * Creates the edit user form.
   */
  createEditUserForm() {
    const profile = this.userData?.human?.profile || {};
    const email = this.userData?.human?.email?.email || '';
    const phone = this.userData?.human?.phone?.phone || '';
    const defaultCode = '+52';
    let countryCode = defaultCode;
    let phoneNumber = phone;
    const gender = profile.gender || 'GENDER_MALE';
    const preferredLanguage = profile.preferredLanguage || 'es';

    for (const c of this.countryCodes) {
      if (phone.startsWith(c.code)) {
        countryCode = c.code;
        phoneNumber = phone.replace(c.code, '');
        break;
      }
    }

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
      countryCode: [
        countryCode,
        Validators.required
      ],
      phoneNumber: [
        phoneNumber,
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
      staffId: [null],
      roles: [
        this.userData.selectedRoles?.map((role: any) => role.id) || [],
        Validators.required
      ]
    });
  }

  /**
   * Fetches the staff for the selected office
   * @param officeId the selected office id
   */
  officeChanged(officeId: number) {
    this.staffData = [];
    /*this.UsersServiceZitadel.getStaff(officeId).subscribe((staff: any) => {
      this.staffData = staff;
    });   */
  }

  /**
   * Submits the user form and edits the user,
   * if successful redirects to the updated user.
   */
  submit() {
    const form = this.editUserForm.value;
    const token = 'bGH1RVY7gwgFydzrRTgyWfDhcoxYs8oiG-aEWapojTUa83Qw_6TEoux346VcdoVzO3VprpA';
    const fullPhone = `${form.countryCode}${form.phoneNumber}`;

    const payload: any = {
      userId: this.userData.id,
      token: token,
      email: {
        email: form.email,
        isVerified: true
      },
      phone: {
        phone: fullPhone,
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

    this.UsersServiceZitadel.editUser(this.userData.id, payload).subscribe({
      next: (response: any) => {
        console.log('Usuario editado:', response);
        this.router.navigate(['/appusers']);
      },
      error: (err) => {
        this.router.navigate(['/appusers']);
      }
    });
  }
}
