/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
//import { UsersService } from '../users.service';
import { UsersServiceZitadel } from '../usersZitadel.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';

/** Custom Dialog Component */
import { PasswordsUtility } from 'app/core/utils/passwords-utility';
import { confirmPasswordValidator } from 'app/login/reset-password/confirm-password.validator';
import { ConfigurationWizardService } from 'app/configuration-wizard/configuration-wizard.service';
import { ContinueSetupDialogComponent } from 'app/configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';
import { UsersService } from 'app/users/users.service';
import { constant } from 'lodash';

/**
 * Create user component.
 */
@Component({
  selector: 'mifosx-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit, AfterViewInit {
  /** User form. */
  userForm: UntypedFormGroup;
  /** Offices data. */
  officesData: any;
  /** Roles data. */
  rolesData: any;
  /** Staff data. */
  staffData: any;

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

 /* Reference of create user form */
  @ViewChild('userFormRef') userFormRef: ElementRef<any>;
  /* Template for popover on create user form */
  @ViewChild('templateUserFormRef') templateUserFormRef: TemplateRef<any>;

  /**
   * Retrieves the offices and roles data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {UsersServiceZitadel} UsersService Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private usersService: UsersServiceZitadel,
    private usersService2: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private popoverService: PopoverService,
    private configurationWizardService: ConfigurationWizardService,
    private dialog: MatDialog,
    private passwordsUtility: PasswordsUtility
  ) {
    this.route.data.subscribe((data: { usersTemplate: any }) => {
      this.officesData = data.usersTemplate.allowedOffices;
      this.rolesData = data.usersTemplate.availableRoles;
    });
  }

  /**
   * Creates the user form, sets the staff data and conditional controls of the user form.
   */
  ngOnInit() {
    this.createUserForm();
    this.setStaffData();
    this.setConditionalControls();
  }

  /**
   * Creates the user form.
   */
  createUserForm(): void {
    this.userForm = this.formBuilder.group(
      {
        username: [
          '',
          Validators.required
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],
        firstName: [
          '',
          Validators.required
        ],
        lastName: [
          '',
          Validators.required
        ],
        preferredLanguage: [
          '',
          Validators.required
        ],
        gender: [
          '',
          Validators.required
        ],
        countryCode: [
          '+1',
          Validators.required
        ],
        phoneNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{7,15}$/)]
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(12),
            Validators.maxLength(50),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]
        ],
        repeatPassword: [
          '',
          Validators.required
        ],
        roles: [
          '',
          Validators.required
        ],
        officeId: [
          '',
          Validators.required
        ],
        staffId: ['']
      },
      { validators: confirmPasswordValidator }
    );

    this.userForm.get('repeatPassword')?.valueChanges.subscribe(() => {
      this.userForm.updateValueAndValidity();
    });

    this.userForm.statusChanges.subscribe((status) => {
      console.log('Form status:', status);
      console.log(
        'Invalid fields:',
        Object.entries(this.userForm.controls)
          .filter(
            ([
              _,
              control
            ]) => control.invalid
          )
          .map(([key]) => key)
      );
    });
  }

  /**
   * Sets the staff data each time the user selects a new office
   */
  setStaffData() {
    this.userForm.get('officeId').valueChanges.subscribe((officeId: string) => {
      this.staffData = [];
      this.usersService2.getStaff(officeId).subscribe((staff: any) => {
        this.staffData = staff;
      });
    });
  }

  /**
   * Sets the conditional controls of the user form
   */
  setConditionalControls() {
    this.userForm.get('sendPasswordToEmail').valueChanges.subscribe((sendPasswordToEmail: boolean) => {
      const passwordControl = this.userForm.get('password');
      const repeatPasswordControl = this.userForm.get('repeatPassword');

      if (sendPasswordToEmail) {
        passwordControl.disable();
        repeatPasswordControl.disable();
        this.userForm.get('email')?.setValidators([
          Validators.required,
          Validators.email
        ]);
      } else {
        passwordControl.enable();
        repeatPasswordControl.enable();
        this.userForm.get('email')?.setValidators([Validators.email]);
      }

      this.userForm.get('email')?.updateValueAndValidity();
    });
  }

  /**
   * Submits the user form and creates user,
   * if successful redirects to view created user.
   */
  submit() {
    const fullForm = this.userForm.value;

    const fullPhone = `${fullForm.countryCode}${fullForm.phoneNumber}`;
    const password = `${fullForm.repeatPassword}`;
    const givenName = `${fullForm.firstName}`;
    const familyName = `${fullForm.lastName}`;
    const nickName = `${fullForm.username}`;

    const user = {
      ...fullForm,
      phone: fullPhone,
      password: password,
      givenName: givenName,
      familyName: familyName,
      nickName: nickName,
      displayName: `${fullForm.firstName} ${fullForm.lastName}`
    };

    const dataOffi = {
      officeId: fullForm.officeId,
      staffId: fullForm.staffId
    };

    const selectedRoleIds = this.userForm.get('roles')?.value;

    delete user.officeId;
    delete user.staffId;
    delete user.roles;
    delete user.countryCode;
    delete user.phoneNumber;
    delete user.repeatPassword;
    delete user.firstName;
    delete user.lastName;

    this.usersService.createUser(user).subscribe((response: any) => {
      const userId = response.object?.userId;

      if (userId) {
        const bodyBD = {
          id: userId,
          officeId: dataOffi.officeId,
          staffId: dataOffi.staffId,
          username: user.nickName,
          firstname: user.givenName,
          lastname: user.familyName,
          roleIds: selectedRoleIds || []
        };

        //console.log('Sending to CrearBD:', bodyBD);

        this.usersService.createUserBd(bodyBD).subscribe(
          (resBD: any) => {
            //console.log('User created in DB:', resBD);

            if (selectedRoleIds?.length > 0) {
              this.usersService.assignRolesToUser(userId, selectedRoleIds).subscribe(
                () => {
                  if (this.configurationWizardService.showUsersForm === true) {
                    this.configurationWizardService.showUsersForm = false;
                    this.openDialog();
                  } else {
                    this.router.navigate(['/appusers']);
                  }
                },
                (error) => {
                  console.error('Error assigning roles:', error);
                }
              );
            } else {
              console.warn('No selected roles found.');
            }
          },
          (error) => {
            console.error('Error creating in DB (CrearBD):', error);
          }
        );
      } else {
        console.error('Could not get userId');
      }
    });
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showUsersForm === true) {
      setTimeout(() => {
        this.showPopover(this.templateUserFormRef, this.userFormRef.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Maker Checker Tasks System Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showUsersForm = false;
    this.configurationWizardService.showMakerCheckerTable = true;
    this.router.navigate(['/system']);
  }

  /**
   * Previous Step (Users page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showUsersForm = false;
    this.configurationWizardService.showUsersList = true;
    this.router.navigate(['/appusers']);
  }

  /**
   * Opens dialog if the user wants to create more users.
   */
  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'user'
      }
    });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
      if (response.step === 1) {
        this.configurationWizardService.showUsersForm = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      } else if (response.step === 2) {
        this.configurationWizardService.showUsersForm = true;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/organization/users/create']);
      } else if (response.step === 3) {
        this.configurationWizardService.showUsersForm = false;
        this.configurationWizardService.showMakerCheckerTable = true;
        this.router.navigate(['/system']);
      }
    });
  }

}