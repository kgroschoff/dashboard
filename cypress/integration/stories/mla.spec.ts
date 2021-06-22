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

import {ClustersPage} from '../../pages/clusters.po';
import {ProjectsPage} from '../../pages/projects.po';
import {WizardPage} from '../../pages/wizard.po';
import {login, logout} from '../../utils/auth';
import {Condition} from '../../utils/condition';
import {Endpoint} from '../../utils/endpoint';
import {RequestType, Response, ResponseType, TrafficMonitor} from '../../utils/monitor';
import {Preset} from '../../utils/preset';
import {Datacenter, Provider} from '../../utils/provider';
import {View} from '../../utils/view';
import {WizardStep} from '../../utils/wizard';
import * as _ from 'lodash';

describe('MLA Story', () => {
  const email = Cypress.env('KUBERMATIC_DEX_DEV_E2E_USERNAME');
  const password = Cypress.env('KUBERMATIC_DEX_DEV_E2E_PASSWORD');
  const projectName = _.uniqueId('e2e-test-project-');
  const clusterName = _.uniqueId('e2e-test-cluster-');
  const initialMachineDeploymentName = _.uniqueId('e2e-test-md-');
  const initialMachineDeploymentReplicas = '1';

  it('should login', () => {
    login(email, password);
    cy.url().should(Condition.Include, View.Projects);
  });

  it('should create a new project', () => {
    ProjectsPage.addProject(projectName);
  });

  it('should select project', () => {
    ProjectsPage.selectProject(projectName);
  });

  it('should go to wizard', () => {
    ClustersPage.openWizard();
  });

  it('should create a new cluster with mla logging + mla monitoring enabled', () => {
    WizardPage.getProviderBtn(Provider.Digitalocean).click();
    WizardPage.getDatacenterBtn(Datacenter.Digitalocean.Frankfurt).click();
    WizardPage.getClusterNameInput().type(clusterName).should(Condition.HaveValue, clusterName);

    cy.intercept('GET', Endpoint.SeedSettings).as('seedSettings')
    cy.wait('@seedSettings').its('response').should(Condition.Contain, {'user_cluster_mla_enabled': true})

    WizardPage.getMLALoggingCheckbox().should(Condition.Exist);
    WizardPage.getMLALoggingCheckbox().find('input').click({force: true});
    WizardPage.getMLALoggingCheckbox().find('input').should(Condition.BeChecked);
    WizardPage.getMLAMonitoringCheckbox().should(Condition.Exist);
    WizardPage.getMLAMonitoringCheckbox().find('input').click({force: true});
    WizardPage.getMLAMonitoringCheckbox().find('input').should(Condition.BeChecked);
    WizardPage.getNextBtn(WizardStep.Cluster).click({force: true});
    WizardPage.getCustomPresetsCombobox().click();
    WizardPage.getPreset(Preset.Digitalocean).click();
    WizardPage.getNextBtn(WizardStep.ProviderSettings).click({force: true});
    WizardPage.getNodeNameInput()
      .type(initialMachineDeploymentName)
      .should(Condition.HaveValue, initialMachineDeploymentName);
    WizardPage.getNodeCountInput()
      .clear()
      .type(initialMachineDeploymentReplicas)
      .should(Condition.HaveValue, initialMachineDeploymentReplicas);
    WizardPage.getNextBtn(WizardStep.NodeSettings).should(Condition.BeEnabled).click({force: true});
    WizardPage.getCreateBtn().click({force: true});

    cy.url().should(Condition.Contain, View.Clusters);
  });

  it('should check if cluster was created', () => {
    ClustersPage.visit();
    ClustersPage.getTable().should(Condition.Contain, clusterName);
  });

  it('should go to cluster details page', () => {
    ClustersPage.getClusterItem(clusterName).click();
  });

  it('should verify that mla logging is enabled', () => {
    ClustersPage.getMLALoggingInfoElement().find('i').should(Condition.HaveClass, 'km-icon-running');
  });

  it('should verify that mla monitoring is enabled', () => {
    ClustersPage.getMLAMonitoringInfoElement().find('i').should(Condition.HaveClass, 'km-icon-running');
  });

  it('should verify that mla alertmanager tab is visible', () => {
    ClustersPage.getTabCard('MLA Alertmanager Config').should(Condition.Exist);
  });

  it('should delete created cluster', () => {
    ClustersPage.deleteCluster(clusterName);
  });

  it('should verify that there are no clusters', () => {
    ClustersPage.verifyNoClusters();
  });

  it('should go to the projects page', () => {
    ProjectsPage.visit();
  });

  it('should delete the project', () => {
    ProjectsPage.deleteProject(projectName);
  });

  it('should logout', () => {
    logout();
  });
});
