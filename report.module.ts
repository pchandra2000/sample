import { MaterialModule } from './../../app/shared/material.module';
import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { TemplateModule, TemplatePdfviewComponent } from '../../modules/template';
import { ReportRouteModule } from './report-route.module';
import { ReportsExpenseAllComponent } from './expense-all/expense-all.component';
import { ReportsExpenseEditComponent } from './expense-edit/expense-edit.component';
import { ReportsExpenseOneComponent } from './expense-one/expense-one.component';
import { ReportsIncomeAllComponent } from './income-all/income-all.component';
import { ReportsIncomeConfirmComponent } from './income-confirm/income-confirm.component';
import { ReportsIncomeEditComponent } from './income-edit/income-edit.component';
import { ReportsIncomeOneComponent } from './income-one/income-one.component';
import { ReportsReportComponent } from './report/report.component';
import { ReportEffects } from './shared/store/report.effects';
import { reportReducers } from './shared/store/report.reducers';
import {
  TranslateModule as NgxTranslateModule,
  TranslateLoader,
  TranslateStore
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportsIncomeCompleteComponent } from './income-complete/income-complete.component';
import { ReportsIncomeAllComponent2 } from './income-all/income-all.component2';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AlertModule } from 'src/app/shared/alert/alert.module';
import { MatPaginatorIntl } from '@angular/material';
import { MatPaginatorI18nService } from 'src/app/shared/paginator/frenchPaginator';
import { FileUploadPreviewComponent } from './income-edit/fileUploadPreview/file-upload-preview.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

/**
 * https://angular.io/api/core/NgModule
 */
@NgModule({
  imports: [
    EffectsModule.forFeature([ReportEffects]),
    StoreModule.forFeature('reports', reportReducers)
  ]
})
export class ReportRootModule {}

/**
 * https://angular.io/guide/styleguide#feature-modules
 */
@NgModule({
  imports: [
    TemplateModule,
    ReportRouteModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    MaterialModule,
    AlertModule,
    NgxTranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],

  declarations: [
    ReportsExpenseAllComponent,
    ReportsExpenseEditComponent,
    ReportsExpenseOneComponent,
    ReportsIncomeAllComponent,
    ReportsIncomeAllComponent2,
    ReportsIncomeCompleteComponent,
    ReportsIncomeConfirmComponent,
    ReportsIncomeEditComponent,
    ReportsIncomeOneComponent,
    ReportsReportComponent
  ],
  providers: [
    TranslateStore,
    {
      provide: MatPaginatorIntl,
      useClass: MatPaginatorI18nService
    }
  ],
  exports: []
})
export class ReportModule {
  /**
   * https://angular.io/guide/ngmodule#configure-core-services-with-coremoduleforroot
   */
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: ReportRootModule,
      providers: []
    };
  }
}
