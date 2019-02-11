import { Component } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { PayloadService } from '../../../app/shared/payload.service';
import { toMomentFormat } from '../../../modules/common';
import { environment } from '../../../environments/environment.common';
import { ApiHelperService } from 'src/app/shared/api-helper.service';
import { Title } from '@angular/platform-browser';

/**
 * This componenet handles all funtionality related to reviewing edited income.
 * author Prashant Chandra
 */
@Component({
  selector: 'reports-one-one',
  styleUrls: ['./income-one.component.styl'],
  templateUrl: './income-one.component.html'
})
export class ReportsIncomeOneComponent {
  public payload;
  public thereWasAnError = false;
  public errorCode = '00500';
  public readonly destroy$: Subject<boolean> = new Subject<boolean>();
  public language;
  public loading = false;
  public id: number;
  public tier: string;

  public readonly language$: Observable<string> = this.store
    .select('translate', 'language')
    .pipe(takeUntil(this.destroy$));
  /*
   * Creates and instance of the class.
   * author Prashant Chandra
   */
  constructor(
    public translate: TranslateService,
    public http: HttpClient,
    protected readonly store: Store<any>,
    public router: Router,
    public payloadService: PayloadService,
    private route: ActivatedRoute,
    public apiService: ApiHelperService,
    private titleService: Title
  ) {}
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
    // lets first read the incoming paramter
    this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
    });

    // Observable to read the currently selcted user language and initialize the translate service with it.
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
        .get('title.reports.income.one')
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

    // now lets make a call the get the details for this id
    this.loading = true;
    this.apiService
      .callApi(
        environment.api.reports.income.one.path,
        environment.api.reports.income.one.method,
        this.id
      )
      .subscribe(
        response => {
          // Turn off the spinner on successful post
          this.loading = false;
          this.payload = response.item;
          // qualify the status with a proper translation path
          this.payload.status = `types.reports.statuses.${this.payload.status}`;
          // if a reson is populated then translate it
          if (this.payload.reason) {
            this.payload.reason = `types.reports.reasons.${
              this.payload.reason
            }`;
          }
        },
        error => {
          // so there was an error, set the spinner off
          this.loading = false;
          this.thereWasAnError = true; // show the error box
          if (error.error.error.codes[0]) {
            // set up the specifi error code if any
            this.errorCode = 'error.error.error.codes[0]';
          }
        }
      );
  }
  /*
   * Method changes the date string based on the locale to a moment date object
   * Author: Prashant Chandra
   */
  public toLocalizedDate(locale: string, date: string): string {
    return toMomentFormat(locale, date);
  }
}
