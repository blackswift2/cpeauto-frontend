import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { PartsService } from './../../../../services/PartsService';

@Component({
  selector: 'app-addparts',
  templateUrl: './addparts.component.html',
  styleUrls: ['./addparts.component.css'],
})
export class AddpartsComponent implements OnInit {
  public addPartsForm: FormGroup;
  public Title;
  public buttonText;

  constructor(
    public fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private partsService: PartsService
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
      if (!paramId) {
        this.partsService
          .createPart({ data: this.addPartsForm.value })
          .subscribe(
            (res) => {
              console.log('Part successfully created!', res);
              this.ngZone.run(() => this.router.navigateByUrl('/browse'));
            },
            (error) => {
              console.log(error);
            }
          );
      } else if (paramId) {
        this.partsService
          .updatePartById(paramId, { data: this.addPartsForm.value })
          .subscribe(
            (res) => {
              this.router.navigateByUrl('/browse');
              console.log('Content updated successfully!');
            },
            (error) => {
              console.log(error);
            }
          );
      }
    }
  }

  getPartById(id) {
    this.partsService.getPartById(id).subscribe((data) => {
      this.addPartsForm.setValue({
        part_number: data['part_number'],
        description_en: data['description_en'],
        description_es: data['description_es'],
        description_fr: data['description_fr'],
      });
    });
  }
}
