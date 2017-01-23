import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewEncapsulation,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { AutoComplete } from './auto-complete';

@Component({
  selector: 'auto-complete',
  template: `
  <div class="auto-complete">

    <!-- keyword input -->
    <input #autoCompleteInput class="keyword"
           placeholder="{{placeholder}}"
           (focus)="showDropdownList()"
           (blur)="hideDropdownList()"
           (keydown)="inputElKeyHandler($event)"
           (input)="reloadListInDelay()"
           [(ngModel)]="keyword" />

    <!-- dropdown that user can select -->
    <ul *ngIf="dropdownVisible"
        [style.bottom]="inputEl.style.height"
        [style.position]="closeToBottom ? 'absolute': ''">
      <li *ngIf="isLoading" class="loading">{{loadingText}}</li>
      <li *ngIf="minCharsEntered && !isLoading && !filteredList.length"
           (mousedown)="selectOne('')"
           class="blank-item">{{noMatchFoundText || 'No Result Found'}}</li>
      <li *ngIf="blankOptionText && filteredList.length"
          (mousedown)="selectOne('')"
          class="blank-item">{{blankOptionText}}</li>
      <li class="item"
          *ngFor="let item of filteredList; let i=index"
          (mousedown)="selectOne(item)"
          [ngClass]="{selected: i === itemIndex}"
          [innerHtml]="getFormattedList(item)">
      </li>
    </ul>
  </div>`,
  providers: [ AutoComplete ],
  styles: [`
  @keyframes slideDown {
    0% {
      transform:  translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
  .auto-complete input {
    outline: none;
    border: 2px solid transparent;
    border-width: 3px 2px;
    margin: 0;
    box-sizing: border-box;
    background-clip: content-box;
  }
  .auto-complete ul {
    background-color: #fff;
    margin: 0;
    width : 100%;
    overflow-y: auto;
    list-style-type: none;
    padding: 0;
    border: 1px solid #ccc;
    box-sizing: border-box;
    animation: slideDown 0.1s;
  }
  .auto-complete ul li {
    padding: 2px 5px;
    border-bottom: 1px solid #eee;
  }
  .auto-complete ul li.selected {
    background-color: #ccc;
  }
  .auto-complete ul li:last-child {
    border-bottom: none;
  }
  .auto-complete ul li:hover {
    background-color: #ccc;
  }
`],
  encapsulation: ViewEncapsulation.None
})
export class AutoCompleteComponent implements OnInit {

  /**
   * public variables
   */
  @Input('list-formatter') public listFormatter: (arg: any) => string;
  @Input('source') public source: any;
  @Input('path-to-data') public pathToData: string;
  @Input('min-chars') public minChars: number = 0;
  @Input('value-property-name') public valuePropertyName: string = 'id';
  @Input('display-property-name') public displayPropertyName: string = 'value';
  @Input('placeholder') public placeholder: string;
  @Input('blank-option-text') public blankOptionText: string;
  @Input('no-match-found-text') public noMatchFoundText: string;
  @Input('accept-user-input') public acceptUserInput: boolean;
  @Input('loading-text') public loadingText: string = "Loading";
  @Input('max-num-list') public maxNumList: number;

  @Output() public inputChanged = new EventEmitter();
  @Output() public valueSelected = new EventEmitter();
  @ViewChild('autoCompleteInput') autoCompleteInput: ElementRef;

  public el: HTMLElement;
  public inputEl: HTMLInputElement;
  public userInputEl: any;      // directive element that called this element `<input ng2-auto-complete>`
  public userInputElTabIndex: any;

  public closeToBottom: boolean = false;
  public dropdownVisible: boolean = false;
  public isLoading: boolean = false;

  public filteredList: any[] = [];
  public itemIndex: number = 0;
  public keyword: string;
  public minCharsEntered: boolean = false;

  public isSrcArr(): boolean {
    return (this.source.constructor.name === "Array");
  }

  constructor(
      public elementRef: ElementRef,
      public autoComplete: AutoComplete
  ) {
    this.el = elementRef.nativeElement;
  }

