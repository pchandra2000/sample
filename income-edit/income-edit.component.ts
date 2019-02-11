import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  OnInit
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, take, map ,  takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { toMoment } from '../../../modules/common';
import { MatRadioChange, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { PayloadService } from '../../../app/shared/payload.service';
import { FormBuilder } from '@angular/forms';
import { TooltipDialogComponent } from '../../../app/shared/tooltip/tooltipDialog';
import { environment } from '../../../environments/environment.common';
import { clone } from 'lodash-es';
import { ApiHelperService } from 'src/app/shared/api-helper.service';
import { Title } from '@angular/platform-browser';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { FileUploadPreviewComponent } from './fileUploadPreview/file-upload-preview.component';
/**
 * This componenet handles all funtionality related to editing income.
 * author Prashant Chandra
 */
@Component({
  selector: 'reports-income-edit',
  styleUrls: ['./income-edit.component.styl'],
  templateUrl: './income-edit.component.html'
})
export class ReportsIncomeEditComponent implements OnDestroy, OnInit {
  public thereWasAnError;
  public file: File;
  public errorCode: string = '00500';
  public members;
  public employers = [];
  public min: Date = toMoment('en-CA', '2018-04-01T05:00:00Z').toDate();
  public max: Date = toMoment('en-CA').subtract(1, 'day').toDate();
  public startDate = new Date();
  public showFileUpload: boolean = false;
  public showErrors: boolean = false;
  public incomeEditForm: FormGroup;
  public payload;
  public ext: string;
  public language: string;
  public url: string = 'boo';
  public NumberRegex = /^(\d*)(\.|\,)?(\d){1,2}$/;
  @ViewChild('fileName')
  fileNameLabel: ElementRef;

  /*
   * Observable for component destruction
   * author Prashant Chandra
   */
  public readonly destroy$: Subject<boolean> = new Subject<boolean>();
  /*
   * Observable for langulage
   * author Prashant Chandra
   */
  public readonly language$: Observable<string> = this.store
    .select('translate', 'language')
    .pipe(takeUntil(this.destroy$));
  /*
   * Observable for permissions
   * author Prashant Chandra
   */
  public readonly permissions$: Observable<any> = this.store
    .select('auth', 'permissions')
    .pipe(
      map(o => (!!o && !!o.content ? o.content : o)),
      filter((o: any) => !!o && !!o.items)
    );

  /*
   * Creates and instance of the class.
   * author Prashant Chandra
   */
  constructor(
    public translate: TranslateService,
    protected readonly store: Store<any>,
    public router: Router,
    public payloadService: PayloadService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public apiService: ApiHelperService,
    private titleService: Title,
    private sanitizer: DomSanitizer
  ) {
    this.thereWasAnError = false;
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
    // These are needed if we are in edit mode
    const payloadForEdit = clone(this.payloadService.getPayload1());
    if (this.payloadService.getPayload2()) {
      const fileForEdit = Object.assign(this.payloadService.getPayload2());
      if (fileForEdit) {
        this.file = fileForEdit;
        if (this.fileNameLabel) {
          this.fileNameLabel.nativeElement.innerHTML = this.file.name;
        }
      }
    }

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
        .get('title.reports.income.edit')
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
    // Lets check if the logged in use has permission to upload documents and
    // only show the upload control if in fact he does
    this.permissions$.subscribe(permissions => {
      const uploadPermissionobject = permissions.items.filter(
        i => i.uri === '/api/v1/document-ms/upload'
      );
        this.showFileUpload = uploadPermissionobject[0].enabled;
        // this.showFileUpload = false;
    });

    // This call basically gets the data to pupulate the member and employer dropdowns
    this.apiService
      .callApi(
        environment.api.reports.income.edit.options.path,
        environment.api.reports.income.edit.options.method
      )
      .subscribe(
        members => {
          let primary: string = null;
          this.members = members.items.map(i => {
            if (i.isPrimary) {
              primary = i.id;
            }
            // Set up the employers array
            this.employers[i.id] = i.employer.map(e => ({
              employerName: e.employer,
              employmentId: e.id
            }));
            // Set up the members array
            return { memberName: i.name, memberId: i.id };
          });
          // we will patch in the value of the member if there is only one member in the
          // list of members
          if (this.members.length === 1) {
            this.incomeEditForm.patchValue({
              memberId: this.members[0].memberId
            });
          }
          // So we need to supply a default employer value in case there is only one employer
          // problem is that employers are arrays within arrays or memberids so here is how
          // we select the array of the current member and then select the default employer
          if (this.employers[this.incomeEditForm.value.memberId].length === 1) {
            this.incomeEditForm.patchValue({
              employmentId: this.employers[
                this.incomeEditForm.value.memberId
              ][0].employmentId
            });
          }

          // Now if we are in edit mode than a file must already have been chosen previously, so lets display its name
          if (this.payloadService.getPayload2()) {
            this.file = this.payloadService.getPayload2();
            this.fileNameLabel.nativeElement.innerHTML = this.processFileName(
              this.file.name
            );
          }
        },
        error => {
          this.thereWasAnError = true; // show the error box
          if (error.error.error.codes[0]) {
            this.errorCode = 'error.error.error.codes[0]'; // set up the error code for translation and display to the user
          }
        }
      );

    // This is our form being initialized using the form builder, please note that there are 2 states
    // to this form. EditMode : Where its being built after the user selected edit record on the income review page,
    // we will prepopulate the controls with value already entered. AddMode: this is the first time
    // the user comes to this page and all controls will start out blank.
    this.incomeEditForm = this.fb.group({
      memberId: [
        payloadForEdit ? payloadForEdit.memberId : '',
        Validators.required
      ],
      employmentId: [
        payloadForEdit ? payloadForEdit.employmentId : '',
        Validators.required
      ],
      payDate: [
        payloadForEdit ? payloadForEdit.date : '',
        [Validators.required]
      ],
      grossAmount: [
        payloadForEdit ? payloadForEdit.grossAmount : '',
        [
          Validators.required,
          Validators.pattern(this.NumberRegex),
          Validators.min(0)
        ]
      ],
      netAmount: [
        payloadForEdit ? payloadForEdit.netAmount : '',
        [
          Validators.required,
          Validators.pattern(this.NumberRegex),
          Validators.min(0)
        ]
      ],
      childSupportRadio: [
        payloadForEdit
          ? payloadForEdit.childSupportAmount > 0
            ? 'Yes'
            : 'No'
          : 'No'
      ],
      childSupportAmount: [
        payloadForEdit ? payloadForEdit.childSupportAmount : 0,
        [
          Validators.required,
          Validators.pattern(this.NumberRegex),
          Validators.min(0)
        ]
      ],
      garnishmentRadio: [
        payloadForEdit
          ? payloadForEdit.garnishmentAmount > 0
            ? 'Yes'
            : 'No'
          : 'No'
      ],
      garnishmentAmount: [
        payloadForEdit ? payloadForEdit.garnishmentAmount : 0,
        [
          Validators.required,
          Validators.pattern(this.NumberRegex),
          Validators.min(0)
        ]
      ],
      file: new FormControl('', [])
    });
  }
  /*
   * Removes commas from numnic field values and changes it to decimals so that any french
   * user who uses comma instead of decimal is handled correctly
   * Author: Prashant Chandra
   */
  private fixCommas(num): string {
    return String(num).replace(',', '.');
  }
  /*
   * Resets the employers based on the chosen member
   * Author: Prashant Chandra
   */
  resetEmployers($event) {
    this.incomeEditForm.patchValue({
      employmentId: this.employers[
        this.incomeEditForm.value.memberId
      ][0].employmentId
    });
  }
  /*
   * Called when the form is being submitted
   * Author: Prashant Chandra
   */
  public onSubmit() {
     // lets remove any displayed error messages
     this.thereWasAnError = false;
     // Reset the error code to default
     this.errorCode = '00500';
    if (
      this.incomeEditForm.status === 'VALID' &&
      !this.checkFileNameSize() &&
      !this.checkFileSize() &&
      !this.checkFileNamePattern() &&
      !this.checkFileType()
    ) {
      this.processSubmission();
    } else {
      this.showErrors = true;
    }
  }
  /*
   * Called when the there are no errors and we want to process the submission
   * Author: Prashant Chandra
   */
  public processSubmission() {
    // Grab the value of the paydate
    let tempDate = this.incomeEditForm.value.payDate;
    if (typeof tempDate === 'string') {
      // means that we are in edit mode and we have already done the toISO string conversion
    } else {
      // We are not in edit mode and need to convert this to a string
      tempDate = tempDate.toISOString();
    }
    // set up the payload for the validate call
    this.payload = {
      childSupportAmount: this.fixCommas(
        this.incomeEditForm.value.childSupportAmount
      ),
      date: tempDate,
      employmentId: this.incomeEditForm.value.employmentId,
      garnishmentAmount: this.fixCommas(
        this.incomeEditForm.value.garnishmentAmount
      ),
      grossAmount: this.fixCommas(this.incomeEditForm.value.grossAmount),
      memberId: this.incomeEditForm.value.memberId,
      netAmount: this.fixCommas(this.incomeEditForm.value.netAmount),
      showFileUpload: this.showFileUpload
    };

    // Make the validate call
    this.apiService
      .callApi(
        environment.api.reports.income.edit.confirm.path,
        environment.api.reports.income.edit.confirm.method,
        undefined,
        this.payload
      )
      .subscribe(
        response => {
          // Now that we have made the call and it has succeeded
          // Lets load up the payload with employername, mamber name and filename as we need
          // this for display on the confirm and complete screens we will delete these before posting the data to the API
          this.payload.memberName = this.members.filter(
            x => x.memberId === this.incomeEditForm.value.memberId
          )[0].memberName;
          // now since employers is an array or employers within and array of member ids we
          // will access the employers for the selected member
          this.payload.employerName = this.employers[
            this.incomeEditForm.value.memberId
          ].filter(
            x => x.employmentId === this.incomeEditForm.value.employmentId
          )[0].employerName;
          this.payload.fileName = this.file ? this.file.name : '';
          // now set the payload on the payload service for form variables
          this.payloadService.setPayload1(this.payload);
          // set the payload for the file
          this.payloadService.setPayload2(this.file);
          // go to the review page
          this.router.navigate(['reports/income/confirm']);
        },
        error => {
          this.thereWasAnError = true; // show the error box
          // Now lets clear the payload service of all data otherwise the data persists
          // in the controls even when the user is trying to create a new record.
          this.payloadService.clearAll();

          // check if an error code was returned.
          if (error.error.error.codes[0]) {
            // load up the code so that it can be translated and shown on the UI
            this.errorCode = 'error.error.error.codes[0]';
          }
        }
      );
  }
  /*
   * Fired whenever the child support radio changes status to No, updates the value
   * of the childsupportAmount to 0 othervise this control will retain the old value
   * put in there by the user even though the user says that they are not reciving child support.
   * Author: Prashant Chandra
   */
  public childSupportChange(event: MatRadioChange) {
    if (event.value === 'No') {
      this.incomeEditForm.patchValue({
        childSupportAmount: 0
      });
    }
  }

  /*
   * Fired whenever the garnishment radio changes status to No, updates the value
   * of the garnishmentAmount to 0 othervise this control will retain the old value
   * put in there by the user even though the user says that thir wages are no longer being garnished
   * Author: Prashant Chandra
   */
  public garnishmentChange(event: MatRadioChange) {
    if (event.value === 'No') {
      this.incomeEditForm.patchValue({
        garnishmentAmount: 0
      });
    }
  }

  /*
   * Uses the tooltipcomponent to show tool tips as per the supplied translated text
   * Author: Prashant Chandra
   */
  public showTooltip(tooltip: any) {
    let tooltiptext = '';
    let tooltipclosetext = '';
    this.translate.get(tooltip).subscribe((res: string) => {
      tooltiptext = res;
    });
    this.translate.get('app.tooltipclose').subscribe((res: string) => {
      tooltipclosetext = res;
    });

    const dialogRef = this.dialog.open(TooltipDialogComponent, {
      width: '500px',
      data: { tooltip: tooltiptext, closeButtonText: tooltipclosetext }
    });

    dialogRef.afterClosed().subscribe(result => {});
  }
  /*
   * Method to check the file type by checking the last 4 charachters and return true of false used to
   * fire the error under the control additionally it sets the fileTypeInvalid to be used to control the
   * availability of the submit button
   * Author: Prashant Chandra
   */
  checkFileType() {
    if (this.file) {
      this.ext = this.file.name.substr(this.file.name.length - 4); // becuase we need to  extract the extension with is the last 4 chars
      // lets check for lower case as the user might have the extension in upper case.
      this.ext = this.ext.toLowerCase();

      if (this.ext === 'jpeg') {
        this.ext = '.jpeg'; // we need to do this becuase JPEG is a 4 letter extention unlike others
      }
      if (
        this.ext === '.pdf' ||
        this.ext === '.jpg' ||
        this.ext === '.jpeg' ||
        this.ext === '.png'
      ) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
  /*
   * If you hit cancel on the page you would want to clear out the selcted payload becuase remember that the user could be
   * in edit mode and the payload might be populated. And obviously you want to navigate bact to the reporting income page.
   * Author: Prashant Chandra
   */
  onCancel() {
    this.payloadService.clearAll();
    this.router.navigate(['/reports/income']);
  }
  /*
   * Method to check the file name only contains letters, numbers, underscores, dashes spaces periods
   * and commas return true or false used to fire the error under the control additionally it sets the
   * fileNamePatternInvalid to be used to control the availability of the submit button.
   * Author: Prashant Chandra
   */
  checkFileNamePattern() {
    if (this.file) {
      const pattern = /^[a-zA-Z0-9_,\s.-]*$/; // Allow letters, numbers, spaces, periods, commas, underscore and dash
      if (pattern.test(this.file.name)) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  /*
   * Method to check the file name only contains the appropriate number of charachters including the extention
   * return true or false used to fire the error under the control additionally it sets the fileNamePatternInvalid
   * to be used to control the availability of the submit button.
   * Author: Prashant Chandra
   */
  checkFileNameSize() {
    if (this.file) {
      if (this.file.name.length > 200) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  /*
   * Method to check the file is less than or equal to 8MB and commas return true or false used to fire the error
   * under the control additionally it sets the fileNamePatternInvalid to be used to control the availability
   * of the submit button.
   * Author: Prashant Chandra
   */
  checkFileSize() {
    if (this.file) {
      if (this.file.size / 1024 / 1024 < 8) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  /*
   * Clears the file if one has been selected and retores the state of the other error check as they no longer apply
   * after the file has been cleared out.
   * Author: Prashant Chandra
   */
  clearFile() {
    if (this.file) {
      this.file = null;
      this.fileNameLabel.nativeElement.innerHTML = '';
    }
  }


  /*
   * previews the file if one has been selected
   * Author: Prashant Chandra
   */
  previewFile(event) {
    if (this.file) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        this.url = reader.result.toString();

        const dialogRef = this.dialog.open(FileUploadPreviewComponent, {
           width: '1000px',
          data: { url: this.url, type: this.ext === '.pdf' ? 'pdf' : 'image' },
        });

        dialogRef.afterClosed().subscribe(result => {});
     };
      // Read in the image file as a data URL.
      reader.readAsDataURL(this.file);
    }
  }


  processFileName(filename): string {
    let displayFileName = '';
    if (filename.length > 20) {
      displayFileName = filename.substring(0, 20);
      displayFileName = displayFileName + '...';
    } else {
      displayFileName = this.file.name;
    }
    return displayFileName;
  }
  /*
   * This method is called every time you select a new file with the file upload. We basically select the file into put
   * meber variable called file and we set up the file name for display in out modified label
   * Author: Prashant Chandra
   */
  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.file = fileList[0];
      this.fileNameLabel.nativeElement.innerHTML = this.processFileName(
        this.file.name
      );
    }
  }
}
