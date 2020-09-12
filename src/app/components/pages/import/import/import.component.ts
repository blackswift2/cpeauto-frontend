import { Component, OnInit } from '@angular/core';
import * as fileReader from 'papaparse';
import { PartsService } from './../../../../services/PartsService';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../../layout/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css'],
})
export class ImportComponent implements OnInit {
  public file;
  public fileName = '';
  public fileHeaderColumns = [];
  public fileData = [];
  public csvData = []; //Copy

  public alertClass = '';
  public alertMessage = '';

  public fileUploadStart = 0;
  public csvDataRules = {};

  constructor(
    private partsService: PartsService,
    public modalService: NgbModal
  ) {}

  ngOnInit(): void {}

  /**
   * File Drop And Browser File Button Handler
   */
  onFileDroppedOrBrowse(event) {
    this.file = event?.target?.files[0];
    this.fileName = this.file.name;
    if (!this.checkFileExtension(this.fileName)) return;
    this.fileUploadStart = 1;
    this.file.progress = 0;
    this.uploadFilesSimulator();
    setTimeout(() => this.readCSVFile(this.file), 1500);
  }

  /**
   * Check File Extension - Valid Extension is .csv
   * @param fileName
   */

  checkFileExtension(fileName) {
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
   * Simulating the file uplaoding process
   */
  uploadFilesSimulator() {
    const progressInterval = setInterval(() => {
      if (this.file.progress === 100) {
        clearInterval(progressInterval);
      } else {
        this.file.progress += 5;
      }
    }, 1000);
  }

  /**
   * Reading CSV File
   * @param file
   */
  readCSVFile(file) {
    console.log(file);
    fileReader.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        this.fileData = result.data;
        this.csvData = result.data;
        this.fileHeaderColumns = result.meta.fields;
        this.generateCSVParserRules(this.fileHeaderColumns);
        this.file.progress = 95;
        setTimeout(() => (this.fileUploadStart = 2), 1500);
      },
      error: (err) => {
        console.log(err);
      },
    });
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

  /**
   * Generate Parsing Rules
   */

  generateCSVParserRules(fileHeaderColumns) {
    const rule = {
      //Putting default values
      matchTo: 'skip',
      emptyValue: 'ignore',
      modifiedValue: 'original',
    };
    // Loop through each column to add rules properties
    fileHeaderColumns.forEach((column) => {
      this.csvDataRules[column] = { ...rule };
    });
    console.log(this.csvDataRules);
  }

  /**
   *  Import CSV Data
   */

  importData() {
    //clean data by deleting skip and ignore values columns
    Object.keys(this.csvDataRules).forEach((column: any) => {
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
      if (this.csvDataRules[propValue]['matchTo'] !== 'skip') {
        const columnValue = this.csvDataRules[propValue]['matchTo'];
        mappedColumns[propValue] = columnValue;
        insertionRules[columnValue] = this.csvDataRules[propValue];
      }
    }
    const renamedData = [];
    for (let csvRow of this.csvData) {
      const data = this.renameKeys(csvRow, mappedColumns);
      renamedData.push(data);
    }
    this.openConfirmModal({ partsData: renamedData, insertionRules });
  }

  /** Rename keys to matched columns */

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
    console.log(data);
    this.partsService.bulkCreatePart(data).subscribe(
      (res) => {
        this.file.progress = 100;
        setTimeout(() => {
          this.fileUploadStart = 4;
        }, 2000);
      },
      (error) => {
        console.log(error);
        this.fileUploadStart = 2;
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
    this.file = '';
    this.fileName = '';
    this.fileHeaderColumns = [];
    this.fileData = [];
    this.csvData = [];

    this.alertClass = '';
    this.alertMessage = '';
    this.csvData = [];

    this.fileUploadStart = 0;
    this.csvDataRules = {};
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
    <span class="text-danger">Overwriting or Erasing operations cannot be undone.</span>
    </p>`;

    modalRef.result.then(
      (result) => {
        if (result === 'ok') {
          setTimeout(() => {
            this.file.progress = 0;
            this.fileUploadStart = 3;
            const progressInterval = setInterval(() => {
              if (this.file.progress === 100) {
                clearInterval(progressInterval);
              } else {
                this.file.progress += 5;
              }
            }, 200);
          }, 100);
          this.bulkCreatePart(partData);
        }
      },
      (reason) => {}
    );
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
}
