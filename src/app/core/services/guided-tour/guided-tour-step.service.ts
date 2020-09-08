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

import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {ReplaySubject, Observable} from 'rxjs';

import {GuidedTourStep, GuidedTourStepInfo, StepActionType} from '../../../shared/entity/guided-tour';
import {EventListenerService} from './event-listener.service';
import {GuidedTourStepsContainerService} from './guided-tour-steps-container.service';
import {DocumentService} from './document.service';
import {StepDrawerService} from './step-drawer.service';
import {DomRefService} from './dom.service';
import {GuidedTourOptionsService} from './guided-tour-options.service';

const SCROLLBAR_SIZE = 20;

export const DISTANCE_FROM_TARGET = 15;
export const ARROW_SIZE = 10;

@Injectable()
export class GuidedTourStepService {
  private currentStep: GuidedTourStep;
  private winTopPosition: number = 0;
  private winBottomPosition: number = 0;
  private stepsObserver: ReplaySubject<GuidedTourStepInfo> = new ReplaySubject<GuidedTourStepInfo>();

  constructor(
    private readonly eventListener: EventListenerService,
    private readonly stepsContainerService: GuidedTourStepsContainerService,
    private readonly documentService: DocumentService,
    private readonly DOMService: DomRefService,
    private readonly stepDrawerService: StepDrawerService,
    private readonly optionsService: GuidedTourOptionsService,
    private readonly router: Router
  ) {
    this.initViewportPositions();
    this.subscribeToScrollEvents();
  }

  getCurrentStepNumber(): number {
    return !!this.currentStep ? this.stepsContainerService.getStepNumber(this.currentStep.name) : null;
  }

  private initViewportPositions(): void {
    this.winTopPosition = 0;
    this.winBottomPosition = this.DOMService.getNativeWindow().innerHeight - SCROLLBAR_SIZE;
  }

  private subscribeToScrollEvents(): void {
    this.eventListener.startListeningScrollEvents();
    this.eventListener.scrollEvent.subscribe(scroll => {
      this.winTopPosition = scroll.scrollY;
      this.winBottomPosition = this.winTopPosition + this.DOMService.getNativeWindow().innerHeight - SCROLLBAR_SIZE;
    });
  }

  private drawStep(step: GuidedTourStep): void {
    step.position = step.position === 'NO_POSITION' ? this.optionsService.getStepDefaultPosition() : step.position;
    this.stepDrawerService.draw(step);
  }

  startTour(): Observable<GuidedTourStepInfo> {
    this.stepsObserver = new ReplaySubject<GuidedTourStepInfo>();
    this.stepsContainerService.init();
    this.documentService.setDocumentHeight();

    this.tryShowStep(StepActionType.NEXT);
    this.eventListener.startListeningResizeEvents();
    this.subscribeToStepsUpdates();
    return this.stepsObserver.asObservable();
  }

  close(): void {
    this.removeCurrentStep();
    this.notifyTourIsFinished();
    this.DOMService.getNativeWindow().scrollTo(0, 0);
    this.eventListener.stopListeningResizeEvents();
  }

  prev(): void {
    this.removeCurrentStep();
    this.currentStep.prevCliked.emit();
    this.tryShowStep(StepActionType.PREV);
  }

  next(): void {
    this.removeCurrentStep();
    this.currentStep.nextClicked.emit();
    this.tryShowStep(StepActionType.NEXT);
  }

  private navigateToStepPage(action: StepActionType): void {
    let stepRoute = this.stepsContainerService.getStepRoute(action);
    if (stepRoute) {
      this.router.navigate([stepRoute]);
    }
  }

  private subscribeToStepsUpdates(): void {
    this.stepsContainerService.stepHasBeenModified.subscribe(updatedStep => {
      if (this.currentStep && this.currentStep.name === updatedStep.name) {
        this.currentStep = updatedStep;
      }
    });
  }

  private tryShowStep(actionType: StepActionType): void {
    this.navigateToStepPage(actionType);
    const timeout = this.optionsService.getWaitingTime();
    setTimeout(() => {
      try {
        this.showStep(actionType);
      } catch (error) {
        this.close();
      }
    }, timeout);
  }

  private showStep(actionType: StepActionType): void {
    this.currentStep = this.stepsContainerService.get(actionType);

    // Scroll the element to get it visible if it's in a scrollable element
    this.scrollIfElementBeyondOtherElements();
    this.drawStep(this.currentStep);
    this.scrollIfStepAndTargetAreNotVisible();
    this.notifyStepClicked(actionType);
  }

