import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';

import { AuthGuard } from '../auth';
import { PermissionsGuard } from '../auth/shared/guard/permissions.guard';
import { ReportsExpenseAllComponent } from './expense-all/expense-all.component';
import { ReportsExpenseEditComponent } from './expense-edit/expense-edit.component';
import { ReportsExpenseOneComponent } from './expense-one/expense-one.component';
import { ReportsIncomeAllComponent } from './income-all/income-all.component';
import { ReportsIncomeCompleteComponent } from './income-complete/income-complete.component';
import { ReportsIncomeConfirmComponent } from './income-confirm/income-confirm.component';
import { ReportsIncomeEditComponent } from './income-edit/income-edit.component';
import { ReportsIncomeOneComponent } from './income-one/income-one.component';
import { ReportsReportComponent } from './report/report.component';
import { ReportsIncomeAllComponent2 } from './income-all/income-all.component2';
import { FileUploadPreviewComponent } from './income-edit/fileUploadPreview/file-upload-preview.component';

/**
 * https://angular.io/api/router/Routes
 */
const route: Routes = [{
  path: '',
  component: ReportsReportComponent,
  canActivate: [ AuthGuard ],
  children: [
    { path: '',             redirectTo: 'income',                       pathMatch: 'full' },
    { path: 'expense',      children: [
      { path: '',             component: ReportsExpenseAllComponent,      data: { key: 'reports.expense.all' },   canActivate: [ AuthGuard ], pathMatch: 'full' },
      { path: 'edit',         component: ReportsExpenseEditComponent,     data: { key: 'reports.expense.edit' },  canActivate: [ AuthGuard ]                    },
      { path: 'one/:id',      component: ReportsExpenseOneComponent,      data: { key: 'reports.expense.one' },   canActivate: [ AuthGuard ]                    },
      { path: '**',           redirectTo: ''                                                                            },
    ]},
    { path: 'income',       children: [
      { path: '',             component: ReportsIncomeAllComponent2,       data: { key: 'reports.income.all' },      canActivate: [ AuthGuard, PermissionsGuard ], pathMatch: 'full' },
      { path: 'complete',     component: ReportsIncomeCompleteComponent,  data: { key: 'reports.income.complete' }, canActivate: [ AuthGuard ]                    },

      { path: 'confirm',      component: ReportsIncomeConfirmComponent,   data: { key: 'reports.income.confirm'  },  canActivate: [ AuthGuard, PermissionsGuard ]                    },
      { path: 'edit',         component: ReportsIncomeEditComponent,      data: { key: 'reports.income.edit' },     canActivate: [ AuthGuard, PermissionsGuard ]                    },
      { path: 'one/:id',      component: ReportsIncomeOneComponent,       data: { key: 'reports.income.one' },      canActivate: [ AuthGuard, PermissionsGuard ]                    },
      { path: '**',           redirectTo: ''                                                                            },
    ]},
    { path: '**',           redirectTo: 'income' },
  ],
}];

/**
 * https://angular.io/guide/router#milestone-2-routing-module
 */
@NgModule
({
  imports: [ RouterModule.forChild(route) ],
  exports: [],
})
export class ReportRouteModule {
}
