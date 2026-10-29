import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaqService } from '../../core/services/faq.service';
import { IFaq } from '../../core/models/faq.model';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [RouterLink],
  selector: 'app-faq',
  styleUrl: './faq.css',
  templateUrl: './faq.html',
})
export class Faq implements OnInit{
  private _faqService = inject(FaqService);
  private _cdr = inject(ChangeDetectorRef);

  faqs: IFaq[] = [];
  loading = true;
  errorMessage = '';
  search = '';
  openId = '';          // the question that is open (one at a time)

  ngOnInit(): void {
    this._faqService.getAllFaqs().subscribe({
      next:(res)=>{
        this.faqs = res.data;
        this.loading = false;
        this._cdr.markForCheck();
      },
      error:(err)=>{
        this.errorMessage = getErrorMessage(err,'Could not load the questions');
        this.loading = false;
        this._cdr.markForCheck();
      }
    });
  }

  // the search box filters the questions and answers
  get filtered(){
    const text = this.search.trim().toLowerCase();
    if(!text){
      return this.faqs;
    }
    return this.faqs.filter(f=> f.question.toLowerCase().includes(text) || f.answer.toLowerCase().includes(text));
  }

  toggle(id:string){
    this.openId = this.openId === id ? '' : id;
  }
}
