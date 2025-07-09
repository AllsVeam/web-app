import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'mifosx-callback',
  template: `<p>Procesando callback...</p>`
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      console.log('Código recibido:', code);
      if (code) {
        // Aquí haces la solicitud para intercambiar el code por tokens
        // this.authService.exchangeCodeForToken(code);
        const codeVerifier = localStorage.getItem('code_verifier');
        this.authService.exchangeCodeForTokens(code, codeVerifier);
      } else {
        console.warn('No se recibió ningún código en la URL');
      }
    });
  }
}
