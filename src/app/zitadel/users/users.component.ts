/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Users component.
 */
@Component({
  selector: 'mifosx-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit {

  /** Datos de usuarios */
  usersData: any[] = [];
  usersZitadelData: any[] = [];

  /** Columnas */
  displayedColumns: string[] = ['firstname', 'lastname', 'email', 'officeName'];

  /** DataSources */
  dataSource = new MatTableDataSource<any>();
  dataSourceZitadel = new MatTableDataSource<any>();

  /** Referencias para paginación y ordenamiento */
  @ViewChild('paginatorUsers', { static: true }) paginatorUsers!: MatPaginator;
  @ViewChild('sortUsers', { static: true }) sortUsers!: MatSort;

  @ViewChild('paginatorZitadel', { static: true }) paginatorZitadel!: MatPaginator;
  @ViewChild('sortZitadel', { static: true }) sortZitadel!: MatSort;

  /* Botones y popovers */
  @ViewChild('buttonCreateUser') buttonCreateUser!: ElementRef<any>;
  @ViewChild('templateButtonCreateUser') templateButtonCreateUser!: TemplateRef<any>;
  @ViewChild('usersTable') usersTable!: ElementRef<any>;
  @ViewChild('templateUsersTable') templateUsersTable!: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) { }

  ngOnInit() {
    // Obtener datos del resolver
    this.route.data.subscribe((data: { users: any; usersZitadel: any }) => {
      this.usersData = data.users || [];
      this.usersZitadelData = data.usersZitadel || [];

      // Inicializar tablas
      this.dataSource = new MatTableDataSource(this.usersData);
      this.dataSourceZitadel = new MatTableDataSource(this.usersZitadelData);

      // Asignar paginator y sort DESPUÉS de tener datos
      this.dataSource.paginator = this.paginatorUsers;
      this.dataSource.sort = this.sortUsers;

      this.dataSourceZitadel.paginator = this.paginatorZitadel;
      this.dataSourceZitadel.sort = this.sortZitadel;
    });
  }

  /** Filtrar tablas */
  applyFilter(filterValue: string) {
    const filter = filterValue.trim().toLowerCase();
    this.dataSource.filter = filter;
    this.dataSourceZitadel.filter = filter;
  }

  /** Mostrar popover */
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean) {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showUsers) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateUser, this.buttonCreateUser.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showUsersList) {
      setTimeout(() => {
        this.showPopover(this.templateUsersTable, this.usersTable.nativeElement, 'top', true);
      });
    }
  }

  /** Navegar */
  nextStep() {
    this.configurationWizardService.showUsers = false;
    this.configurationWizardService.showUsersList = false;
    this.configurationWizardService.showUsersForm = true;
    this.router.navigate(['/appusers/create']);
  }

  previousStep() {
    this.configurationWizardService.showUsers = false;
    this.configurationWizardService.showUsersList = false;
    this.configurationWizardService.showRolesandPermissionList = true;
    this.router.navigate(['/system/roles-and-permissions']);
  }
}
