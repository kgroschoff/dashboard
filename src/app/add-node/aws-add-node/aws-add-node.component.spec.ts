import { InputValidationService } from 'app/core/services';
import { SharedModule } from '../../shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsAddNodeComponent } from './aws-add-node.component';
import { AddNodeFormComponent } from './../add-node-form/add-node-form.component';
import { NgReduxTestingModule } from '@angular-redux/store/lib/testing/ng-redux-testing.module';
import { MockNgRedux } from '@angular-redux/store/testing';
import { ReactiveFormsModule } from '@angular/forms';

const modules: any[] = [
  BrowserModule,
  BrowserAnimationsModule,
  SharedModule,
  ReactiveFormsModule,
  NgReduxTestingModule
];

function setMockNgRedux(nodeForm: any): void {
  const nodeFormStub = MockNgRedux.getSelectorStub(['wizard', 'nodeForm']);
  nodeFormStub.next(nodeForm);
}

function completeRedux() {
  const nodeFormStub = MockNgRedux.getSelectorStub(['wizard', 'nodeForm']);
  nodeFormStub.complete();
}

describe('AwsAddNodeComponent', () => {
  let fixture: ComponentFixture<AwsAddNodeComponent>;
  let component: AwsAddNodeComponent;

  beforeEach(() => {
    MockNgRedux.reset();
    TestBed.configureTestingModule({
      imports: [
        ...modules,
      ],
      declarations: [
        AwsAddNodeComponent,
        AddNodeFormComponent
      ],
      providers: [
        InputValidationService
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwsAddNodeComponent);
    component = fixture.componentInstance;
  });

  it('should create the add node cmp', () => {
    expect(component).toBeTruthy();
  });

  it('form valid after creating', () => {
    fixture.detectChanges();

    expect(component.awsNodeForm.valid).toBeTruthy();
  });

  it('node count field validity', () => {
    fixture.detectChanges();

    let errors = {};
    const name = component.awsNodeForm.controls['node_count'];
    errors = name.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['min']).toBeFalsy();

    name.setValue(0);
    errors = name.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['min']).toBeTruthy();

    name.setValue('');
    errors = name.errors || {};
    expect(errors['required']).toBeTruthy();
  });
});
