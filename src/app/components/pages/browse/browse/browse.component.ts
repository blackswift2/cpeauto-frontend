import { Component, OnInit } from '@angular/core';
import { PartsData } from '../../../../models/partsdata';
import { PartsService } from './../../../../services/PartsService';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../../layout/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css'],
})
export class BrowseComponent implements OnInit {
  public partsData: PartsData[] = [];
  public filteredPartsData: PartsData[] = [];
  public page = 1;
  public pageSize = 10;
  public alertClass = '';
  public alertMessage = '';
  public checkedPartsForDelete = [];

  constructor(
    private partsService: PartsService,
    public modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getPartsData();
  }

  /**
   * Get All Parts Data
   */
  getPartsData() {
    this.partsService.getParts().subscribe((response) => {
      this.partsData = response;
      this.filteredPartsData = response; // Keeping copy for filtering purpose
    });
  }

  /**
   *
   * @param event
   */

  changePerPageItems(event) {
    this.pageSize = event.target.value;
  }

  /**
   * Filter parts data
   * @param event
   * @param columnName
   */
  keyUpfilterData(event, columnName) {
    const searchValue = event.target.value;
    this.filterPartsData(searchValue, columnName);
  }

  /**
   * Filter data based on search value and column name
   * @param searchValue
   * @param columnName
   */
  filterPartsData(searchValue, columnName) {
    if (!searchValue) return (this.filteredPartsData = this.partsData);

    if (columnName) {
      this.filteredPartsData = this.partsData.filter(
        (part) =>
          part[columnName] &&
          part[columnName].toString().toLowerCase().includes(searchValue)
      );
    } else {
      this.filteredPartsData = this.partsData.filter((part) => {
        const partKeys = Object.keys(part);
        return partKeys.some(
          (key) =>
            part[key] &&
            part[key].toString().toLowerCase().includes(searchValue)
        );
      });
    }
  }
  /** End Filter Table Data Functions */

  /**================================ Start Delete Part Functionality====================================  */

  /**
   * Check All Checkboxes
   * @param event
   */
  checkAllCheckBoxes(event) {
    const dataLength = this.filteredPartsData.length;
    this.checkedPartsForDelete = [];
    for (let i = 0; i < dataLength; i += 1) {
      this.filteredPartsData[i].selected = event.target.checked;
      if (event.target.checked) {
        this.checkedPartsForDelete.push(this.filteredPartsData[i].id);
      }
    }
  }

  /**
   * Check single checkbox
   * @param event
   * @param partID
   */
  checkBoxChangedHandler(event, partID) {
    if (
      event.target.checked &&
      this.checkedPartsForDelete.indexOf(partID) < 0
    ) {
      this.checkedPartsForDelete.push(partID);
    } else if (!event.target.checked) {
      const index = this.checkedPartsForDelete.indexOf(partID);
      index > -1 ? this.checkedPartsForDelete.splice(index, 1) : false;
    }
  }

  /**
   * Delete single part data
   * @param partData
   * @param arrayIndex
   */
  async deletePart(partData, arrayIndex) {
    const modelTitle = 'Confirm Delete';
    const modalContent = `
    <p><strong>Are you sure you want to delete this part?</strong></p>
    <p>All information associated to this part will be permanently deleted.
    <span class="text-danger">This operation can not be undone.</span>
    </p>`;
    const modal_operation = 'delete';
    if (
      (await this.openConfirmModal(
        modelTitle,
        modalContent,
        modal_operation
      )) === 'ok'
    ) {
      this.partsService.deletePart(partData.id).subscribe(
        (res) => {
          this.filteredPartsData.splice(arrayIndex, 1);
          this.showAlert(
            'alert alert-success',
            `Part ${partData.part_number} has been successfully deleted!`,
            4000
          );
        },
        (err) => {
          this.showAlert(
            'alert alert-danger',
            'Error deleting part, please try again!',
            4000
          );
        }
      );
    }
  }

  /**
   * Delete part data in bulk
   */
  async deleteInBulk() {
    const modelTitle = 'Confirm Delete Selected Part(s)';
    const modalContent = `
    <p><strong>Are you sure you want to delete the selected part(s)?</strong></p>
    <p>All information associated will be permanently deleted.
    <span class="text-danger">This operation can not be undone.</span>
    </p>`;
    const modal_operation = 'delete';

    if (
      (await this.openConfirmModal(
        modelTitle,
        modalContent,
        modal_operation
      )) === 'ok'
    ) {
      this.partsService.deletePart(this.checkedPartsForDelete).subscribe(
        (res) => {
          this.filteredPartsData = this.filteredPartsData.filter(
            (part) => !this.checkedPartsForDelete.includes(part.id)
          );
          this.checkedPartsForDelete = [];
          this.showAlert(
            'alert alert-success',
            'Parts have been successfully deleted.',
            5000
          );
        },
        (err) => {
          this.showAlert(
            'alert alert-danger',
            'Error deleting part, please try again!',
            5000
          );
        }
      );
    }
  }
  /** End Delete In Bulk */

  /**================================ End Delete Part Functionality====================================  */

  /**
   * Confirm Modal
   * @param title
   * @param modalContent
   */
  openConfirmModal(modalTitle, modalContent, modal_operation) {
    const modalOptions: NgbModalOptions = {
      backdrop: 'static',
      backdropClass: 'customBackdrop',
      centered: true,
    };
    const modalRef = this.modalService.open(
      ConfirmModalComponent,
      modalOptions
    );
    modalRef.componentInstance.modal_title = modalTitle;
    modalRef.componentInstance.modal_content = modalContent;
    modalRef.componentInstance.modal_operation = modal_operation;
    return modalRef.result.then(
      (result) => {
        return result;
      },
      (reason) => {
        return reason;
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
}
