import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaqService } from '../../core/services/faq.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { IFaq } from '../../core/models/faq.model';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-faq-manage',
  styleUrl: './faq-manage.css',
  templateUrl: './faq-manage.html',
})
export class FaqManage implements OnInit{
  private _faqService = inject(FaqService);
  private _confirmService = inject(ConfirmService);
  private _toast = inject(ToastService);
  private _cdr = inject(ChangeDetectorRef);

  faqs: IFaq[] = [];
  loading = true;
  saving = false;
  errorMessage = '';
  editing: IFaq | null = null;

  form = new FormGroup({
    question: new FormControl('',Validators.required),
    answer: new FormControl('',Validators.required)
  });

  ngOnInit(): void {
    this.load();
  }

  load(){
    this._faqService.getAllFaqs().subscribe({
      next:(res)=>{
        this.faqs = res.data;
        this.loading = false;
        this._cdr.markForCheck();
      },
      error:(err)=>{
        this.errorMessage = getErrorMessage(err);
        this.loading = false;
        this._cdr.markForCheck();
      }
    });
  }

  edit(f:IFaq){
    this.editing = f;
    this.form.reset({question:f.question, answer:f.answer});
    window.scrollTo({top:0,behavior:'smooth'});
  }

  cancel(){
    this.editing = null;
    this.form.reset({question:'', answer:''});
  }

  save(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }
    const body = {question:this.form.value.question as string, answer:this.form.value.answer as string};
    this.saving = true;
    const request = this.editing
      ? this._faqService.updateFaq(this.editing._id, body)
      : this._faqService.addFaq(body);
    request.subscribe({
      next:()=>{
        this.saving = false;
        this._toast.show(this.editing ? 'Question updated' : 'Question added','success');
        this.cancel();
        this.load();
      },
      error:(err)=>{
        this.saving = false;
        this._toast.show(getErrorMessage(err),'error');
        this._cdr.markForCheck();
      }
    });
  }

  remove(f:IFaq){
    this._confirmService.ask({
      title:'Delete this question?',
      message:'"' + f.question + '" will disappear from the FAQ page.',
      confirmText:'Delete',
      danger:true
    }).subscribe((yes)=>{
      if(!yes){
        return;
      }
      this._faqService.deleteFaq(f._id).subscribe({
        next:()=>{
          this._toast.show('Question deleted','success');
          this.load();
        },
        error:(err)=>this._toast.show(getErrorMessage(err),'error')
      });
    });
  }
}
