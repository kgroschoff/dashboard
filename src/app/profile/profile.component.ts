import { Component, OnInit } from "@angular/core";
import {ApiService} from "../api/api.service";
import {SSHKeyEntity} from "../api/entitiy/SSHKeyEntity";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {Store} from "@ngrx/store";
import * as fromRoot from "../reducers/index";
import {Actions} from "../reducers/actions";
import {NotificationToastType, NotificationToast} from "../reducers/notification";
import {NotificationComponent} from "../notification/notification.component";

@Component({
  selector: "kubermatic-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {

  public sshKeys: Array<SSHKeyEntity> = [];
  public addSSHKeyForm: FormGroup;

  constructor(private api: ApiService, private formBuilder: FormBuilder, private store: Store<fromRoot.State>) { }

  ngOnInit() {
    this.refreshSSHKeys();

    this.addSSHKeyForm = this.formBuilder.group({
      name: ["", [<any>Validators.required, Validators.pattern("[\w\d-]+")]],
      key: ["", [<any>Validators.required]],
    });
  }

  private refreshSSHKeys() {
    this.api.getSSHKeys().subscribe(result => {
      this.sshKeys = result;
    });
  }

  public deleteSSHKey(name): void {
    let index = -1;

    this.sshKeys.forEach((key, i) => {
      if (key.name === name) {
        index = i;
      }
    });

    if (index > -1) {
      this.api.deleteSSHKey(name)
        .subscribe(result => {
            this.sshKeys.splice(index, 1);
            NotificationComponent.success(this.store, "Success", `SSH key ${name} deleted.`);
          },
          error => {
            NotificationComponent.error(this.store, "Error",  `SSH key ${name} could not be deleted. Error: ${error}`);
          });
    } else {
      NotificationComponent.error(this.store, "Error", `Error deleting SSH key ${name}. Please try again.`);
    }
  }

  public addSSHKey(): void {
    const name = this.addSSHKeyForm.controls["name"].value;
    const key = this.addSSHKeyForm.controls["key"].value;

    this.api.addSSHKey(new SSHKeyEntity(name, null, key))
      .subscribe(result => {
          NotificationComponent.success(this.store, "Success", `SSH key ${name} added successfully`);

          this.addSSHKeyForm.reset();
          this.sshKeys.push(result);
        },
        error => {
          NotificationComponent.error(this.store, "Error", `${error.status} ${error.statusText}`);
        });
  }

  public onNewKeyTextChanged() {
    const name = this.addSSHKeyForm.controls["name"].value;
    const key = this.addSSHKeyForm.controls["key"].value;
    const keyName = key.match(/^\S+ \S+ (.+)\n?$/);

    if (keyName && keyName.length > 1 && "" === name) {
      this.addSSHKeyForm.patchValue({name: keyName[1]});
    }
  }
}
