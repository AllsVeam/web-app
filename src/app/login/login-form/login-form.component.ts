/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** rxjs Imports */
import { finalize } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';

/** Ruta de seguridad Zitadel*/
import { AuthService } from '../../zitadel/auth.service';
import { environment } from '../../../environments/environment';



/**
 * Login form component.
 */
@Component({
  selector: 'mifosx-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
 public environment = environment;
oidcServerEnabled = !(
  (window as any)?.env?.oidcServerEnabled === false ||
  (window as any)?.env?.oidcServerEnabled === 'false' ||
  (window as any)?.env?.oidcServerEnabled === 0 ||
  (window as any)?.env?.oidcServerEnabled === '0' ||
  (window as any)?.env?.oidcServerEnabled === null ||
  (window as any)?.env?.oidcServerEnabled === undefined
);


  /** Login form group. */
  loginForm: FormGroup;
  /** Password input field type. */
  passwordInputType: string = 'password';
  /** True if loading. */
  loading = false;

  isLoggedIn = false;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    public authService: AuthService
  ) {}

  /**
   * Creates login form.
   *
   * Initializes password input field type.
   */
  ngOnInit() {
    this.createLoginForm();
    console.log(this.oidcServerEnabled);
    console.log("Sera un boleano : ");
    console.log(typeof this.oidcServerEnabled === 'boolean');
    console.log((window as any).env.oidcServerEnabled);
    console.log((window as any).env.oidcBaseUrl);
    console.log((window as any).env.oidcClientId);
    console.log((window as any).env.oidcApiUrl);
    console.log((window as any).env.oidcFrontUrl);
  }

  login2() {
    this.authService.login();
  }

  getUsers() {
    this.authService.getUsers();
  }

  logout() {
    this.authService.logout();
  }

  /**
   * Authenticates the user if the credentials are valid.
   */
  login() {
    this.loading = true;
    this.loginForm.disable();
    this.authenticationService
      .login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.loginForm.reset();
          this.loginForm.markAsPristine();
          // Angular Material Bug: Validation errors won't get removed on reset.
          this.loginForm.enable();
          this.loading = false;
        })
      )
      .subscribe();
  }

  /**
   * Toggles the visibility of the password input field.
   *
   * Changes the input type between 'password' and 'text'.
   */

  togglePasswordVisibility() {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
  }

  /**
   * TODO: Decision to be taken on providing this feature.
   */
  forgotPassword() {
    console.log('Forgot Password feature currently unavailable.');
  }

  /**
   * Creates login form with validation rules.
   */

  private createLoginForm() {
    this.loginForm = this.formBuilder.group({
      username: [
        '',
        Validators.required
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)]
      ],
      remember: false
    });
  }

  /**
   * Returns the appropriate error message for the specified form control.
   *
   * @param {string} controlName - The name of the form control.
   * @returns {string} - The error message.
   */

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    } else if (control?.hasError('minlength')) {
      return `Minimum length is ${control.errors?.minlength.requiredLength}`;
    }
    return '';
  }
}
