import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ClusterEntity } from '../../../../shared/entity/ClusterEntity';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WizardService, ApiService, Auth } from '../../../../core/services';
import { Subscription } from 'rxjs/Subscription';
import { OpenstackNetwork, OpenstackSubnet, OpenstackTenant, OpenstackSecurityGroup, OpenstackFloatingIpPool } from '../../../../shared/entity/provider/openstack/OpenstackSizeEntity';
import { AppConfigService } from '../../../../app-config.service';
import { Config } from '../../../../shared/model/Config';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'kubermatic-openstack-cluster-settings',
  templateUrl: './openstack.component.html',
  styleUrls: ['./openstack.component.scss']
})
export class OpenstackClusterSettingsComponent implements OnInit, OnDestroy {
  @Input() cluster: ClusterEntity;
  public tenants: OpenstackTenant[] = [];
  public subnetIds: OpenstackSubnet[] = [];
  public network: OpenstackNetwork[] = [];
  public floatingIpPool: OpenstackFloatingIpPool[] = [];
  public securityGroup: OpenstackSecurityGroup[] = [];
  public loadingSubnetIds = false;
  public loadingOptionalSettings = false;
  public openstackSettingsForm: FormGroup;
  public hideOptional = true;
  private subscriptions: Subscription[] = [];
  public config: Config;

  constructor(private wizardService: WizardService, private api: ApiService, private auth: Auth, private appConfigService: AppConfigService) { }

  ngOnInit() {
    this.config = this.appConfigService.getConfig();

    if (this.config.openstack && this.config.openstack.wizard_use_default_user && !this.cluster.spec.cloud.openstack.username) {
      this.cluster.spec.cloud.openstack.username = this.auth.getUsername();
    }

    this.openstackSettingsForm = new FormGroup({
      domain: new FormControl(this.cluster.spec.cloud.openstack.domain, [Validators.required]),
      tenant: new FormControl(this.cluster.spec.cloud.openstack.tenant, [Validators.required]),
      username: new FormControl(this.cluster.spec.cloud.openstack.username, [Validators.required]),
      password: new FormControl(this.cluster.spec.cloud.openstack.password, [Validators.required]),
      floatingIpPool: new FormControl(this.cluster.spec.cloud.openstack.floatingIpPool),
      securityGroups: new FormControl(this.cluster.spec.cloud.openstack.securityGroups),
      network: new FormControl(this.cluster.spec.cloud.openstack.network),
      subnetId: new FormControl(this.cluster.spec.cloud.openstack.subnetID),
    });

    this.loadOptionalSettings();


    this.subscriptions.push(this.openstackSettingsForm.valueChanges.pipe(debounceTime(1000)).subscribe(data => {
      this.loadOptionalSettings();

      this.wizardService.changeClusterProviderSettings({
        cloudSpec: {
          openstack: {
            tenant: this.openstackSettingsForm.controls.tenant.value,
            domain: this.openstackSettingsForm.controls.domain.value,
            username: this.openstackSettingsForm.controls.username.value,
            password: this.openstackSettingsForm.controls.password.value,
            floatingIpPool: this.openstackSettingsForm.controls.floatingIpPool.value,
            securityGroups: this.openstackSettingsForm.controls.securityGroups.value,
            network: this.openstackSettingsForm.controls.network.value,
            subnetID: this.openstackSettingsForm.controls.subnetId.value
          },
          dc: this.cluster.spec.cloud.dc,
        },
        valid: this.openstackSettingsForm.valid,
      });
    }));

    this.subscriptions.push(this.wizardService.clusterSettingsFormViewChanged$.subscribe(data => {
      this.hideOptional = data.hideOptional;
    }));

    this.subscriptions.push(this.openstackSettingsForm.controls.network.valueChanges.subscribe(data => {
      this.loadSubnetIds();
    }));
  }

