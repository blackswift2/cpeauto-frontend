import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PartsService } from './../../../../services/PartsService';
import { ConfirmModalComponent } from '../../../layout/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-addparts',
  templateUrl: './addparts.component.html',
  styleUrls: ['./addparts.component.css'],
})
export class AddpartsComponent implements OnInit {
  public addPartsForm: FormGroup;
  public paramID;
  public Title;
  public buttonText;
  public isDeleteActive = false;
  public alertClass = '';
  public alertMessage = '';

  constructor(
    public fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private partsService: PartsService,
    public modalService: NgbModal
  ) {}

  ngOnInit() {
    this.paramID = this.activatedRoute.snapshot.paramMap.get('id');
    this.initializeForm();

    // Param ID determines the state of the page i.e. new data or update data
    if (!this.paramID) {
      this.Title = 'Add Part';
      this.buttonText = 'Save';
    } else {
      this.Title = 'Edit Part';
      this.buttonText = 'Update';
      this.isDeleteActive = true;
      this.getPartById(this.paramID);
    }
  }

  /**
   * Initialize Form Values
   */
  initializeForm() {
    this.addPartsForm = this.fb.group({
      part_number: ['', [Validators.required]],
      description_en: [''],
      description_es: [''],
      description_fr: [''],
    });
  }

  /**
   *  Getter to access form control
   * */
  get myaddPartsForm() {
    return this.addPartsForm.controls;
  }

  /**
   * Get Part Data by ID
   * @param id
   */
  getPartById(id) {
    this.partsService.getPartById(id).subscribe((data) => {
      if (data && data.part_number) {
        this.addPartsForm.setValue({
          part_number: data['part_number'],
          description_en: data['description_en'],
          description_es: data['description_es'],
          description_fr: data['description_fr'],
        });
      } else {
        this.showAlert(
          'alert alert-danger',
          `No Part data Found. You'll be redirected to browse page!`,
          4000
        );
        setTimeout(() => {
          this.router.navigateByUrl('/browse');
        }, 3000);
      }
    });
  }

  /**
   * Form Submit Handler
   */
  onSubmit() {
    if (!this.addPartsForm.valid) {
      return false;
    } else {
      if (!this.paramID) {
        this.createPartData(this.addPartsForm.value);
      } else if (this.paramID) {
        this.updatePartData(this.paramID, this.addPartsForm.value);
      }
    }
  }

  /**
   * Create Part Data
   * @param formData
   */
  createPartData(formData) {
    this.partsService.createPart({ data: formData }).subscribe(
      (res) => {
        this.addPartsForm.reset();
        this.showAlert(
          'alert alert-success',
          'Part data has been added successfully!',
          4000
        );
      },
      (error) => {
        console.log(error);
        this.showAlert(
          'alert alert-danger',
          'Error adding part data, please try again!',
          4000
        );
      }
    );
  }

  /**
   * Update Part Data by ID
   * @param partID
   * @param formData
   */
  async updatePartData(partID, formData) {
    const title = 'Confirm Update';
    const modelContent = `
    <p><strong>Are you sure you want to update this part data?</strong></p>
    <p>All information associated to this part will be updated.
    <span class="text-danger">This operation can not be undone.</span>
    </p>`;
    if ((await this.openConfirmModal(title, modelContent)) === 'ok') {
      this.partsService.updatePartById(partID, { data: formData }).subscribe(
        (res) => {
          this.showAlert(
            'alert alert-success',
            `Part data has been updated successfully. You'll be redirected to browse page!`,
            4000
          );
          setTimeout(() => {
            this.router.navigateByUrl('/browse');
          }, 4500);
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
  }

  /**
   * Delete Part Data by ID
   * @param partID
   */
  async confirmDeletePart(partID) {
    const title = 'Confirm Delete';
    const modelContent = `
    <p><strong>Are you sure you want to delete this part?</strong></p>
    <p>All information associated to this part will be permanently deleted.
    <span class="text-danger">This operation can not be undone.</span>
    </p>`;
    if ((await this.openConfirmModal(title, modelContent)) === 'ok') {
      this.partsService.deletePart(partID).subscribe(
        (res) => {
          this.showAlert(
            'alert alert-success',
            `Part data deleted successfully. You'll be redirected to browse page!`,
            3000
          );
          setTimeout(() => {
            this.router.navigateByUrl('/browse');
          }, 3500);
        },
        (err) => {
          this.showAlert(
            'alert alert-danger',
            'Error deleting part data, please try again!',
            4000
          );
        }
      );
    }
  }

  /**
   * Model Confirmation OK/CANCEL
   */
  openConfirmModal(title, modelContent) {
    const modalOptions: NgbModalOptions = {
      backdrop: 'static',
      backdropClass: 'customBackdrop',
      centered: true,
    };
    const modalRef = this.modalService.open(
      ConfirmModalComponent,
      modalOptions
    );
    modalRef.componentInstance.modal_title = title;
    modalRef.componentInstance.modal_content = modelContent;

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
   * Show Alert Message
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
