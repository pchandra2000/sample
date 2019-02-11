import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map ,  take ,  takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { PayloadService } from '../../../app/shared/payload.service';
import { toMomentFormat } from '../../../modules/common';
import { clone } from 'lodash-es';
import { Title } from '@angular/platform-browser';
/**
 * This componenet handles all funtionality related to confirming edited income.
 * author Prashant Chandra
 */
@Component({
  selector: 'reports-income-complete',
  styleUrls: ['./income-complete.component.styl'],
  templateUrl: './income-complete.component.html'
})
export class ReportsIncomeCompleteComponent {
  public payload;
  public language;
  public readonly destroy$: Subject<boolean> = new Subject<boolean>();
  public readonly language$: Observable<string> = this.store
    .select('translate', 'language')
    .pipe(takeUntil(this.destroy$));
  public readonly token$: Observable<any> = this.store
    .select('auth', 'token')
    .pipe(
      take(1),
      map(o => (!!o && !!o.content ? o.content : o)),
      filter((o: any) => !!o && !!o.access_token)
    );
  /*
   * Return true or false based on weather a file was chosen
   * Author: Prashant Chandra
   */
  public fileName() {
    return this.payload.fileName === '' ? false : true;
  }
  /*
   * Angular lifecycle hook called on destruction of the component
   * author Prashant Chandra
   */
  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  /*
   * Standard lifecycle hook for initialization of the componnet
   * Author: Prashant Chandra
   */
  public ngOnInit(): void {
    this.language$.subscribe(language => {
      this.language = language;
      if (language === 'en-CA') {
        this.translate.use('en');
      }
      if (language === 'fr-CA') {
        this.translate.use('fr');
      }
      // lets set the title
      let title;
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
    });
    this.payload = clone(this.payloadService.getPayload1());
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
  onReportAdditionalIncome() {
    this.payloadService.clearAll();
    this.router.navigate(['reports/income/edit']);
  }
  /*
   * Called when the user selects the back to reporting button, clears the existing payloads and navigae to the income page
   * Author: Prashant Chandra
   */
  onBackToReportingHistory() {
    this.payloadService.clearAll();
    this.router.navigate(['reports/income']);
  }
  /*
   * Creates and instance of the class.
   * author Prashant Chandra
   */
  constructor(
    public translate: TranslateService,
    protected readonly store: Store<any>,
    public router: Router,
    public payloadService: PayloadService,
    private titleService: Title
  ) {}
}