  public loadOptionalSettings() {
    if (
      this.openstackSettingsForm.controls.username.value === '' ||
      this.openstackSettingsForm.controls.password.value === '' ||
      this.openstackSettingsForm.controls.domain.value === '' ||
      this.tenants.length > 0 ||
      this.network.length > 0 ||
      this.securityGroup.length > 0 ) {
        return;
    }

    this.loadingOptionalSettings = true;
    this.subscriptions.push(this.api.getOpenStackTenants(this.openstackSettingsForm.controls.username.value, this.openstackSettingsForm.controls.password.value, this.openstackSettingsForm.controls.domain.value, this.cluster.spec.cloud.dc).subscribe(
      tenants => {
        const sortedTenants = tenants.sort((a, b) => {
          return (a.name < b.name ? -1 : 1) * ('asc' ? 1 : -1);
        });

        this.tenants = sortedTenants;
        if (sortedTenants.length > 0 && this.openstackSettingsForm.controls.tenant.value !== '0') {
          this.openstackSettingsForm.controls.tenant.setValue(this.cluster.spec.cloud.openstack.tenant);
        }
      }));

    this.subscriptions.push(this.api.getOpenStackNetwork(this.openstackSettingsForm.controls.username.value, this.openstackSettingsForm.controls.password.value, this.openstackSettingsForm.controls.domain.value, this.cluster.spec.cloud.dc).subscribe(
      network => {
        const sortedNetwork = network.sort((a, b) => {
          return (a.name < b.name ? -1 : 1) * ('asc' ? 1 : -1);
        });

        this.network = sortedNetwork;
        this.floatingIpPool = this.network.filter(floatingIpPool => floatingIpPool.external === true);

        if (this.network.length > 0 && this.openstackSettingsForm.controls.network.value !== '0') {
          this.openstackSettingsForm.controls.network.setValue(this.cluster.spec.cloud.openstack.network);
        }

        if (this.floatingIpPool.length > 0 && this.openstackSettingsForm.controls.floatingIpPool.value !== '0') {
          this.openstackSettingsForm.controls.floatingIpPool.setValue(this.cluster.spec.cloud.openstack.floatingIpPool);
        }

      }));

    this.subscriptions.push(this.api.getOpenStackSecurityGroups(this.openstackSettingsForm.controls.username.value, this.openstackSettingsForm.controls.password.value, this.openstackSettingsForm.controls.domain.value, this.cluster.spec.cloud.dc).subscribe(
      securityGroups => {
        const sortedSecurityGroups = securityGroups.sort((a, b) => {
          return (a.name < b.name ? -1 : 1) * ('asc' ? 1 : -1);
        });

        this.securityGroup = sortedSecurityGroups;

        if (sortedSecurityGroups.length > 0 && this.openstackSettingsForm.controls.securityGroups.value !== '0') {
          this.openstackSettingsForm.controls.securityGroups.setValue(this.cluster.spec.cloud.openstack.network);
        }

        this.loadingOptionalSettings = false;
      }));
  }

  public loadSubnetIds() {
    if (
      this.openstackSettingsForm.controls.network.value === '' ||
      this.subnetIds.length > 0) {
      return;
    }

    this.loadingSubnetIds = true;

    this.subscriptions.push(this.api.getOpenStackSubnetIds(this.openstackSettingsForm.controls.username.value, this.openstackSettingsForm.controls.password.value, this.openstackSettingsForm.controls.domain.value, this.cluster.spec.cloud.dc, this.openstackSettingsForm.controls.network.value).subscribe(
      subnets => {
        const sortedSubnetIds = subnets.sort((a, b) => {
          return (a.name < b.name ? -1 : 1) * ('asc' ? 1 : -1);
        });

        this.subnetIds = sortedSubnetIds;
        if (sortedSubnetIds.length > 0 && this.openstackSettingsForm.controls.subnetId.value !== '0') {
          this.openstackSettingsForm.controls.subnetId.setValue(this.cluster.spec.cloud.openstack.subnetID);
        }

        this.loadingSubnetIds = false;
      }));
  }

  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      if (sub) {
        sub.unsubscribe();
      }
    }
  }
}