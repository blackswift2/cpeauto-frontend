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
  private partNumberCopy = '';

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
        this.partNumberCopy = data.part_number;
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
    //Trim white spaces
    Object.keys(formData).forEach(
      (key) => (formData[key] = formData[key].trim())
    );
    this.partsService.createPart({ data: formData }).subscribe(
      (res) => {
        this.addPartsForm.reset();
        this.showAlert(
          'alert alert-success',
          'Part has been added successfully!',
          4000
        );
      },
      (error) => {
        const errorMessage =
          error.status === 409
            ? 'Part number already exists, please try again!'
            : 'Error adding part, please try again!';
        this.showAlert('alert alert-danger', errorMessage, 4000);
      }
    );
  }

  /**
   * Update Part Data by ID
   * @param partID
   * @param formData
   */
  async updatePartData(partID, formData) {
    //Trim white spaces
    Object.keys(formData).forEach(
      (key) => (formData[key] = formData[key].trim())
    );
    const title = 'Change Part Number?';
    const modelContent = '<p>These typically do not require editing.</p>';
    const modelOperation = 'update';
    const checkToShowModal = this.partNumberCopy !== formData.part_number; // Show confirmation dialog only on change part dialog
    if (
      checkToShowModal &&
      (await this.openConfirmModal(title, modelContent, modelOperation)) ===
        'ok'
    ) {
      this.proceedUpdatePartData(partID, formData);
    } else {
      this.proceedUpdatePartData(partID, formData);
    }
  }

  proceedUpdatePartData(partID, formData) {
    this.partsService.updatePartById(partID, { data: formData }).subscribe(
      (res) => {
        this.showAlert(
          'alert alert-success',
          'Part data successfully saved.',
          4000
        );
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
   * Delete Part Data by ID
   * @param partID
   */
  async confirmDeletePart(partID) {
    const title = 'Confirm Delete';
    const modalContent = `
    <p><strong>Are you sure you want to delete the selected part(s)?</strong></p>
    <p>All information associated will be permanently deleted.
    <span class="text-danger">This operation can not be undone.</span>
    </p>`;
    const modelOperation = 'delete';

    if (
      (await this.openConfirmModal(title, modalContent, modelOperation)) ===
      'ok'
    ) {
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
  openConfirmModal(title, modelContent, modelOperation) {
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
    modalRef.componentInstance.modal_operation = modelOperation;
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
