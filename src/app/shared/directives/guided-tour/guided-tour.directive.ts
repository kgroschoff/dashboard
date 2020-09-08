// Copyright 2020 The Kubermatic Kubernetes Platform contributors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, Inject,PLATFORM_ID, OnDestroy, ViewContainerRef, Output} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';

import {GuidedTourStep, GuidedTourItem} from '../../entity/guided-tour';
import {DomRefService} from '../../../core/services/guided-tour/dom.service';
import {GuidedTourItemsService} from '../../../core/services/guided-tour/guided-tour-items.service';
import {GuidedTourStepsContainerService} from '../../../core/services/guided-tour/guided-tour-steps-container.service';

@Directive({
  selector: 'kmGuidedTour, [kmGuidedTour]',
})

export class GuidedTourDirective implements AfterViewInit, OnDestroy {
  @Input('kmGuidedTour') name: string;

  @Output() prev?: EventEmitter<any> = new EventEmitter<any>();
  @Output() next?: EventEmitter<any> = new EventEmitter<any>();
  @Output() done?: EventEmitter<any> = new EventEmitter<any>();

  guidedTourItem: GuidedTourItem;

  private windowRef: Window;
  private step: GuidedTourStep;
  private readonly _unsubscribe = new Subject<void>();

  constructor(private readonly guidedTourStepsContainer: GuidedTourStepsContainerService,
              private readonly guidedTourItemsService: GuidedTourItemsService,
              private viewContainerRef: ViewContainerRef,
              private readonly domService: DomRefService,
              private readonly router: Router,
              @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.windowRef = this.domService.getNativeWindow();
    this.step = new GuidedTourStep();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.guidedTourItem = this.guidedTourItemsService.getGuidedTourItems().find(item => item.id === this.name);

    this.step.title = this.guidedTourItem.title;
    this.step.text = this.guidedTourItem.text;
    this.step.position = this.guidedTourItem.stepPosition;
    if (!!this.guidedTourItem.nextText) {
      this.step.nextText = this.guidedTourItem.nextText;
    }
    this.step.route = this.guidedTourItem.route;
    this.step.targetViewContainer = this.viewContainerRef;
    this.step.nextClicked = this.next;
    this.step.prevCliked = this.prev;
    this.step.tourDone = this.done;
    
    this.step.name = this.name;
    this.step.route = this.router.url.substr(0, 1) === '/' ? this.router.url.substr(1) : this.router.url;
    this.step.isElementOrAncestorFixed =
        this.isElementFixed(this.viewContainerRef.element) ||
        this.isAncestorsFixed(this.viewContainerRef.element.nativeElement.parentElement);

    this.guidedTourStepsContainer.addStep(this.step);
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  private isElementFixed(element: ElementRef): boolean {
    return this.windowRef.getComputedStyle(element.nativeElement).position === 'fixed';
  }

  private isAncestorsFixed(nativeElement: any): boolean {
    if (!nativeElement || !nativeElement.parentElement) return false;
    let isElementFixed = this.windowRef.getComputedStyle(nativeElement.parentElement).position === 'fixed';
    if (nativeElement.nodeName === 'BODY') {
      return isElementFixed;
    }
    if (isElementFixed) return true;
    else return this.isAncestorsFixed(nativeElement.parentElement);
  }
}
