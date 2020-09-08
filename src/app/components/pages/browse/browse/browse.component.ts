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
  public pageSize = 8;
  public selectedFilter = '';
  public searchValue = '';
  public alertClass = '';
  public alertMessage = '';
  public checkedBoxesPartIds = [];

  constructor(
    private partsService: PartsService,
    public modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getPartsData();
  }

  getPartsData() {
    this.partsService.getParts().subscribe((response) => {
      this.partsData = response;
      this.filteredPartsData = response;
    });
  }

  /** Start Filter Table Data Functions */
  selectChangeHandler(event) {
    this.selectedFilter = event.target.value;
    this.filterPartsData();
  }

  searchBoxValueHandler(event) {
    this.searchValue = event.target.value.toLowerCase();
    this.filterPartsData();
  }

  filterPartsData() {
    if (!this.searchValue) return (this.filteredPartsData = this.partsData);

    if (this.selectedFilter) {
      this.filteredPartsData = this.partsData.filter(
        (part) =>
          part[this.selectedFilter] &&
          part[this.selectedFilter]
            .toString()
            .toLowerCase()
            .includes(this.searchValue)
      );
    } else {
      this.filteredPartsData = this.partsData.filter((part) => {
        const partKeys = Object.keys(part);
        return partKeys.some(
          (key) =>
            part[key] &&
            part[key].toString().toLowerCase().includes(this.searchValue)
        );
      });
    }
  }
  /** End Filter Table Data Functions */

  /** Start Delete Part Functionality  */

  openConfirmModal(partID, arrayIndex, type) {
    const modalOptions: NgbModalOptions = {
      backdrop: 'static',
      backdropClass: 'customBackdrop',
      centered: true,
    };
    const modalRef = this.modalService.open(
      ConfirmModalComponent,
      modalOptions
    );
    modalRef.componentInstance.modal_title = 'Confirm Delete';
    modalRef.componentInstance.modal_content = `
    <p><strong>Are you sure you want to delete this part?</strong></p>
    <p>All information associated to this part will be permanently deleted.
    <span class="text-danger">This operation can not be undone.</span>
    </p>`;

    modalRef.result.then(
      (result) => {
        if (result === 'ok') {
          type === 'single'
            ? this.deletePart(partID, arrayIndex)
            : this.deleteInBulk();
        }
      },
      (reason) => {}
    );
  }

  deletePart(partID, arrayIndex) {
    this.partsService.deletePart(partID).subscribe(
      (res) => {
        this.filteredPartsData.splice(arrayIndex, 1);
        this.showAlert(
          'alert alert-success',
          'Part has been successfully deleted!',
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
  /** Delete In Bulk */

  checkAllCheckBoxes(event) {
    const dataLength = this.filteredPartsData.length;
    this.checkedBoxesPartIds = [];
    for (let i = 0; i < dataLength; i += 1) {
      this.filteredPartsData[i].selected = event.target.checked;
      if (event.target.checked) {
        this.checkedBoxesPartIds.push(this.filteredPartsData[i].id);
      }
    }
  }

  checkBoxChangedHandler(event, partID) {
    if (event.target.checked && this.checkedBoxesPartIds.indexOf(partID) < 0) {
      this.checkedBoxesPartIds.push(partID);
    } else if (!event.target.checked) {
      const index = this.checkedBoxesPartIds.indexOf(partID);
      index > -1 ? this.checkedBoxesPartIds.splice(index, 1) : false;
    }
  }

  deleteInBulk() {
    this.partsService.deletePart(this.checkedBoxesPartIds).subscribe(
      (res) => {
        this.filteredPartsData = this.filteredPartsData.filter(
          (part) => !this.checkedBoxesPartIds.includes(part.id)
        );
        this.checkedBoxesPartIds = [];
        this.showAlert(
          'alert alert-success',
          'Parts has been successfully deleted!',
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
  /** End Delete In Bulk */

  /** End Delete Part Functionality */

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
