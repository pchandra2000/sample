import { Component, Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

/**
 * This componenet handles all funtionality related to reviewing edited income.
 * author Prashant Chandra
 */
@Component({
  selector: 'file-upload-preview',
  styleUrls: ['./file-upload-preview.component.styl'],
  templateUrl: './file-upload-preview.component.html'
})
export class FileUploadPreviewComponent {
  constructor(
    public dialogRef: MatDialogRef<FileUploadPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  public onCloseClick(): void {
    this.dialogRef.close();
  }

}
