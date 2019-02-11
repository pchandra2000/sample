import { TableRow } from './../../../modules/table/shared/types/row/table.row';
import { TableCell } from './../../../modules/table/shared/types/cell/table.cell';
import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { map ,  takeUntil } from 'rxjs/operators';

import { TableClick, TableControl } from '../../../modules/table';
import { TableSchemas } from '../../../modules/table';
import { TemplateContainerComponent } from '../../../modules/template';
import { ReportIncomeAllComplete } from '../shared/store/report.actions';
import { ReportIncomeAllStart } from '../shared/store/report.actions';
import { TableBuild } from './table.helpers';

/**
 * https://angular.io/api/core/Component
 */
@Component({
  selector: 'reports-income-all',
  encapsulation: ViewEncapsulation.Emulated,
  styles: [ `` ],
  template: `
    <template-basic
      *ngIf='( this.translations$ | async ) as translations'
      [event]='( this.event$ | async )'
      [loads]='( this.loader$ | async )'
      [modules]='( this.modules$ | async )'
      [breadcrumbs]='( this.key$ | async )'
      [title]='translations.title'
      [divider]='true'
      >
      <!--
      <div
        class='template-menus mat-actions'
        >
        <nav
          mat-tab-nav-bar
          [attr.aria-label]='translations.tabs.title'
          role='navigation'
          >
          <a
            *ngFor="let link of translations.links"
            mat-tab-link
            [routerLink]="link.url"
            [routerLinkActive] #rla="routerLinkActive"
            [active]="rla.isActive"
            >
            {{ link.title }}
          </a>
        </nav>
      </div>
      -->
      <div class='template-content-loads' >
        <h2 class='title2' >
          {{ translations.subtitle }}
        </h2>
        <p
          class='description'
          >
          {{ translations.info }}
        </p>
        <a
          mat-raised-button
          [routerLink]='[ "./edit" ]'
          color='primary'
          >
          {{ translations.submit }}
        </a>
        <br/><br/>
        <h2 class='title2' >
          {{ translations.history }}
        </h2>
        <table-basic
          *ngIf='( this.schemas$ | async ) as schemas'
          (onClickEvent)='this.onClickTable( $event )'
          [schemas]='schemas'
          >
          <template-alert
            [style]='"general"'
            class='table-empty'
            >
            <p>{{ translations.table.empty }}</p>
          </template-alert>
        </table-basic>
      </div>
    </template-basic>
  `,
})
export class ReportsIncomeAllComponent extends TemplateContainerComponent {

  /**
   * http://reactivex.io/documentation/observable.html
   */
  public readonly datas$: Observable<any> = this.store
    .select('reports', 'income', 'all')
    .pipe(
      map((o) => (!!o && !!o.content) ? o.content : o),
      takeUntil(this.destroy$),
    )
    ;

  /**
   * http://reactivex.io/documentation/observable.html
   */
  public readonly schemas$: Observable<TableSchemas> = this.table.build$(
      this.language$,
      this.translations$,
      this.modules$,
      this.width$,
      this.datas$,
      undefined,
      TableBuild.bind(this),
    )
    .pipe(takeUntil(this.destroy$))
    ;

  /**
   * https://angular.io/guide/user-input
   * @param input
   */
  public onClickTable(input: TableClick): void {
    // const row = input.datas as TableRow<TableControl>;
    // const tier = row.children.filter(x => x.key === 'tier');
    // console.log('tier', tier[0].value);
    this.router.navigate([ '/reports/income/one' , input.datas.key ]);
  }

  /**
   * https://angular.io/api/core/OnInit
   * https://angular.io/api/core/OnInit#ngOnInit
   */
  public ngOnInit(): void {
    this.store.dispatch<any>(new ReportIncomeAllComplete(null));
    this.store.dispatch<any>(new ReportIncomeAllStart(null));
  }

}
