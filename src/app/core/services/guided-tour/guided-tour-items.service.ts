import {Injectable} from '@angular/core';
import {GuidedTourItem} from '../../../shared/entity/guided-tour';
import {Project} from '../../../shared/entity/project';
import {Cluster, ClusterType, MasterVersion} from '../../../shared/entity/cluster';
import {Node} from '../../../shared/entity/node';
import {MachineDeployment} from '../../../shared/entity/machine-deployment';
import {CreateClusterModel} from '../../../shared/model/CreateClusterModel';
import {DigitaloceanSizes} from '../../../shared/entity/provider/digitalocean';
import {Health} from '../../../shared/entity/health';

@Injectable()
export class GuidedTourItemsService {
  getGuidedTourItems(): GuidedTourItem[] {
    return [
      {
        id: 'km-gt-start-tour',
        route: 'projects', 
        title: 'Getting Started', 
        text: 'For the purposes of the guided tour we will pre-fill textboxes for you and show you sample content. No projects, clusters or nodes will be created. You can cancel or revisit the tour at any time.',
      },
      {
        id: 'km-gt-add-project-btn', 
        route: 'projects',
        title: 'Get started by adding a project', 
        text: 'A project groups your clusters together for ease of management.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-add-project-dialog', 
        route: 'projects',
        title: 'Your first project', 
        text: 'Select a name to describe your project. Add labels you want to be inherited to every cluster and node inside the project or leave them blank. These settings can be edited later.',
        stepPosition: 'right',
      },
      {
        id: 'km-gt-project-item',
        route: 'projects', 
        title: 'Project created', 
        text: 'Click on the project. We will start creating clusters shortly.',
        stepPosition: 'right',
      },
      {
        id: 'km-gt-project-dropdown', 
        route: 'projects/123ab4cd5e/clusters', 
        title: 'Project Dropdown', 
        text: 'Switch to a different project on the fly.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-cluster-menu', 
        route: 'projects/123ab4cd5e/clusters', 
        title: 'Cluster Overview', 
        text: 'View all the clusters of the project.',
        stepPosition: 'right',
      },
      {
        id: 'km-gt-sshkey-menu', 
        route: 'projects/123ab4cd5e/clusters', 
        title: 'SSH keys', 
        text: 'Manage the SSH keys of the project.',
        stepPosition: 'right',
      },
      {
        id: 'km-gt-members-menu', 
        route: 'projects/123ab4cd5e/clusters', 
        title: 'Members', 
        text: 'Add admins, editors or viewers.',
        stepPosition: 'right',
      },
      {
        id: 'km-gt-serviceaccount-menu', 
        route: 'projects/123ab4cd5e/clusters', 
        title: 'Service Accounts', 
        text: 'Manage the service accounts of the project.',
        stepPosition: 'right',
      },
      {
        id: 'km-gt-add-cluster-btn', 
        route: 'projects/123ab4cd5e/clusters', 
        title: 'Create a Cluster', 
        text: 'It\'s time to create your first cluster.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-wizard-step-provider',
        route: 'projects/123ab4cd5e/wizard', 
        title: 'Pick a Provider', 
        text: 'Your nodes will be created by the selected provider, after adding credentials later.',
        stepPosition: 'top',
      },
      {
        id: 'km-gt-wizard-step-datacenter', 
        route: 'projects/123ab4cd5e/wizard', 
        title: 'Pick a Datacenter', 
        text: 'Available datacenters are influenced by the provider you picked.',
        stepPosition: 'top',
      },
      {
        id: 'km-gt-wizard-step-cluster', 
        route: 'projects/123ab4cd5e/wizard', 
        title: 'Specify Cluster Details', 
        text: 'Set the name, system and version. Activate Audit Logging, Admission Plugins or add labels to be added to the cluster, it\'s machine deployments and it\'s nodes.',
        stepPosition: 'top',
      },
      {
        id: 'km-gt-wizard-step-settings', 
        route: 'projects/123ab4cd5e/wizard', 
        title: 'Detailed Provider Settings', 
        text: 'Enter your credentials or pick a predefined preset.',
        stepPosition: 'top',
      },
      {
        id: 'km-gt-wizard-step-nodes', 
        route: 'projects/123ab4cd5e/wizard', 
        title: 'Detailed Node Settings', 
        text: 'Don\'t be overwhelmed! Put in only what\'s needed or set every detail. Your choice.',
        stepPosition: 'top',
      },
      {
        id: 'km-gt-wizard-step-summary', 
        route: 'projects/123ab4cd5e/wizard', 
        title: 'At a Glance', 
        text: 'A final overview of the settings you picked. Confirm by clicking \'Create\'.',
        stepPosition: 'top',
      },
      {
        id: 'km-gt-cluster-list', 
        route: 'projects/123ab4cd5e/clusters', 
        title: 'Up and Running', 
        text: 'Click on your cluster to get a more detailed overview.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-cluster-details-connect', 
        route: 'projects/123ab4cd5e/dc/europe-west3-c/clusters/4k6txp5sq', 
        title: 'Time to Connect', 
        text: 'To connect directly to the cluster, download the kubeconfig file.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-cluster-details-edit', 
        route: 'projects/123ab4cd5e/dc/europe-west3-c/clusters/4k6txp5sq', 
        title: 'Edit your Cluster', 
        text: 'Change settings, add SSH keys and revoke tokens with this dropdown.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-cluster-details-events', 
        route: 'projects/123ab4cd5e/dc/europe-west3-c/clusters/4k6txp5sq', 
        title: 'How Eventful', 
        text: 'The events of the machine deployments will be shown here. To avoid clutter we clear this list on every login.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-cluster-details-machine-deployments', 
        route: 'projects/123ab4cd5e/dc/europe-west3-c/clusters/4k6txp5sq', 
        title: 'Even More Data', 
        text: 'Click on the machine deployment to view the details of the underlying nodes.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-md-details-nodes', 
        route: 'projects/123ab4cd5e/dc/europe-west3-c/clusters/4k6txp5sq/md/first-machine-deployment', 
        title: 'The Last Layer', 
        text: 'Your machine deployment has a lot of information to discover too. To see even more, you can unfold a single node and check it\'s settings.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-md-details-edit', 
        route: 'projects/123ab4cd5e/dc/europe-west3-c/clusters/4k6txp5sq/md/first-machine-deployment', 
        title: 'Change the Settings', 
        text: 'You can edit machine deployment settings here. AAfter saving the changes, your old nodes will be replaced with nodes that use the updated settings.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-md-details-back-to-cluster', 
        route: 'projects/123ab4cd5e/dc/europe-west3-c/clusters/4k6txp5sq/md/first-machine-deployment', 
        title: 'A Step Back', 
        text: 'Go back to the cluster detail view here. To go back to the cluster overview or your projects, use the sidebar.',
        stepPosition: 'bottom',
      },
      {
        id: 'km-gt-help-menu', 
        title: 'You\'re All Set!', 
        text: 'You can revisit the tour here. You can also find a link to the Docs, an FAQ and our support in this menu.',
        stepPosition: 'bottom',
      }
    ]
  }

