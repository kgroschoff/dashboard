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

@Injectable()
export class DomRefService {
  private fakeDocument: Document = {body: {}, documentElement: {}} as Document;
  private fakeWindow: Window = {document: this.fakeDocument, navigator: {}} as Window;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  getNativeWindow(): Window {
    if (isPlatformBrowser(this.platformId)) return window;
    else return this.fakeWindow;
  }

  getNativeDocument(): Document {
    if (isPlatformBrowser(this.platformId)) return document;
    else return this.fakeDocument;
  }
}
