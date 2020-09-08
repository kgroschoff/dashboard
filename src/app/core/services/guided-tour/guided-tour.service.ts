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

import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Observable, of} from 'rxjs';
import {finalize} from 'rxjs/operators';

import {GuidedTourOptions, GuidedTourStepInfo} from '../../../shared/entity/guided-tour';
import {GuidedTourStepService} from './guided-tour-step.service';
import {GuidedTourOptionsService} from './guided-tour-options.service';

@Injectable()
export class GuidedTourService {
  private tourInProgress: boolean = false;
  private tour$: Observable<GuidedTourStepInfo>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private readonly stepService: GuidedTourStepService, private readonly optionsService: GuidedTourOptionsService) {}

  startTour(): Observable<GuidedTourStepInfo> {
    const options: GuidedTourOptions = { 
      steps: this.getGuidedTourOrder(),
      showPrevButton: true,
      stepDefaultPosition: 'top',
      startWith: 'km-gt-start-tour'
    }

    if (!isPlatformBrowser(this.platformId)) {
      return of(new GuidedTourStepInfo());
    }
    if (!this.tourInProgress) {
      this.tourInProgress = true;
      if (options) {
        this.optionsService.setOptions(options);
      }
      this.tour$ = this.stepService.startTour().pipe(finalize(() => (this.tourInProgress = false)));
      this.tour$.subscribe();
    }
    return this.tour$;
  }

  closeTour(): void {
    if (this.isTourInProgress()) {
      this.stepService.close();
    }
  }

  isTourInProgress(): boolean {
    return this.tourInProgress;
  }

  getGuidedTourOrder(): string[] {
    return [
      'km-gt-start-tour',
      'km-gt-add-project-btn',
      'km-gt-add-project-dialog',
      'km-gt-project-item',
      'km-gt-project-dropdown',
      'km-gt-cluster-menu',
      'km-gt-sshkey-menu',
      'km-gt-members-menu',
      'km-gt-serviceaccount-menu',
      'km-gt-add-cluster-btn',
      'km-gt-wizard-step-provider',
      'km-gt-wizard-step-datacenter',
      'km-gt-wizard-step-cluster',
      'km-gt-wizard-step-settings',
      'km-gt-wizard-step-nodes',
      'km-gt-wizard-step-summary',
      'km-gt-cluster-list',
      'km-gt-cluster-details-connect',
      'km-gt-cluster-details-edit',
      'km-gt-cluster-details-events',
      'km-gt-cluster-details-machine-deployments',
      'km-gt-md-details-nodes',
      'km-gt-md-details-edit',
      'km-gt-md-details-back-to-cluster',
      'km-gt-help-menu'
    ];
  }
}
