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

import {Injectable, ComponentRef, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef} from '@angular/core';

import {GuidedTourStepComponent} from '../../../shared/components/guided-tour/step/step.component';
import {GuidedTourStep} from '../../../shared/entity/guided-tour';

@Injectable()
export class StepDrawerService {
  private refMap: {[key: string]: ComponentRef<GuidedTourStepComponent>} = {};

  constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  draw(step: GuidedTourStep): void {
    // 1. Create a component reference from the component
    const ref: ComponentRef<GuidedTourStepComponent> = this.componentFactoryResolver.resolveComponentFactory(GuidedTourStepComponent).create(this.injector);

    // 2. Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(ref.hostView);

    // 3. Get DOM element from component
    const domElem = (ref.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    // 4. Append DOM element to the body
    document.body.appendChild(domElem);

    const instance: GuidedTourStepComponent = ref.instance;
    instance.step = step;
    ref.changeDetectorRef.detectChanges();
    step.stepInstance = instance;

    this.refMap[step.name] = ref;
  }

  remove(step: GuidedTourStep): void {
    this.appRef.detachView(this.refMap[step.name].hostView);
    this.refMap[step.name].destroy();
  }
}
