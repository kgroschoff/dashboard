import {by, element} from 'protractor';

import {NavPage} from '../shared/nav.po';

export class ProjectsPage extends NavPage {
  private _addProjectButton = by.id('km-add-project-top-btn');
  private _addProjectDialog = by.id('km-add-project-dialog');
  private _projectNameInput = by.id('km-add-project-dialog-input');
  private _saveProjectButton = by.id('km-add-project-dialog-save');
  private _deleteProjectDialog = by.id('km-delete-project-dialog');
  private _deleteProjectDialogInput = by.id('km-delete-project-dialog-input');
  private _deleteProjectDialogButton = by.id('km-delete-project-dialog-btn');
  private _editProjectDialogEditBtn= by.id('km-edit-project-dialog-edit-btn');
  private _editProjectDialogInput = by.id('km-edit-project-dialog-input');
  private _editProjectDialog = by.id('km-edit-project-dialog');

  navigateTo(): any {
    return this.getProjectsNavButton().click();
  }

  getAddProjectButton(): any {
    return element(this._addProjectButton);
  }

  getAddProjectDialog(): any {
    return element(this._addProjectDialog);
  }

  getProjectNameInput(): any {
    return element(this._projectNameInput);
  }

  getSaveProjectButton(): any {
    return element(this._saveProjectButton);
  }

  getProjectItem(projectName: string): any {
    return element(by.id(`km-project-name-${projectName}`));
  }

  getDeleteProjectButton(projectName: string): any {
    return element(by.id(`km-delete-project-${projectName}`));
  }

  getDeleteProjectDialog(): any {
    return element(this._deleteProjectDialog);
  }

  getDeleteProjectDialogInput(): any {
    return element(this._deleteProjectDialogInput);
  }

  getDeleteProjectDialogButton(): any {
    return element(this._deleteProjectDialogButton);
  }

  getProjectEditBtn(projectName: string): any {
    return element(by.id(`km-edit-project-${projectName}`));
  }

  getEditProjectDialogEditBtn(): any {
    return element(this._editProjectDialogEditBtn);
  }

  getEditProjectDialogInput(): any {
    return element(this._editProjectDialogInput);
  }

  getEditProjectDialog(): any {
    return element(this._editProjectDialog);
  }
}
