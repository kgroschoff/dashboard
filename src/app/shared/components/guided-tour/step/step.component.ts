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

import {Component, Input, AfterViewInit, ViewEncapsulation, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, Injector, Output, EventEmitter} from '@angular/core';
import {Subscription} from 'rxjs';

import {GuidedTourStep} from '../../../entity/guided-tour';
import {GuidedTourStepService, ARROW_SIZE, DISTANCE_FROM_TARGET} from '../../../../core/services/guided-tour/guided-tour-step.service';
import {GuidedTourStepsContainerService} from '../../../../core/services/guided-tour/guided-tour-steps-container.service';
import {EventListenerService} from '../../../../core/services/guided-tour/event-listener.service';
import {DocumentService} from '../../../../core/services/guided-tour/document.service';
import {GuidedTourOptionsService} from '../../../../core/services/guided-tour/guided-tour-options.service';

const STEP_MIN_WIDTH = 350;
const STEP_MAX_WIDTH = 400;
const STEP_HEIGHT = 100;
const ASPECT_RATIO = 2;
export const DEFAULT_DISTANCE_FROM_MARGIN_TOP = 2;
export const DEFAULT_DISTANCE_FROM_MARGIN_LEFT = 2;
const DEFAULT_DISTANCE_FROM_MARGIN_BOTTOM = 5;
const DEFAULT_DISTANCE_FROM_MARGIN_RIGHT = 5;

