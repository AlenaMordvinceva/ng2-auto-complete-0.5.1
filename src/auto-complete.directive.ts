import {
    Directive,
    Input,
    Output,
    DynamicComponentLoader,
    ComponentRef,
    ViewContainerRef,
    EventEmitter,
    OnInit,
    Optional,
    Renderer,
    Host,
    SkipSelf
} from '@angular/core';
import {AutoCompleteComponent} from "./auto-complete.component";
import "rxjs/Rx"
import { ControlContainer, AbstractControl, FormGroup, FormControl } from "@angular/forms";

/**
 * display auto-complete section with input and dropdown list when it is clicked
 */
@Directive({
  selector: '[auto-complete], [ng2-auto-complete]',
  host: {
    '(click)': 'showAutoComplete()',
    '(focus)': 'showAutoComplete()'
  }
})
export class AutoCompleteDirective implements OnInit {

  @Input() placeholder: string;
  @Input('list-formatter') listFormatter: (arg: any) => void;
  //@Input('prefill-func') prefillFunc: function;
  @Input('source') source: any;
  @Input('path-to-data') pathToData: string;
  @Input('min-chars') minChars: number;
  @Input('value-property-name') valuePropertyName: string;
  @Input('display-property-name') displayPropertyName: string;
  @Input('accept-user-input') acceptUserInput: boolean;
  @Input('formControlName') formControlName: string;
  @Input('formControl') extFormControl: FormControl;

  @Input() ngModel: String;

  @Output() ngModelChange = new EventEmitter();
  @Output() valueChanged = new EventEmitter();

  public componentRef: Promise<ComponentRef<any>>;
  public el: HTMLElement;   // input or select element
  public acEl: HTMLElement; // auto complete element
  public inputEl: HTMLInputElement;  // input tag
  public formControl: AbstractControl;

  constructor(
      public dcl: DynamicComponentLoader,
      public viewContainerRef: ViewContainerRef,
      private renderer: Renderer,
      @Optional() @Host() @SkipSelf() private parentForm: ControlContainer
  ) {
    this.el = this.viewContainerRef.element.nativeElement;
  }

  ngOnInit(): void {
    // ...
    let divEl = document.createElement("div");
    divEl.className = 'ng2-auto-complete';
    divEl.style.display = 'inline-block';
    divEl.style.position = 'relative';
    this.el.parentElement.insertBefore(divEl, this.el.nextSibling);
    divEl.appendChild(this.el);

    this.selectNewValue(this.ngModel);

    if (this.parentForm && this.formControlName) {
      if (this.parentForm['form']) {
        this.formControl = (<FormGroup>this.parentForm['form']).get(this.formControlName);
      }
    } else if (this.extFormControl) {
      this.formControl = this.extFormControl;
    }

    document.addEventListener("click", this.hideAutoComplete);
  }

  //show auto-complete list below the current element
  showAutoComplete() {
    this.hideAutoComplete().then(() => {
      this.componentRef = this.dcl.loadNextToLocation(AutoCompleteComponent, this.viewContainerRef);
      this.componentRef.then( componentRef => {
        this.acEl = componentRef.location.nativeElement;

        let component = componentRef.instance;

        component.listFormatter = this.listFormatter;
        //component.prefillFunc = this.prefillFunc;
        component.pathToData = this.pathToData;
        component.minChars = this.minChars;
        component.valuePropertyName = this.valuePropertyName || 'id';
        component.displayPropertyName = this.displayPropertyName || 'value';
        component.source = this.source;
        component.acceptUserInput = this.acceptUserInput;
        component.placeholder = this.placeholder;
        component.valueSelected.subscribe(this.selectNewValue);
        // subscribe((val: any) => {
        //   if (typeof val !== "string") {
        //     let displayVal = val[component.displayPropertyName];
        //     val.toString = function() {return displayVal;}
        //   }
        //   this.ngModelChange.emit(val);
        //   if (this.valueChanged) {
        //     this.valueChanged(val);
        //     this.valueChanged.emit(val);
        //   }
        //   this.hideAutoComplete();
        // });

        component.inputChanged.subscribe(this.componentInputChanged);
        this.moveAutocompleteDropDownAfterInputEl();

        this.acEl = this.componentRef.location.nativeElement;
        this.acEl.style.display = "none";

        setTimeout(() => { // it needs time to run ngOnInit within component
          /* setting width/height auto complete */
          let thisElBCR = this.el.getBoundingClientRect();
          this.acEl.style.width = thisElBCR.width + 'px';
          this.acEl.style.position = 'absolute';
          this.acEl.style.zIndex = '1';
          this.acEl.style.top = '0';
          this.acEl.style.left = '0';
          this.acEl.style.display = 'inline-block';

          let thisInputElBCR = this.inputEl.getBoundingClientRect();

          this.renderer.setElementStyle(component.autoCompleteInput.nativeElement, 'width', `${thisInputElBCR.width}px`);
          this.renderer.setElementStyle(component.autoCompleteInput.nativeElement, 'height', `${thisInputElBCR.height}px`);
          this.renderer.invokeElementMethod(component.autoCompleteInput.nativeElement, 'focus');

          component.inputEl.style.width = (thisElBCR.width - 30) + 'px';
          component.inputEl.style.height = thisElBCR.height + 'px';
          component.inputEl.focus();

          component.closeToBottom = (thisInputElBCR.bottom + 100 > window.innerHeight);
        });

      })
    });

    document.addEventListener('click', event => {
      if (event.target !== this.el && event.target !== this.acEl) {
        this.hideAutoComplete();
      }
    });
  }

