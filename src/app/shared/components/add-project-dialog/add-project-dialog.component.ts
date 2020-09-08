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

import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';

import {ApiService, NotificationService} from '../../../core/services';
import {CreateProjectModel} from '../../model/CreateProjectModel';
import {AsyncValidators} from '../../validators/async-label-form.validator';
import {ResourceType} from '../../entity/common';
import {GuidedTourService, GuidedTourItemsService} from '../../../core/services/guided-tour';

@Component({
  selector: 'km-add-project-dialog',
  templateUrl: './add-project-dialog.component.html',
  styleUrls: ['./add-project-dialog.component.scss'],
})
export class AddProjectDialogComponent implements OnInit {
  form: FormGroup;
  labels: object;
  asyncLabelValidators = [AsyncValidators.RestrictedLabelKeyName(ResourceType.Project)];

  constructor(
    private readonly _apiService: ApiService,
    private readonly _matDialogRef: MatDialogRef<AddProjectDialogComponent>,
    private readonly _notificationService: NotificationService,
    private readonly _guidedTourService: GuidedTourService,
    private readonly _guidedTourItemsService: GuidedTourItemsService,
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      labels: new FormControl(''),
    });

    if (!!this._guidedTourService.isTourInProgress()) {
      this.form.controls.name.setValue(this._guidedTourItemsService.guidedTourProject().name);
    }
  }

  addProject(): void {
    if (!!this._guidedTourService.isTourInProgress()) {
      return this._matDialogRef.close();
    }

    const createProject: CreateProjectModel = {
      name: this.form.controls.name.value,
      labels: this.labels,
    };
    this._apiService.createProject(createProject).subscribe(res => {
      this._matDialogRef.close(res);
      this._notificationService.success(`The <strong>${createProject.name}</strong> project was added`);
    });
  }

  closeDialog(): void {
    this._matDialogRef.close();
  }
}
