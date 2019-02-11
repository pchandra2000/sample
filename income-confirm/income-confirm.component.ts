import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { PayloadService } from '../../../app/shared/payload.service';
import { toMomentFormat } from '../../../modules/common';
import { environment } from '../../../environments/environment.common';
import { clone } from 'lodash-es';
import { ApiHelperService } from 'src/app/shared/api-helper.service';
import { Title } from '@angular/platform-browser';
/**
 * This componenet handles all funtionality related to reviewing edited income.
 * author Prashant Chandra
 */
@Component({
  selector: 'reports-income-confirm',
  styleUrls: ['./income-confirm.component.styl'],
  templateUrl: './income-confirm.component.html'
})
export class ReportsIncomeConfirmComponent {
  public payload;
  public thereWasAnError: boolean = false;
  private formData: FormData = new FormData();
  public errorCode: string = '00500';
  public readonly destroy$: Subject<boolean> = new Subject<boolean>();
  public language: string;
  public loading: boolean = false;

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
        .get('title.reports.income.confirm')
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

    // Get the payload of form variables from the payload service
    this.payload = clone(this.payloadService.getPayload1());
  }
  /*
   * Method changes the date string based on the locale to a moment date object
   * Author: Prashant Chandra
   */
  public toLocalizedDate(locale: string, date: string): string {
    return toMomentFormat(locale, date);
  }

  /*
   * Return true or false based on weather a file was chosen
   * Author: Prashant Chandra
   */
  fileName() {
    return this.payload.fileName === '' ? false : true;
  }

  /*
   * Called when the user selects the complete button, submits form data and the file if chose to the backend
   * Author: Prashant Chandra
   */
  onComplete() {
     // lets remove any displayed error messages
     this.thereWasAnError = false;
     // Reset the error code to default
     this.errorCode = '00500';
    // Get the payload
    const payload = clone(this.payloadService.getPayload1());
    // get another copy for dispalay so that when we delte properties they dont disappear from the screen
    const payloadForPost = clone(this.payloadService.getPayload1());
    // Get the file if any
    const file = this.payloadService.getPayload2();
    if (file) {
      // if there is a file then and only then add it to the form data variable
      this.formData.append('file', file, file.name);
    }
    // delete display only properties that cannot be submitted
    delete payloadForPost.memberName;
    delete payloadForPost.employerName;
    delete payloadForPost.fileName;
    delete payloadForPost.showFileUpload;
    // add the other properties for the form data for submit
    this.formData.append('income', JSON.stringify(payloadForPost));
    // set up the spinner to turn on
    this.loading = true;

    // post the formdata and file to the back end
    this.apiService
      .callApi(
        environment.api.reports.income.edit.submit.path,
        environment.api.reports.income.edit.submit.method,
        undefined,
        this.formData
      )
      .subscribe(
        resp => {
          // Turn off the spinner on successful post
          this.loading = false;
          // Get the submitted timestamp as we will need it for the next screen and add it to the payload
          payload.dateSubmitted = resp.item.submittedTimeStamp;
          this.payloadService.setPayload1(payload);
          // navigate to the next page
          this.router.navigate(['reports/income/complete']);
        },
        error => {
          // so there was an error, set the spinner off
          this.loading = false;
          // Now lets clear the payload service of all data otherwise the data persists
          // in the controls even when the user is trying to create a new record.
          this.payloadService.clearAll();

          // check if an error code was returned.
          this.thereWasAnError = true; // show the error box
          if (error.error.error.codes[0]) {
            // set up the specifi error code if any
            this.errorCode = 'error.error.error.codes[0]';
          }
        }
      );
  }
}