  guidedTourProject(): Project {
    return {
      creationTimestamp: new Date(),
      id: '123ab4cd5e',
      name: 'My first project',
      status: 'Active',
      owners: [{
        creationTimestamp: new Date(),
        name: 'John Doe',
        email: 'john.doe@example.com',
      }],
      clustersNumber: 0,
    }
  }

  guidedTourDOCluster(): Cluster {
    return {
      creationTimestamp: new Date(),
      id: '4k6txp5sq',
      name: 'my-first-cluster',
      spec: {
        cloud: {
          dc: 'do-fra1',
          digitalocean: {
            token: 'token',
          },
        },
        version: '1.18.8',
      },
      status: {
        url: 'https://4k6txp5sq.europe-west3-c.dev.kubermatic.io:30002',
        version: '1.18.8',
      },
      type: ClusterType.Kubernetes,
    }
  }

  guidedTourCreateCluster(): CreateClusterModel {
    return {
      cluster: {
        name: 'my-first-cluster',
        labels: [],
        spec: {
          cloud: {
            dc: 'do-fra1',
            digitalocean: {
              token: 'this-is-a-fake-token',
            },
          },
          version: '1.18.8',
        },
        type: ClusterType.Kubernetes,
        credential: '',
      },
      nodeDeployment: {
        name: 'first-machine-deployment',
        spec: {
          template: {
            cloud: {
              digitalocean: {
                size: 's-1vcpu-1gb',
                backups: null,
                ipv6: null,
                monitoring: null,
                tags: null,
              },
            },
            operatingSystem: {
              ubuntu: {
                distUpgradeOnBoot: false,
              },
            },
            versions: {
              kubelet: null,
            },
          },
          replicas: 1,
          dynamicConfig: false,
        },
      },
    };
  }

