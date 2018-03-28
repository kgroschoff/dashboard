import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';

const appRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'wizard',
        loadChildren: './wizard/wizard.module#WizardModule',
      },
      {
        path: 'sshkeys',
        loadChildren: './sshkey/sshkey.module#SshkeyModule'
      },
      {
        path: 'clusters',
        loadChildren: './cluster/cluster.module#ClusterModule'
      },
      {
        path: '',
        loadChildren: './pages/pages.module#PagesModule'
      },
    ]
  },
  {
    path: '**',
    redirectTo: '404'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}


