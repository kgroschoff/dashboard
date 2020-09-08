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

import {GuidedTourOptions} from '../../../shared/entity/guided-tour';

export const DEFAULT_THEME_COLOR = '#3b5560';
export const STEP_DEFAULT_POSITION = 'bottom';
export const DEFAULT_TIMEOUT_BETWEEN_STEPS = 1;

@Injectable()
export class GuidedTourOptionsService {
  private stepDefaultPosition: string = STEP_DEFAULT_POSITION;
  private showPrevButton = true;
  private stepsOrder: string[] = [];
  private firstStep: string;
  private waitingTime: number;

  setOptions(options: GuidedTourOptions): void {
    this.stepsOrder = options.steps;
    this.stepDefaultPosition = options.stepDefaultPosition
        ? options.stepDefaultPosition
        : this.stepDefaultPosition;
    this.showPrevButton =
        typeof options.showPrevButton !== 'undefined'
            ? options.showPrevButton
            : this.showPrevButton;
    this.firstStep = options.startWith;
    this.waitingTime = typeof options.waitingTime !== 'undefined' ? options.waitingTime : DEFAULT_TIMEOUT_BETWEEN_STEPS;
  }

  getStepDefaultPosition(): string {
    return this.stepDefaultPosition;
  }

  getStepsOrder(): string[] {
    return this.stepsOrder;
  }

  getFirstStep(): string {
    return this.firstStep;
  }

  getWaitingTime() {
    return this.waitingTime;
  }

  isPrevButtonVisible(): boolean {
    return this.showPrevButton;
  }
}