  hideAutoComplete(): Promise<any> {
    if (this.componentRef) {
      return this.componentRef.then( componentRef=> componentRef.destroy() );
    } else {
      return Promise.resolve(true);
    }
  }

  addToStringFunction(val: any): any {
    if (val && typeof val === "object") {
      let displayVal = val[this.displayPropertyName || "value"];
      val.toString = function () {
        return displayVal;
      }
    }
    return val;
  }

  selectNewValue = (val: any) => {
    if (val !== '') {
      val = this.addToStringFunction(val);
    }
    if ((this.parentForm && this.formControlName) || this.extFormControl) {
      if (!!val) {
        this.formControl.patchValue(val);
      }
    }
    (val !== this.ngModel) && this.ngModelChange.emit(val);
    this.valueChanged.emit(val);
    this.inputEl && (this.inputEl.value = '' + val);
    this.hideAutoComplete();
  };

  componentInputChanged = (val: string) => {
    if (this.acceptUserInput !== false) {
      this.inputEl.value = val;
      if ((this.parentForm && this.formControlName) || this.extFormControl) {
        this.formControl.patchValue(val);
      }
      (val !== this.ngModel) && this.ngModelChange.emit(val);
      this.valueChanged.emit(val);
    }
  };

  private moveAutocompleteDropDownAfterInputEl(): void {
    this.inputEl = <HTMLInputElement>this.el;
    if (this.el.tagName !== "INPUT" && this.acEl) {
      this.inputEl = <HTMLInputElement>this.el.querySelector("input");
      this.inputEl.parentElement.insertBefore(this.acEl, this.inputEl.nextSibling);
    }
  }

  styleAutoCompleteDropdown = () => {
    if (this.componentRef) {
      let component = this.componentRef.instance;

      /* setting width/height auto complete */
      let thisElBCR = this.el.getBoundingClientRect();
      this.acEl.style.width = thisElBCR.width + "px";
      this.acEl.style.position = "absolute";
      this.acEl.style.zIndex = "1";
      this.acEl.style.top = "0";
      this.acEl.style.left = "0";
      this.acEl.style.display = "inline-block";

      let thisInputElBCR = this.inputEl.getBoundingClientRect();

      // Not a good method of access the dom API directly.
      // Best to use Angular to access it for you and pass the values / methods you wish to get updated
      this.renderer.setElementStyle(component.autoCompleteInput.nativeElement, 'width', `${thisInputElBCR.width}px`);
      this.renderer.setElementStyle(component.autoCompleteInput.nativeElement, 'height', `${thisInputElBCR.height}px`);
      this.renderer.invokeElementMethod(component.autoCompleteInput.nativeElement, 'focus');
      component.closeToBottom = (thisInputElBCR.bottom + 100 > window.innerHeight);
    }
  };

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.instance.inputChanged.unsubscribe();
    }
    document.removeEventListener("click", this.hideAutoComplete);
  }
}