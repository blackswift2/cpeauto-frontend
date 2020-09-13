import { Component, OnInit } from '@angular/core';
import * as fileReader from 'papaparse';
import { saveAs } from 'file-saver';
import { PartsService } from './../../../../services/PartsService';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../../layout/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-export-parts',
  templateUrl: './export-parts.component.html',
  styleUrls: ['./export-parts.component.css'],
})
export class ExportPartsComponent implements OnInit {
  public file;
  public fileName = '';
  public fileHeaderColumns = [];
  public fileData = [];

  public selectedColumn = '';
  public exportColumns = [];

  public alertClass = '';
  public alertMessage = '';
  public fileUploadStart = 0; // 0 = not started, 1 = started, 2 = completed, 3 = processing, 4 = downloading

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
    this.readCSVFile(this.file);
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
   * Reading File Data - Valid file is .csv
   * @param file
   */
  readCSVFile(file) {
    fileReader.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => {
        return h.trim();
      },
      complete: (result) => {
        this.fileData = result.data;
        this.fileHeaderColumns = result.meta.fields;
        this.selectedColumn = this.fileHeaderColumns[0];
        this.file.progress = 95;
        setTimeout(() => (this.fileUploadStart = 2), 1200);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  /**
   * Select file column data to export
   * @param columnValue
   */
  selectFileColumnData(event) {
    this.selectedColumn = event.target.value;
  }

  /**
   * Export Column Check/Uncheck
   * @param event
   */
  exportColumnOptions(event) {
    const eventValue = event.target.value;
    const checked = event.target.checked;
    if (checked && !this.exportColumns.includes(eventValue)) {
      this.exportColumns.push(eventValue);
    } else if (!checked && this.exportColumns.includes(eventValue)) {
      this.exportColumns = this.exportColumns.filter(
        (option) => option !== eventValue
      );
    }
  }

  /**
   * Start exporting data, arrange data in proper format
   * to send to server
   */
  exportData() {
    const partNumbers = [];
    for (let i = 0; i < this.fileData.length; i++) {
      if (this.fileData[i][this.selectedColumn]) {
        partNumbers.push(
          this.fileData[i][this.selectedColumn].toString().trim()
        );
      }
    }
    if (this.exportColumns.length > 0 && partNumbers.length > 0) {
      this.exportColumns.unshift('part_number'); // Add part number to in exported columns
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
      this.downloadExportedData({
        partNumbers,
        exportColumns: this.exportColumns,
      });
    } else {
      const message =
        partNumbers.length > 0
          ? 'Please select any output field to proceed!'
          : 'Part Number data is empty!';
      this.showAlert('alert alert-danger', message, 3000);
    }
  }

  /**
   * Download exported data sent by server
   * @param data
   */
  downloadExportedData(data) {
    this.partsService.exportData(data).subscribe(
      (res) => {
        this.file.progress = 100;
        this.fileUploadStart = 4;
        setTimeout(() => {
          saveAs(res, this.fileName);
        }, 2000);
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

  /**
   * Show Alert
   * @param alertClass
   * @param alertMessage
   * @param alertTimeout
   */
  showAlert(alertClass, alertMessage, alertTimeout) {
    this.alertClass = alertClass;
    this.alertMessage = alertMessage;
    setTimeout(() => {
      this.alertClass = '';
      this.alertMessage = '';
    }, alertTimeout);
  }

  /**
   * Cancel import, clear all variables
   */
  cancelExport() {
    this.file;
    this.fileName = '';
    this.fileHeaderColumns = [];
    this.fileData = [];

    this.selectedColumn = '';
    this.exportColumns = [];

    this.alertClass = '';
    this.alertMessage = '';
    this.fileUploadStart = 0;
  }
}
