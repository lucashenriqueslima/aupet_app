import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, } from '@angular/common/http';
import { AppService } from './app.service';
import { from } from 'rxjs'
@Injectable({ providedIn: 'root' })
export class HttpsRequestInterceptor implements HttpInterceptor {
    constructor(private appService: AppService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler,): Observable<HttpEvent<any>> {
        return from(this.handle(req, next))
    }
    async handle(req: HttpRequest<any>, next: HttpHandler) {
        let access_token = await this.appService.storage.get(`access_token`);
        if (access_token) {
            req = req.clone({ 'headers': req.headers.set('access_token', access_token) });
            req = req.clone({ 'headers': req.headers.set('ambiente', this.appService.ambiente) });
        }
        return next.handle(req).toPromise();
    }
}