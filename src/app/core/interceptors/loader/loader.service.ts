import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private progressBarElement: HTMLElement;

  constructor() {
    this.progressBarElement = document.getElementById('km-top-progress-bar');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.setProgressBarVisibility('visible');

    return next
      .handle(req)
      .do((event) => {
          if (event instanceof HttpResponse) {
            this.setProgressBarVisibility('hidden');
          }
        },
        error => this.setProgressBarVisibility('hidden'));
  }

  private setProgressBarVisibility(visibility: string): void {
    this.progressBarElement.style.visibility = visibility;
  }
}
