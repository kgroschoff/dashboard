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
import {Subject} from 'rxjs';

import {GuidedTourStep, Step, StepActionType} from '../../../shared/entity/guided-tour';
import {GuidedTourOptionsService} from './guided-tour-options.service';
import {GuidedTourItemsService} from './guided-tour-items.service';

@Injectable()
export class GuidedTourStepsContainerService {
  private steps: Step[];
  private tempSteps: GuidedTourStep[] = [];
  private currentStepIndex = -2;
  stepHasBeenModified: Subject<GuidedTourStep> = new Subject<GuidedTourStep>();

  constructor(private readonly stepOptions: GuidedTourOptionsService, private readonly guidedTourItemsService: GuidedTourItemsService) {}

  private getFirstStepIndex(): number {
    const firstStep = this.stepOptions.getFirstStep();
    const stepIds = this.stepOptions.getStepsOrder();

    let index = stepIds.indexOf(firstStep);
    if (index < 0) {
      index = 0;
    }

    return index;
  }

  init(): void {
    this.steps = [];
    this.currentStepIndex = this.getFirstStepIndex() - 1;
    let stepIds = this.stepOptions.getStepsOrder();
    stepIds.forEach(stepId => {
      const stepItem = this.guidedTourItemsService.getGuidedTourItems().find(item => item.id === stepId);
      const stepRoute = stepItem && stepItem.route ? stepItem.route : '';
      this.steps.push({ id: stepId, step: null, route: stepRoute})
    });
  }

  addStep(stepToAdd: GuidedTourStep): void {
    let stepExist = this.tempSteps.filter(step => step.name === stepToAdd.name).length > 0;
    if (!stepExist) {
      this.tempSteps.push(stepToAdd);
    } else {
      let stepIndexToReplace = this.tempSteps.findIndex(step => step.name === stepToAdd.name);
      this.tempSteps[stepIndexToReplace] = stepToAdd;
    }
  }

  get(action: StepActionType): GuidedTourStep {
    if (action === StepActionType.NEXT) {
      this.currentStepIndex++;
    } else {
      this.currentStepIndex--;
    }

    const stepName = this.getStepName(this.steps[this.currentStepIndex].id);
    const index = this.tempSteps.findIndex(step => step.name === stepName);
    let stepFound = this.tempSteps[index];
    this.steps[this.currentStepIndex].step = stepFound;

    return stepFound;
  }

  getStepRoute(action: StepActionType): string {
    if (action === StepActionType.NEXT) {
      return this.steps[this.currentStepIndex + 1] ? this.steps[this.currentStepIndex + 1].route : '';
    } else {
      return this.steps[this.currentStepIndex - 1] ? this.steps[this.currentStepIndex - 1].route : '';
    }
  }

  updatePosition(stepName: string, position: string): void {
    let index = this.getStepIndex(stepName);
    if (this.steps[index].step) {
      this.steps[index].step.position = position;
      this.stepHasBeenModified.next(this.steps[index].step);
    }
  }
  
  getStepNumber(stepName: string): number {
    return this.getStepIndex(stepName) + 1;
  }

  getStepsCount(): number {
    let stepsOrder = this.stepOptions.getStepsOrder();
    return stepsOrder.length;
  }

  private getStepIndex(stepName: string): number {
    const index = this.steps.map(step => step.id).findIndex(name => stepName === name);
    return index;
  }

  private getStepName(stepID: string): string {
    return stepID;
  }
}
