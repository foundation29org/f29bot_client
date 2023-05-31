import { Component} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Subscription';
import { OpenAiService } from 'app/shared/services/openAi.service';

@Component({
  selector: 'app-land-page',
  templateUrl: './land-page.component.html',
  styleUrls: ['./land-page.component.scss'],
  providers: [OpenAiService]
})

export class LandPageComponent {

  sending: boolean = false;
  private subscription: Subscription = new Subscription();

  query: string = '';
  queryCopy: string = '';
  responseLangchain: string = '';
  searchopenai: boolean = false;
  isComplexSearch: boolean = false;
  constructor(public translate: TranslateService, public toastr: ToastrService, private openAiService: OpenAiService) {
  }

  search() {
    console.log(this.query)
    console.log(this.isComplexSearch)
    this.sending = true;
    this.searchopenai = false;
    let query = { 
      "question": this.query, "isComplexSearch": this.isComplexSearch
   };
    this.responseLangchain = '';
    this.subscription.add(this.openAiService.postOpenAi3(query)
      .subscribe((res: any) => {
        console.log(res)
        if(res.data.indexOf("I don't know") !=-1 || res.data.indexOf("No sé") !=-1 ) {
          this.searchopenai = true;
          let value = { value: this.query, isComplexSearch: this.isComplexSearch };
          this.subscription.add(this.openAiService.postOpenAi(value)
            .subscribe((res: any) => {
              this.queryCopy = this.query;
              this.query = '';
              this.responseLangchain = res.choices[0].message.content;
              this.sending = false;
            }, (err) => {
              this.sending = false;
              console.log(err);
              this.toastr.error('', this.translate.instant("generics.error try again"));

            }));
        } else {
          this.sending = false;
          console.log('entra')
          this.queryCopy = this.query;
          this.query = '';
          this.responseLangchain = res.data;
          console.log(this.sending)
          
        }

      }, (err) => {
        this.sending = false;
        console.log(err);
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));

  }


}