  guidedTourDOCreateNode(): Node {
    return {
      spec: {
        cloud: {
          digitalocean: {
            size: 's-1vcpu-1gb',
            backups: null,
            ipv6: null,
            monitoring: null,
            tags: null,
          },
        },
        operatingSystem: {
          ubuntu: {
            distUpgradeOnBoot: false,
          },
        },
        versions: {
          kubelet: null,
        },
      },
    };
  }

  guidedTourDOMachineDeployment(): MachineDeployment {
    return {
      id: 'first-machine-deployment',
      name: 'first-machine-deployment',
      creationTimestamp: new Date(),
      spec: {
        replicas: 1,
        template: {
          cloud: {
            digitalocean: {
              size: 's-1vcpu-1gb',
              backups: false,
              ipv6: false,
              monitoring: false,
              tags: ['kubernetes', 'kubernetes-cluster-4k6txp5sq', 'system-cluster-4k6txp5sq', 'system-project-123ab4cd5e']
            }
          },
          operatingSystem: {
            ubuntu: {
              distUpgradeOnBoot: false
            }
          },
          versions: {
            kubelet: '1.18.8'
          },
          labels: {'system/cluster':'4k6txp5sq', 'system/project':'123ab4cd5e'}
        },
        paused: false,
        dynamicConfig: false
      },
      status: {
        observedGeneration: 1,
        replicas: 1,
        updatedReplicas: 1,
        unavailableReplicas: 1
      }
    }
  }

  guidedTourDONodes(): Node[] {
    return [{
      id: 'first-machine-deployment-66cffc58bc-ggjth',
      name: 'first-machine-deployment-66cffc58bc-ggjth',
      creationTimestamp: new Date(),
      spec: {
        cloud: {
          digitalocean: {
            size: 's-1vcpu-1gb',
            backups: false,
            ipv6: false,
            monitoring: false,
            tags: ['kubernetes', 'kubernetes-cluster-4k6txp5sq', 'system-cluster-4k6txp5sq', 'system-project-123ab4cd5e']
          }
        },
        operatingSystem: {
          ubuntu: {
            distUpgradeOnBoot: false
          }
        },
        sshUserName: 'root',
        versions: {
          kubelet: '1.18.8'
        }
      },
      status: {
        machineName: 'first-machine-deployment-66cffc58bc-ggjth',
        capacity: {
          cpu: '1',
          memory: '1008832Ki'
        },
        allocatable: {
          cpu: '800m',
          memory: '701632Ki'
        },
        addresses: [
          {'type': 'InternalIP', 'address': '165.232.66.101'},
          {'type': 'Hostname', 'address': 'first-machine-deployment-66cffc58bc-ggjth'}
        ],
        nodeInfo: {
          kernelVersion: '4.15.0-112-generic',
          containerRuntimeVersion: 'docker://18.9.9',
          kubeletVersion: 'v1.18.8',
          operatingSystem: 'linux',
          architecture: 'amd64'
        }
      }
    }]
  }

  guidedTourDOSizes(): DigitaloceanSizes {
    return {
      optimized: [],
      standard: [{
        available: true,
        disk: 25,
        memory: 1024,
        price_hourly: 0.00744,
        price_monthly: 5,
        regions: ['ams2', 'ams3', 'blr1', 'fra1', 'lon1', 'nyc1', 'nyc2', 'nyc3', 'sfo1', 'sfo2', 'sfo3', 'sgp1'],
        slug: 's-1vcpu-1gb',
        transfer: 1,
        vcpus: 1
      }]
    }
  }

  guidedTourVersions(): MasterVersion[] {
    return [
      {version:"1.16.13"},
      {version:"1.16.14"},
      {version:"1.18.8"},
      {version:"1.17.11"},
      {version:"1.18.6"},
      {version:"1.18.8", default:true},
      {version:"1.19.0"}
    ]
  }

  guidedTourHealth(): Health {
    return {
      apiserver: 1,
      scheduler: 1,
      controller: 1,
      machineController: 1,
      etcd: 1,
      cloudProviderInfrastructure: 1,
      userClusterControllerManager: 1
    }
  }
}
