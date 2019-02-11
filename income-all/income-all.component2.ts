import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { toMomentFormat } from '../../../modules/common';
import { environment } from '../../../environments/environment.common';
import { Title } from '@angular/platform-browser';
import { ApiHelperService } from 'src/app/shared/api-helper.service';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { DeviceDetectorService } from 'ngx-device-detector';

/**
 * This componenet handles all funtionality related to confirming edited income.
 * author Prashant Chandra
 */
@Component({
  selector: 'reports-all-complete2',
  styleUrls: ['./income-all.component2.styl'],
  templateUrl: './income-all.component2.html'
})
// tslint:disable-next-line:component-class-suffix
export class ReportsIncomeAllComponent2 implements OnInit {
  public payload;
  public language;
  public selectedRowIndex: number = -1;
  public thereWasAnError;
  public loading = false;
  public errorCode = 'event.00500';
  showReportIncomeButton = true;
  tableIsEmpty = false;
  public displayedColumns = [
    {def: 'paydate', showMobile: true },
    {def: 'status', showMobile: true },
    {def: 'amount', showMobile: true },
    {def: 'employer', showMobile: false },
    {def: 'arrow', showMobile: true },
  ];

  public dataSource;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public readonly destroy$: Subject<boolean> = new Subject<boolean>();
  public readonly language$: Observable<string> = this.store
    .select('translate', 'language')
    .pipe(takeUntil(this.destroy$));

  /*
   * Angular lifecycle hook called on destruction of the component
   * author Prashant Chandra
   */
  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


getDisplayedColumns(): string[] {
  const isMobile = !this.device.isDesktop();
  return this.displayedColumns
    .filter(dc => !isMobile || dc.showMobile)
    .map(dc => dc.def);
}

  /*
   * Standard lifecycle hook for initialization of the componnet
   * Author: Prashant Chandra
   */
  public ngOnInit(): void {
    // lets first setup the language
    this.language$.subscribe(language => {
      this.loading = true;
      this.language = language;
      if (language === 'en-CA') {
        this.translate.use('en');
      }
      if (language === 'fr-CA') {
        this.translate.use('fr');
      }
      // lets set the title
      let title: string;
      this.translate
        .get('title.reports.income.complete')
        .subscribe((res1: string) => {
          title = res1;
          this.translate.get('title.separator').subscribe((res2: string) => {
            title += res2;
            this.translate.get('title.start').subscribe((res3: string) => {
              title += res3;
            });
            // Now after building the desired title we actually set it
            this.titleService.setTitle(title);
          });
        });

      // This call basically gets the data to pupulate the member and employer dropdowns
      this.apiService
        .callApi(
          environment.api.reports.income.edit.options.path,
          environment.api.reports.income.edit.options.method
        )
        .subscribe(
          members => {
            const employers = [];
            const tmpMembers = members.items.map(i => {
              // Set up the employers array
              employers[i.id] = i.employer.map(e => ({
                employerName: e.employer,
                employmentId: e.id
              }));
              // Set up the members array
              return { memberName: i.name, memberId: i.id };
            });
            this.showReportIncomeButton = employers.length === 0 ? false : true;
          },
          error => {
            this.thereWasAnError = true; // show the error box
            if (error.error.error.codes[0]) {
              this.errorCode = `event.${error.error.error.codes[0]}`; // set up the error code for translation and display to the user
            }
          }
        );

      // This call basically gets the data to populate the reporting history table
      this.apiService
        .callApi(
          environment.api.reports.income.all.path,
          environment.api.reports.income.all.method
        )
        .subscribe(
          result => {
            if (result.items.length === 0) {
              this.tableIsEmpty = true;
              this.loading = false;
            } else {
              this.tableIsEmpty = false;
              result.items.map(x => {
                // we need to translate the status colums becuase we only get codes fom the backend
                this.translate
                  .get(`types.reports.statuses.${x.status}`)
                  .subscribe((translatedResult: string) => {
                    x.status = translatedResult;
                  });
                  x.paydate = x.date;
                  x.amount = x.netAmount;
                  x.employer = x.employerName;
              });
              // now lets populate the datasource
              this.dataSource = new MatTableDataSource(result.items);
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;
              this.loading = false;
            }
          },
          error => {
            this.loading = false;
            this.thereWasAnError = true; // show the error box
            if (error.error.error.codes[0]) {
              this.errorCode = `event.${error.error.error.codes[0]}`; // set up the error code for translation and display to the user
            }
          }
        );
    });
  }
  /*
   * Method changes the date string based on the locale to a moment date object
   * Author: Prashant Chandra
   */
  public toLocalizedDate(date: string): string {
    return toMomentFormat(this.language, date);
  }
  /*
   * Called when the user selects the report additional income button, clears the existing payloads and navigae to the edit page
   * Author: Prashant Chandra
   */
  onReportIncome() {
    this.router.navigate(['reports/income/edit']);
  }
  /*
   * Called when the user selects the back to reporting button, clears the existing payloads and navigae to the income page
   * Author: Prashant Chandra
   */
  onBackToReportingHistory() {
    this.router.navigate(['reports/income']);
  }
  /*
   * Called when the user clicls on a row from the income reporting history table
   * Author: Prashant Chandra
   */
  select(row) {
    this.selectedRowIndex = row.id;
    this.router.navigate(['reports/income/one/' + row.id]);
  }

  /*
   * Creates and instance of the class.
   * author Prashant Chandra
   */
  constructor(
    public translate: TranslateService,
    protected readonly store: Store<any>,
    public router: Router,
    private titleService: Title,
    public apiService: ApiHelperService,
    public readonly device: DeviceDetectorService
  ) {}
}
