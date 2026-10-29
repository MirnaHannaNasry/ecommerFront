import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  imports: [AsyncPipe],
  selector: 'app-confirm-modal',
  styleUrl: './confirm-modal.css',
  templateUrl: './confirm-modal.html',
})
export class ConfirmModal {
  private _confirmService = inject(ConfirmService);
  state$ = this._confirmService.getState();
}
