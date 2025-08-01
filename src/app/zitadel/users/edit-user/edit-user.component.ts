/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
/** Custom Services */
import { UsersServiceZitadel } from '../usersZitadel.service';
import { UsersService } from 'app/users/users.service';
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
   * @param {UsersService} UsersService Users Service.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private UsersServiceZitadel: UsersServiceZitadel,
    private UsersService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { user: any; usersTemplate: any }) => {
      const fullUserData = data.user;
      this.userData = fullUserData.object?.result?.[0] || {};
      this.officesData = data.usersTemplate.allowedOffices;
      this.rolesData = data.usersTemplate.availableRoles;
      this.UsersServiceZitadel.getDatosExtraUsuario(this.userData.id).subscribe((resp: any) => {
        const datos = resp.object;
        this.userData = {
          ...this.userData,
          userName: datos.username,
          officeId: datos.officeId,
          staffId: datos.staffId,
          selectedRoles: datos.roles || []
        };
        this.createEditUserForm();
        this.officeChanged(this.userData.officeId);
        this.UsersServiceZitadel.getRoles().subscribe((response: any) => {
          const rolesZitadel = response.object?.result || [];
          this.rolesData = rolesZitadel.map((r: any) => ({
            id: r.key,
            name: r.displayName
          }));
        });
      });
    });
  }

  countryCodes = [
    { code: '+93', name: 'Afganistán' },
    { code: '+355', name: 'Albania' },
    { code: '+213', name: 'Argelia' },
    { code: '+376', name: 'Andorra' },
    { code: '+244', name: 'Angola' },
    { code: '+54', name: 'Argentina' },
    { code: '+374', name: 'Armenia' },
    { code: '+61', name: 'Australia' },
    { code: '+43', name: 'Austria' },
    { code: '+994', name: 'Azerbaiyán' },
    { code: '+973', name: 'Baréin' },
    { code: '+880', name: 'Bangladés' },
    { code: '+375', name: 'Bielorrusia' },
    { code: '+32', name: 'Bélgica' },
    { code: '+591', name: 'Bolivia' },
    { code: '+387', name: 'Bosnia y Herzegovina' },
    { code: '+55', name: 'Brasil' },
    { code: '+359', name: 'Bulgaria' },
    { code: '+226', name: 'Burkina Faso' },
    { code: '+257', name: 'Burundi' },
    { code: '+855', name: 'Camboya' },
    { code: '+237', name: 'Camerún' },
    { code: '+1', name: 'Canadá' },
    { code: '+56', name: 'Chile' },
    { code: '+86', name: 'China' },
    { code: '+57', name: 'Colombia' },
    { code: '+506', name: 'Costa Rica' },
    { code: '+385', name: 'Croacia' },
    { code: '+53', name: 'Cuba' },
    { code: '+357', name: 'Chipre' },
    { code: '+420', name: 'Chequia' },
    { code: '+45', name: 'Dinamarca' },
    { code: '+20', name: 'Egipto' },
    { code: '+503', name: 'El Salvador' },
    { code: '+34', name: 'España' },
    { code: '+372', name: 'Estonia' },
    { code: '+251', name: 'Etiopía' },
    { code: '+358', name: 'Finlandia' },
    { code: '+33', name: 'Francia' },
    { code: '+995', name: 'Georgia' },
    { code: '+49', name: 'Alemania' },
    { code: '+233', name: 'Ghana' },
    { code: '+30', name: 'Grecia' },
    { code: '+502', name: 'Guatemala' },
    { code: '+504', name: 'Honduras' },
    { code: '+36', name: 'Hungría' },
    { code: '+354', name: 'Islandia' },
    { code: '+91', name: 'India' },
    { code: '+62', name: 'Indonesia' },
    { code: '+964', name: 'Irak' },
    { code: '+98', name: 'Irán' },
    { code: '+353', name: 'Irlanda' },
    { code: '+972', name: 'Israel' },
    { code: '+39', name: 'Italia' },
    { code: '+81', name: 'Japón' },
    { code: '+962', name: 'Jordania' },
    { code: '+7', name: 'Kazajistán' },
    { code: '+254', name: 'Kenia' },
    { code: '+965', name: 'Kuwait' },
    { code: '+996', name: 'Kirguistán' },
    { code: '+371', name: 'Letonia' },
    { code: '+961', name: 'Líbano' },
    { code: '+218', name: 'Libia' },
    { code: '+370', name: 'Lituania' },
    { code: '+352', name: 'Luxemburgo' },
    { code: '+389', name: 'Macedonia del Norte' },
    { code: '+60', name: 'Malasia' },
    { code: '+52', name: 'México' },
    { code: '+373', name: 'Moldavia' },
    { code: '+377', name: 'Mónaco' },
    { code: '+976', name: 'Mongolia' },
    { code: '+212', name: 'Marruecos' },
    { code: '+258', name: 'Mozambique' },
    { code: '+977', name: 'Nepal' },
    { code: '+31', name: 'Países Bajos' },
    { code: '+64', name: 'Nueva Zelanda' },
    { code: '+505', name: 'Nicaragua' },
    { code: '+234', name: 'Nigeria' },
    { code: '+47', name: 'Noruega' },
    { code: '+92', name: 'Pakistán' },
    { code: '+507', name: 'Panamá' },
    { code: '+595', name: 'Paraguay' },
    { code: '+51', name: 'Perú' },
    { code: '+63', name: 'Filipinas' },
    { code: '+48', name: 'Polonia' },
    { code: '+351', name: 'Portugal' },
    { code: '+974', name: 'Catar' },
    { code: '+40', name: 'Rumanía' },
    { code: '+7', name: 'Rusia' },
    { code: '+966', name: 'Arabia Saudita' },
    { code: '+221', name: 'Senegal' },
    { code: '+381', name: 'Serbia' },
    { code: '+65', name: 'Singapur' },
    { code: '+421', name: 'Eslovaquia' },
    { code: '+386', name: 'Eslovenia' },
    { code: '+27', name: 'Sudáfrica' },
    { code: '+82', name: 'Corea del Sur' },
    { code: '+94', name: 'Sri Lanka' },
    { code: '+46', name: 'Suecia' },
    { code: '+41', name: 'Suiza' },
    { code: '+886', name: 'Taiwán' },
    { code: '+66', name: 'Tailandia' },
    { code: '+90', name: 'Turquía' },
    { code: '+256', name: 'Uganda' },
    { code: '+380', name: 'Ucrania' },
    { code: '+971', name: 'Emiratos Árabes Unidos' },
    { code: '+44', name: 'Reino Unido' },
    { code: '+1', name: 'Estados Unidos' },
    { code: '+598', name: 'Uruguay' },
    { code: '+998', name: 'Uzbekistán' },
    { code: '+58', name: 'Venezuela' },
    { code: '+84', name: 'Vietnam' },
    { code: '+967', name: 'Yemen' },
    { code: '+260', name: 'Zambia' },
    { code: '+263', name: 'Zimbabue' }
  ];

  createEditUserForm() {
    const profile = this.userData?.human?.profile ?? {};
    const email = this.userData?.human?.email?.email || '';
    const phone = this.userData?.human?.phone?.phone || '';
    const defaultCode = '+52';
    let countryCode = defaultCode;
    let phoneNumber = phone;
    const gender = profile?.gender && profile.gender !== '' ? profile.gender : 'GENDER_MALE';
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
      officeId: [
        this.userData.officeId,
        Validators.required
      ],
      staffId: [
        this.userData.staffId || null
      ],
      roles: [
        this.userData.selectedRoles.map((role: any) => role.id.toString()),
        Validators.required
      ]
    });
  }

  /**
   * Fetches the staff for the selected office
   * @param officeId the selected office id
   */
  officeChanged(officeId: number | undefined) {
    if (!officeId) {
      console.warn('No se proporcionó officeId para cargar el staff.');
      return;
    }

    this.staffData = [];
    this.UsersService.getStaff(officeId).subscribe((staff: any) => {
      this.staffData = staff;
    });
  }

  /**
   * Submits the user form and edits the user,
   * if successful redirects to the updated user.
   */
  submit() {
    const form = this.editUserForm.value;
    const fullPhone = `${form.countryCode}${form.phoneNumber}`;

    const userPayload: any = {
      userId: this.userData.id,
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

    const rolesPayload = {
      userId: this.userData.id,
      roleKeys: this.editUserForm.value.roles
    };

    const officePayload = {
      userId: this.userData.id,
      officeId: form.officeId,
      staffId: form.staffId
    };

    this.UsersServiceZitadel.editUser(userPayload).subscribe();

    this.UsersServiceZitadel.editRoles(rolesPayload).subscribe();

    this.UsersServiceZitadel.editOffice(officePayload).subscribe((response: any) => {
      this.router.navigate(['/appusers']);
    });
  }
}
