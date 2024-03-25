import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router'
import { Observable } from 'rxjs';
import { AppService } from './services/app.service';

@Injectable()
export class ConsultantGuard implements CanActivate {
    constructor(private router: Router, private appService: AppService) { }
    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return Observable.create(async observer => {
            this.appService.ambiente = 'consultor';
            this.appService.user = await this.appService.storage.get(`user`);
            if (!this.appService.user?.consultor)
                this.appService.navigateUrl('login');
            observer.next(true);
            observer.complete();
        });
    }
}

@Injectable()
export class AssociadoGuard implements CanActivate {
    constructor(private router: Router, private appService: AppService) { }
    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return Observable.create(async observer => {
            this.appService.ambiente = 'associado';
            this.appService.user = await this.appService.storage.get(`user`);
            if (!this.appService.user?.associado)
                this.appService.navigateUrl('login');
            observer.next(true);
            observer.complete();
        });
    }
}

@Injectable()
export class CredenciadaGuard implements CanActivate {
    constructor(private router: Router, private appService: AppService) { }
    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return Observable.create(async observer => {
            this.appService.ambiente = 'clinica';
            this.appService.user = await this.appService.storage.get(`user`);
            if (!this.appService.user?.clinica)
                this.appService.navigateUrl('login');
            observer.next(true);
            observer.complete();
        });
    }
}