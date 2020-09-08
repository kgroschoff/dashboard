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

import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {Subject} from 'rxjs';
import {DomRefService} from './dom.service';

export class Scroll {
  scrollX: number;
  scrollY: number;
}

@Injectable()
export class EventListenerService {
  private renderer: Renderer2;
  private scrollUnlisten: any;
  private resizeUnlisten: any;

  scrollEvent: Subject<Scroll> = new Subject<Scroll>();
  resizeEvent: Subject<number> = new Subject<number>();

  constructor(private readonly rendererFactory: RendererFactory2, private readonly DOMService: DomRefService) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  startListeningScrollEvents(): void {
    this.scrollUnlisten = this.renderer.listen('document', 'scroll', evt => {
      this.scrollEvent.next({
        scrollX: this.DOMService.getNativeWindow().pageXOffset,
        scrollY: this.DOMService.getNativeWindow().pageYOffset
      });
    });
  }

  startListeningResizeEvents(): void {
    this.resizeUnlisten = this.renderer.listen('window', 'resize', evt => {
      this.resizeEvent.next(evt);
    });
  }

  stopListeningScrollEvents(): void {
    this.scrollUnlisten();
  }

  stopListeningResizeEvents(): void {
    this.resizeUnlisten();
  }
}