  public ngOnInit(): void {
    this.inputEl = <HTMLInputElement>(this.el.querySelector("input"));
    this.userInputEl = this.el.parentElement.querySelector("input");
    this.autoComplete.source = this.source;
    this.autoComplete.pathToData = this.pathToData;
  }

  public reloadListInDelay(): void {
    let delayMs = this.isSrcArr() ? 10 : 500;
    let keyword = this.inputEl.value;

    // executing after user stopped typing
    this.delay(() => this.reloadList(keyword), delayMs);
    this.inputChanged.emit(keyword);
  }

  public showDropdownList(): void {
    this.keyword = this.userInputEl.value;
    this.inputEl.style.display = '';
    this.inputEl.focus();

    this.userInputElTabIndex = this.userInputEl['tabIndex'];
    this.userInputEl['tabIndex'] = -100;  //disable tab focus for <shift-tab> pressed

    this.reloadList(this.keyword);
  }

  public hideDropdownList(): void {
    this.inputEl.style.display = 'none';
    this.dropdownVisible = false;
    this.userInputEl['tabIndex'] = this.userInputElTabIndex; // enable tab focus
  }

  public reloadList(keyword: string): void {

    this.filteredList = [];
    if (keyword.length < (this.minChars || 0)) {
      this.minCharsEntered = false;
      return;
    } else {
      this.minCharsEntered = true;
    }

    this.dropdownVisible = true;

    if (this.isSrcArr()) {    // local source
      this.isLoading = false;
      this.filteredList = this.autoComplete.filter(this.source, this.keyword);
      if (this.maxNumList) {
        this.filteredList = this.filteredList.slice(0, this.maxNumList);
      }
    } else {                 // remote source
      this.isLoading = true;

      if (typeof this.source === "function") {
        // custom function that returns observable
        this.source(keyword).subscribe(
            resp => {

              if (this.pathToData) {
                let paths = this.pathToData.split(".");
                paths.forEach(prop => resp = resp[prop]);
              }

              this.filteredList = resp;
              if (this.maxNumList) {
                this.filteredList = this.filteredList.slice(0, this.maxNumList);
              }
            },
            error => null,
            () => this.isLoading = false // complete
        );
      } else {
        // remote source

        this.autoComplete.getRemoteData(keyword).subscribe(resp => {
              this.filteredList = (<any>resp);
              if (this.maxNumList) {
                this.filteredList = this.filteredList.slice(0, this.maxNumList);
              }
            },
            error => null,
            () => this.isLoading = false // complete
        );
      }
    }
  }

  public selectOne(data: any) {
    this.hideDropdownList();
    this.valueSelected.emit(data);
  };

  public inputElKeyHandler(evt: any) {
    let totalNumItem = this.filteredList.length;

    switch (evt.keyCode) {
      case 27: // ESC, hide auto complete
        this.hideDropdownList();
        break;

      case 38: // UP, select the previous li el
        this.itemIndex = (totalNumItem + this.itemIndex - 1) % totalNumItem;
        break;

      case 40: // DOWN, select the next li el or the first one
        this.dropdownVisible = true;
        this.itemIndex = (totalNumItem + this.itemIndex + 1) % totalNumItem;
        break;

      case 13: // ENTER, choose it!!
        if (this.filteredList.length > 0) {
          this.selectOne(this.filteredList[this.itemIndex]);
        }
        evt.preventDefault();
        break;
    }
  };

  public getFormattedList(data: any): string {
    let formatter = this.listFormatter || this.defaultListFormatter;
    return formatter.apply(this, [data]);
  }

  private defaultListFormatter(data: any): string {
    let html: string = "";
    html += data[this.valuePropertyName] ? `<b>(${data[this.valuePropertyName]})</b>` : "";
    html += data[this.displayPropertyName] ? `<span>${data[this.displayPropertyName]}</span>` : data;
    return html;
  }

  private delay = (function () {
    let timer = 0;
    return function (callback: any, ms: number) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();

}
