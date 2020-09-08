import { Component, OnInit } from '@angular/core';
import * as fileReader from 'papaparse';
import { PartsService } from './../../../../services/PartsService';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../../layout/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-export-parts',
  templateUrl: './export-parts.component.html',
  styleUrls: ['./export-parts.component.css'],
})
export class ExportPartsComponent implements OnInit {
  public files: any[] = [];
  public alertClass = '';
  public alertMessage = '';
  public csvData = [];
  public headerColumns = '';
  public csvFileName = '';
  public fileUploadStart = false;
  public showMatchColumnsView = false;
  public showSendingCSVDataProgress = {
    state: false,
    progress: 0,
  };
  public csvDataRules = {};

  constructor(
    private partsService: PartsService,
    public modalService: NgbModal
  ) {}

  ngOnInit(): void {}

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    if (this.checkFilesLength()) {
      this.prepareFile($event);
    }
  }

  /**
   * handle file from browse button
   */
  fileBrowseHandler(files) {
    if (this.checkFilesLength()) {
      this.prepareFile(files);
    }
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  checkFilesLength() {
    const fileLength = this.files.length > 0; // 0 means 1 file is already processed
    if (fileLength) {
      this.showAlert(
        'alert alert-danger',
        'You can only process one file at a time.',
        3000
      );
      return false;
    }
    return true;
  }

  checkIfCsvIsValid(file) {
    console.log(file[0]);
    const fileName = `${file[0].name}`.toLowerCase();
    if (!`${fileName}`.endsWith('.csv')) {
      this.showAlert(
        'alert alert-danger',
        'Please upload a valid csv file.',
        3000
      );
      return false;
    }
    return true;
  }
  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFile(files: Array<any>) {
    if (!this.checkIfCsvIsValid(files)) return;
    for (const item of files) {
      this.fileUploadStart = true;
      item.progress = 0;
      this.files.push(item);
      this.readCSVFile(item);
    }
    this.uploadFilesSimulator(0);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            setTimeout(() => (this.showMatchColumnsView = true), 1500);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  readCSVFile(file) {
    fileReader.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result, file) => {
        this.csvData = result.data;
        this.headerColumns = result.meta.fields;
        this.csvFileName = file.name;
        this.generateCSVParserRules(this.headerColumns);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  /**
   *
   * Generate Rules
   *
   */

  generateCSVParserRules(headerColumns) {
    const rule = {
      matchTo: 'skip',
      emptyValue: 'ignore',
      modifiedValue: 'original',
    };
    headerColumns.forEach((column) => {
      this.csvDataRules[column] = { ...rule };
    });
    console.log(this.csvDataRules);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /** Show Alert */
  showAlert(alertClass, alertMessage, alertTimeout) {
    this.alertClass = alertClass;
    this.alertMessage = alertMessage;
    setTimeout(() => {
      this.alertClass = '';
      this.alertMessage = '';
    }, alertTimeout);
  }

  /** Import CSV Data */

  importData() {
    //clean data by deleting skip columns
    const columnRules = Object.keys(this.csvDataRules);
    columnRules.forEach((column: any) => {
      for (let ruleValue in this.csvDataRules[column]) {
        if (
          (ruleValue === 'matchTo' &&
            this.csvDataRules[column][ruleValue] === 'skip') ||
          (ruleValue === 'emptyValue' &&
            this.csvDataRules[column][ruleValue] === 'ignore')
        ) {
          this.cleanData(column, this.csvDataRules[column][ruleValue]); // rule is a column name
        }
      }
    });

    // Match property names
    const mappedColumns = {};
    const insertionRules = {};
    for (let propValue in this.csvDataRules) {
      const columnValue = this.csvDataRules[propValue]['matchTo'];
      mappedColumns[propValue] = columnValue;
      insertionRules[columnValue] = this.csvDataRules[propValue];
    }
    const renamedData = [];
    for (let csvRow of this.csvData) {
      const data = this.renameKeys(csvRow, mappedColumns);
      renamedData.push(data);
    }
    this.openConfirmModal({ partsData: renamedData, insertionRules });
  }

  /** Rename keys */

  renameKeys(csvData, newKeys) {
    const keyValues = Object.keys(csvData).map((key) => {
      const newKey = newKeys[key] || key;
      return { [newKey]: csvData[key] };
    });
    return Object.assign({}, ...keyValues);
  }

  /**
   * Delete Data
   */

  cleanData(column, ruleValue) {
    const csvDataLength = this.csvData.length;
    for (let i = 0; i < csvDataLength; i++) {
      if (this.csvData[i][column]) {
        ruleValue === 'skip' ? delete this.csvData[i][column] : false;
        ruleValue === 'ignore' && this.csvData[i][column] == ''
          ? delete this.csvData[i][column]
          : false;
      }
    }
  }

  /** BulkCreate */

  bulkCreatePart(data) {
    this.partsService.bulkCreatePart(data).subscribe(
      (res) => {
        setTimeout(() => {
          const progressInterval = setInterval(() => {
            if (this.showSendingCSVDataProgress.progress === 100) {
              clearInterval(progressInterval);
              setTimeout(
                () =>
                  this.showAlert(
                    'alert alert-success',
                    'Data Has Been Uploaded Successfully!',
                    2000
                  ),
                500
              );
            } else {
              this.showSendingCSVDataProgress.progress += 5;
            }
          }, 200);
        }, 1000);
      },
      (error) => {
        console.log(error);
        this.showAlert(
          'alert alert-danger',
          'Error updating part data, please try again!',
          2000
        );
      }
    );
  }
  /** Cancel Import */

  cancelImport() {
    this.files = [];
    this.alertClass = '';
    this.alertMessage = '';
    this.csvData = [];
    this.headerColumns = '';
    this.csvFileName = '';
    this.showMatchColumnsView = false;
    this.showSendingCSVDataProgress.state = false;
    this.showSendingCSVDataProgress.progress = 0;
  }

  /** Open Confirmation Modal */

  openConfirmModal(partData) {
    const modalOptions: NgbModalOptions = {
      backdrop: 'static',
      backdropClass: 'customBackdrop',
      centered: true,
    };
    const modalRef = this.modalService.open(
      ConfirmModalComponent,
      modalOptions
    );
    modalRef.componentInstance.modal_title = 'Confirm Import';
    modalRef.componentInstance.modal_content = `
    <p><strong>Are you sure you want to import this data?</strong></p>
    <p>Please review again before importing.
    <span class="text-danger">Overwriting operation cannot be undone.</span>
    </p>`;

    modalRef.result.then(
      (result) => {
        if (result === 'ok') {
          this.showSendingCSVDataProgress.state = true;
          this.bulkCreatePart(partData);
        }
      },
      (reason) => {}
    );
  }
}
