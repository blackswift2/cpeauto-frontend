import { Component, OnInit, NgZone } from '@angular/core';
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
  public Title;
  public buttonText;
  public alertClass = '';
  public alertMessage = '';

  constructor(
    public fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private partsService: PartsService,
    public modalService: NgbModal
  ) {}

  ngOnInit() {
    let paramId = this.activatedRoute.snapshot.paramMap.get('id');
    this.initializeForm();

    if (!paramId) {
      this.Title = 'Add Part';
      this.buttonText = 'Save';
    } else {
      this.Title = 'Edit Part';
      this.buttonText = 'Update';
      this.getPartById(paramId);
    }
  }

  initializeForm() {
    this.addPartsForm = this.fb.group({
      part_number: ['', [Validators.required]],
      description_en: [''],
      description_es: [''],
      description_fr: [''],
      quantity: ['0'],
    });
  }
  // Getter to access form control
  get myaddPartsForm() {
    return this.addPartsForm.controls;
  }

  onSubmit() {
    if (!this.addPartsForm.valid) {
      return false;
    } else {
      let paramId = this.activatedRoute.snapshot.paramMap.get('id');
      if (this.addPartsForm.value.quantity === '') {
        this.addPartsForm.value.quantity === 0;
      }
      if (!paramId) {
        this.createPartData(this.addPartsForm.value);
      } else if (paramId) {
        this.openConfirmModal(paramId, this.addPartsForm.value);
      }
    }
  }

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

  getPartById(id) {
    this.partsService.getPartById(id).subscribe((data) => {
      this.addPartsForm.setValue({
        part_number: data['part_number'],
        description_en: data['description_en'],
        description_es: data['description_es'],
        description_fr: data['description_fr'],
        quantity: data['quantity'],
      });
    });
  }

  updatePartData(partID, formData) {
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

  /** Modal Confirmation */

  openConfirmModal(partID, partData) {
    const modalOptions: NgbModalOptions = {
      backdrop: 'static',
      backdropClass: 'customBackdrop',
      centered: true,
    };
    const modalRef = this.modalService.open(
      ConfirmModalComponent,
      modalOptions
    );
    modalRef.componentInstance.modal_title = 'Confirm Update';
    modalRef.componentInstance.modal_content = `
    <p><strong>Are you sure you want to update this part data?</strong></p>
    <p>All information associated to this part will be updated.
    <span class="text-danger">This operation can not be undone.</span>
    </p>`;

    modalRef.result.then(
      (result) => {
        if (result === 'ok') {
          this.updatePartData(partID, partData);
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