@Component({
  selector: 'guided-tour-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GuidedTourStepComponent implements OnInit, OnDestroy, AfterViewInit {
  stepWidth: number = STEP_MIN_WIDTH;
  stepHeight: number = STEP_HEIGHT;
  leftPosition: number;
  topPosition: number;
  showArrow = true;
  arrowPosition: string;
  arrowLeftPosition: number;
  arrowTopPosition: number;
  title: string;
  text: string;
  nextText: string = 'Next';
  isPrevButtonVisible: boolean;
  ctx: Object;

  private arrowSize: number = ARROW_SIZE;
  private stepAbsoluteLeft: number;
  private stepAbsoluteTop: number;
  private targetWidth: number;
  targetHeight: number;
  private targetAbsoluteLeft: number;
  private targetAbsoluteTop: number;

  private subscriptions: Subscription[] = [];
  guidedTourStepService: GuidedTourStepService;

  private documentHeight: number;


  @Input() step?: GuidedTourStep;
  @ViewChild('stepWrapper', { static: true }) stepWrapper: ElementRef;
  @ViewChild('stepContainer', { static: true }) stepContainer: ElementRef;
  @Output() clicked: EventEmitter<any> = new EventEmitter();

  constructor(
    private injector: Injector,
    private readonly stepsContainerService: GuidedTourStepsContainerService,
    private readonly eventListenerService: EventListenerService,
    private readonly documentService: DocumentService,
    private readonly renderer: Renderer2,
    private readonly optionsService: GuidedTourOptionsService
  ) {}

  ngOnInit(): void {
    // Need to Inject here otherwise you will obtain a circular dependency
    this.guidedTourStepService = this.injector.get(GuidedTourStepService);

    this.documentHeight = this.documentService.getDocumentHeight();
    this.subscriptions.push(this.subscribeToResizeEvents());
    this.title = this.step.title ;
    this.text = this.step.text;
    if (this.step.nextText) {
      this.nextText = this.step.nextText;
    }

    this.isPrevButtonVisible = this.optionsService.isPrevButtonVisible();

    if (this.text) {
      this.checkRedraw(this.text);
    }

    if (this.title) {
      this.checkRedraw(this.title);
    }
  }

  ngAfterViewInit(): void {
    this.renderer.setStyle(
      this.stepContainer.nativeElement,
      'max-width',
      STEP_MAX_WIDTH + 'px'
    );
    let dimensions = this.getDimensionsByAspectRatio(
      this.stepContainer.nativeElement.clientWidth,
      this.stepContainer.nativeElement.clientHeight,
      ASPECT_RATIO
    );
    dimensions = this.adjustDimensions(
      dimensions.width,
      dimensions.height
    );
    this.stepWidth = dimensions.width;
    this.stepHeight = dimensions.height;
    this.renderer.setStyle(
      this.stepContainer.nativeElement,
      'width',
      this.stepWidth + 'px'
    );
    this.renderer.setStyle(
      this.stepContainer.nativeElement,
      'height',
      this.stepHeight + 'px'
    );

    this.drawStep();
  }

  private checkRedraw(val): void {
    if (val !== null) {
      // Need to wait that the change is rendered before redrawing
      setTimeout(() => {
        this.redrawStep();
      }, 2);
    }
  }

  private drawStep(): void {
    let position = this.step.isElementOrAncestorFixed
      ? 'fixed'
      : 'absolute';
    this.renderer.setStyle(
      this.stepWrapper.nativeElement,
      'position',
      position
    );
    this.targetWidth = this.step.targetViewContainer.element.nativeElement.getBoundingClientRect().width;
    this.targetHeight = this.step.targetViewContainer.element.nativeElement.getBoundingClientRect().height;
    this.targetAbsoluteLeft =
      position === 'fixed'
        ? this.documentService.getElementFixedLeft(this.step.targetViewContainer.element)
        : this.documentService.getElementAbsoluteLeft(this.step.targetViewContainer.element);
    this.targetAbsoluteTop =
      position === 'fixed'
        ? this.documentService.getElementFixedTop(this.step.targetViewContainer.element)
        : this.documentService.getElementAbsoluteTop(this.step.targetViewContainer.element);
    this.setStepStyle();
  }

  prev(): void {
    this.clicked.emit();
    this.guidedTourStepService.prev();
  }

  next(): void {
    this.clicked.emit();
    this.guidedTourStepService.next();
  }

  close(): void {
    this.clicked.emit();
    this.guidedTourStepService.close();
  }

  isFirstStep(): boolean {
    return this.stepsContainerService.getStepNumber(this.step.name) === 1;
  }

  isLastStep(): boolean {
    return (
      this.stepsContainerService.getStepNumber(this.step.name) ===
      this.stepsContainerService.getStepsCount()
    );
  }

  private setStepStyle(): void {
    switch (this.step.position) {
      case 'top': {
        this.setStyleTop();
        break;
      }
      case 'bottom': {
        this.setStyleBottom();
        break;
      }
      case 'right': {
        this.setStyleRight();
        break;
      }
      case 'left': {
        this.setStyleLeft();
        break;
      }
      case 'center': {
        this.setStyleCenter();
        break;
      }
      default: {
        this.setStyleBottom();
      }
    }
  }

  private setStyleTop(): void {
    this.stepsContainerService.updatePosition(this.step.name, 'top');
    this.topPosition =
        this.targetAbsoluteTop - DISTANCE_FROM_TARGET - this.stepHeight;
    this.stepAbsoluteTop =
        this.targetAbsoluteTop - DISTANCE_FROM_TARGET - this.stepHeight;
    this.arrowTopPosition = this.stepHeight;

    this.leftPosition =
        this.targetWidth / 2 - this.stepWidth / 2 + this.targetAbsoluteLeft;
    this.stepAbsoluteLeft =
        this.targetWidth / 2 - this.stepWidth / 2 + this.targetAbsoluteLeft;
    this.arrowLeftPosition = this.stepWidth / 2 - this.arrowSize;
    this.adjustLeftPosition();
    this.adjustRightPosition();
    this.arrowPosition = 'bottom';
    this.autofixTopPosition();
  }

  private setStyleRight(): void {
    this.stepsContainerService.updatePosition(this.step.name, 'right');
    this.topPosition =
      this.targetAbsoluteTop +
      this.targetHeight / 2 -
      this.stepHeight / 2;
    this.stepAbsoluteTop =
      this.targetAbsoluteTop +
      this.targetHeight / 2 -
      this.stepHeight / 2;
    this.arrowTopPosition = this.stepHeight / 2 - this.arrowSize;

    this.leftPosition =
      this.targetAbsoluteLeft + this.targetWidth + DISTANCE_FROM_TARGET;
    this.stepAbsoluteLeft =
      this.targetAbsoluteLeft + this.targetWidth + DISTANCE_FROM_TARGET;
    this.arrowLeftPosition = -this.arrowSize;
    this.adjustTopPosition();
    this.adjustBottomPosition();
    this.arrowPosition = 'left';
    this.autofixRightPosition();
  }

  private setStyleBottom(): void {
    this.stepsContainerService.updatePosition(this.step.name, 'bottom');
    this.topPosition =
      this.targetAbsoluteTop + this.targetHeight + DISTANCE_FROM_TARGET;
    this.stepAbsoluteTop =
      this.targetAbsoluteTop + this.targetHeight + DISTANCE_FROM_TARGET;
    this.arrowTopPosition = -this.arrowSize;

    this.arrowLeftPosition = this.stepWidth / 2 - this.arrowSize;
    this.leftPosition =
      this.targetWidth / 2 - this.stepWidth / 2 + this.targetAbsoluteLeft;
    this.stepAbsoluteLeft =
      this.targetWidth / 2 - this.stepWidth / 2 + this.targetAbsoluteLeft;
    this.adjustLeftPosition();
    this.adjustRightPosition();
    this.arrowPosition = 'top';
    this.autofixBottomPosition();
  }

  private setStyleLeft(): void {
    this.stepsContainerService.updatePosition(this.step.name, 'left');
    this.topPosition =
      this.targetAbsoluteTop +
      this.targetHeight / 2 -
      this.stepHeight / 2;
    this.stepAbsoluteTop =
      this.targetAbsoluteTop +
      this.targetHeight / 2 -
      this.stepHeight / 2;
    this.arrowTopPosition = this.stepHeight / 2 - this.arrowSize;

    this.leftPosition =
      this.targetAbsoluteLeft - this.stepWidth - DISTANCE_FROM_TARGET;
    this.stepAbsoluteLeft =
      this.targetAbsoluteLeft - this.stepWidth - DISTANCE_FROM_TARGET;
    this.arrowLeftPosition = this.stepWidth;
    this.adjustTopPosition();
    this.adjustBottomPosition();
    this.arrowPosition = 'right';
    this.autofixLeftPosition();
  }

  private setStyleCenter(): void {
    this.renderer.setStyle(
      this.stepWrapper.nativeElement,
      'position',
      'fixed'
    );
    this.renderer.setStyle(this.stepWrapper.nativeElement, 'top', '50%');
    this.renderer.setStyle(this.stepWrapper.nativeElement, 'left', '50%');

    this.updateStepDimensions();

    this.renderer.setStyle(
      this.stepWrapper.nativeElement,
      'transform',
      `translate(-${this.stepWidth / 2}px, -${this.stepHeight / 2}px)`
    );
    this.showArrow = false;
  }

  private adjustLeftPosition(): void {
    if (this.leftPosition < 0) {
      this.arrowLeftPosition =
        this.arrowLeftPosition +
        this.leftPosition -
        DEFAULT_DISTANCE_FROM_MARGIN_LEFT;
      this.leftPosition = DEFAULT_DISTANCE_FROM_MARGIN_LEFT;
    }
  }

  private adjustRightPosition(): void {
    let currentWindowWidth = document.body.clientWidth;
    if (this.stepAbsoluteLeft + this.stepWidth > currentWindowWidth) {
      let newLeftPos =
        this.leftPosition -
        (this.stepAbsoluteLeft +
          this.stepWidth +
          DEFAULT_DISTANCE_FROM_MARGIN_RIGHT -
          currentWindowWidth);
      let deltaLeftPosition = newLeftPos - this.leftPosition;

      this.leftPosition = newLeftPos;
      this.arrowLeftPosition = this.arrowLeftPosition - deltaLeftPosition;
    }
  }

  private adjustTopPosition(): void {
    if (this.stepAbsoluteTop < 0) {
      this.arrowTopPosition =
        this.arrowTopPosition +
        this.topPosition -
        DEFAULT_DISTANCE_FROM_MARGIN_TOP;
      this.topPosition = DEFAULT_DISTANCE_FROM_MARGIN_TOP;
    }
  }

  private adjustBottomPosition(): void {
    if (this.stepAbsoluteTop + this.stepHeight > this.documentHeight) {
      let newTopPos =
        this.topPosition -
        (this.stepAbsoluteTop +
          this.stepHeight +
          DEFAULT_DISTANCE_FROM_MARGIN_BOTTOM -
          this.documentHeight);
      let deltaTopPosition = newTopPos - this.topPosition;

      this.topPosition = newTopPos;
      this.arrowTopPosition = this.arrowTopPosition - deltaTopPosition;
    }
  }

  private autofixTopPosition(): void {
    if (this.targetAbsoluteTop - this.stepHeight - this.arrowSize < 0) {
      this.setStyleRight();
    }
  }

  private autofixRightPosition(): void {
    if (
      this.targetAbsoluteLeft +
      this.targetWidth +
      this.stepWidth +
      this.arrowSize >
      document.body.clientWidth
    ) {
      this.setStyleBottom();
    }
  }

  private autofixBottomPosition(): void {
    if (
      this.targetAbsoluteTop +
      this.stepHeight +
      this.arrowSize +
      this.targetHeight >
      this.documentHeight
    ) {
      this.setStyleLeft();
    }
  }

  private autofixLeftPosition(): void {
    if (this.targetAbsoluteLeft - this.stepWidth - this.arrowSize < 0) {
      this.setStyleTop();
    }
  }

  private subscribeToResizeEvents(): Subscription {
    return this.eventListenerService.resizeEvent.subscribe(() => {
      this.redrawStep();
    });
  }

  private redrawStep(): void {
    this.updateStepDimensions();
    this.drawStep();
  }

  private getDimensionsByAspectRatio(width: number, height: number, aspectRatio: number): {width: number, height: number} {
    let calcHeight = (width + height) / (1 + aspectRatio);
    let calcWidth = calcHeight * aspectRatio;
    return {
      width: calcWidth,
      height: calcHeight
    };
  }

  private adjustDimensions(width: number, height: number): {width: number, height: number} {
    let area = width * height;
    let newWidth = width;
    let newHeight = height;
    if (width > STEP_MAX_WIDTH) {
      newWidth = STEP_MAX_WIDTH;
      newHeight = area / newWidth;
    } else if (width < STEP_MIN_WIDTH) {
      newWidth = STEP_MIN_WIDTH;
      newHeight = STEP_MIN_WIDTH / ASPECT_RATIO;
    }
    return {
      width: newWidth,
      height: newHeight
    };
  }

  private updateStepDimensions(): void {
    this.stepWidth = this.stepContainer.nativeElement.clientWidth;
    this.stepHeight = this.stepContainer.nativeElement.clientHeight;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