  private notifyStepClicked(actionType: StepActionType): void {
    let stepInfo: GuidedTourStepInfo = {
      number: this.stepsContainerService.getStepNumber(this.currentStep.name),
      name: this.currentStep.name,
      route: this.currentStep.route,
      actionType
    };
    this.stepsObserver.next(stepInfo);
  }

  private notifyTourIsFinished(): void {
    if (this.currentStep) this.currentStep.tourDone.emit();
    this.stepsObserver.complete();
  }

  private removeCurrentStep(): void {
    if (this.currentStep) {
      this.stepDrawerService.remove(this.currentStep)
    };
  }

  private scrollIfStepAndTargetAreNotVisible(): void {
    this.scrollWhenTargetOrStepAreHiddenBottom();
    this.scrollWhenTargetOrStepAreHiddenTop();
  }

  private scrollWhenTargetOrStepAreHiddenBottom(): void {
    let totalTargetBottom = this.getMaxTargetAndStepBottomPosition();
    if (totalTargetBottom > this.winBottomPosition) {
      this.DOMService.getNativeWindow().scrollBy(0, totalTargetBottom - this.winBottomPosition);
    }
  }

  private scrollWhenTargetOrStepAreHiddenTop(): void {
    let totalTargetTop = this.getMaxTargetAndStepTopPosition();
    if (totalTargetTop < this.winTopPosition) {
      this.DOMService.getNativeWindow().scrollBy(0, totalTargetTop - this.winTopPosition);
    }
  }

  private getMaxTargetAndStepBottomPosition(): number {
    let targetAbsoluteTop = this.documentService.getElementAbsoluteTop(this.currentStep.targetViewContainer.element);
    if (this.currentStep.position === 'top') {
      return targetAbsoluteTop + this.currentStep.stepInstance.targetHeight;
    } else if (this.currentStep.position === 'bottom') {
      return (
        targetAbsoluteTop +
        this.currentStep.stepInstance.targetHeight +
        this.currentStep.stepInstance.stepHeight +
        ARROW_SIZE +
        DISTANCE_FROM_TARGET
      );
    } else if (this.currentStep.position === 'right' || this.currentStep.position === 'left') {
      return Math.max(
        targetAbsoluteTop + this.currentStep.stepInstance.targetHeight,
        targetAbsoluteTop + this.currentStep.stepInstance.targetHeight / 2 + this.currentStep.stepInstance.stepHeight / 2
      );
    }
  }

  private getMaxTargetAndStepTopPosition(): number {
    let targetAbsoluteTop = this.documentService.getElementAbsoluteTop(this.currentStep.targetViewContainer.element);
    if (this.currentStep.position === 'top') {
      return targetAbsoluteTop - (this.currentStep.stepInstance.stepHeight + ARROW_SIZE + DISTANCE_FROM_TARGET);
    } else if (this.currentStep.position === 'bottom') {
      return targetAbsoluteTop;
    } else if (this.currentStep.position === 'right' || this.currentStep.position === 'left') {
      return Math.min(
        targetAbsoluteTop,
        targetAbsoluteTop + this.currentStep.stepInstance.targetHeight / 2 - this.currentStep.stepInstance.stepHeight / 2
      );
    }
  }

  private scrollIfElementBeyondOtherElements(): void {
    if (this.isElementBeyondOthers() === 2) {
      this.documentService.scrollToTheTop(this.currentStep.targetViewContainer.element);
    }
    if (this.isElementBeyondOthers() === 2) {
      this.documentService.scrollToTheBottom(this.currentStep.targetViewContainer.element);
    }
    if (this.isElementBeyondOthers() === 1 && this.documentService.isParentScrollable(this.currentStep.targetViewContainer.element)) {
      this.documentService.scrollIntoView(this.currentStep.targetViewContainer.element, this.currentStep.isElementOrAncestorFixed);
    }
    if (this.isElementBeyondOthers() === 1 && this.documentService.isParentScrollable(this.currentStep.targetViewContainer.element)) {
      this.currentStep.targetViewContainer.element.nativeElement.scrollIntoView();
    }
  }

  private isElementBeyondOthers(): number {
    return this.documentService.isElementBeyondOthers(
      this.currentStep.targetViewContainer.element,
      this.currentStep.isElementOrAncestorFixed,
      'backdrop'
    );
  }
}
