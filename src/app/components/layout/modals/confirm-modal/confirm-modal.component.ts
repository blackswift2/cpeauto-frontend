import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css'],
})
export class ConfirmModalComponent implements OnInit {
  @Input() modal_title;
  @Input() modal_content;
  @Input() modal_operation;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
}
