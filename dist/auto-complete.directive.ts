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
    SkipSelf,
    ComponentResolver,
    ComponentFactory,
    SimpleChange
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
    '(click)': 'showAutoCompleteDropdown()',
  }
})
export class AutoCompleteDirective implements OnInit {

  @Input('auto-complete-placeholder') public autoCompletePlaceholder: string;
  @Input('list-formatter') public listFormatter: (arg: any) => string;
  @Input('source') public source: any;
  @Input('path-to-data') public pathToData: string;
  @Input('min-chars') public minChars: number;
  @Input('value-property-name') public valuePropertyName: string;
  @Input('display-property-name') public displayPropertyName: string;
  @Input('blank-option-text') public blankOptionText: string;
  @Input('no-match-found-text') public noMatchFoundText: string;
  @Input('accept-user-input') public acceptUserInput: boolean;
  @Input('loading-text') public loadingText: string = "Loading";
  @Input('max-num-list') public maxNumList: string;
  @Input('formControlName') public formControlName: string;
  @Input('formControl') public extFormControl: FormControl;
  @Input() public ngModel: String;

  @Output() public ngModelChange = new EventEmitter();
  @Output() public valueChanged = new EventEmitter();

  public componentRef: ComponentRef<AutoCompleteComponent>;
  public el: HTMLElement;   // input element
  public acDropdownEl: HTMLElement; // auto complete element
  public inputEl: HTMLInputElement;  // input tag
  public formControl: AbstractControl;

  constructor(
      public dcl: DynamicComponentLoader,
      private resolver: ComponentResolver,
      public viewContainerRef: ViewContainerRef,
      private renderer: Renderer,
      @Optional() @Host() @SkipSelf() private parentForm: ControlContainer
  ) {
    this.el = this.viewContainerRef.element.nativeElement;
  }

  public ngOnInit(): void {
    // ...
    let divEl = document.createElement("div");
    divEl.className = 'ng2-auto-complete';
    divEl.style.position = 'relative';
    this.el.parentElement.insertBefore(divEl, this.el.nextSibling);
    divEl.appendChild(this.el);

    this.selectNewValue(this.ngModel);

    if (this.parentForm && this.formControlName) {
      if (this.parentForm['form']) {
        this.formControl = (<FormGroup>this.parentForm['form']).find(this.formControlName);
      }
    } else if (this.extFormControl) {
      this.formControl = this.extFormControl;
    }

    document.addEventListener("click", this.hideAutoCompleteDropdown);
  }

  public ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.instance.valueSelected.unsubscribe();
      this.componentRef.instance.inputChanged.unsubscribe();
    }
    document.removeEventListener("click", this.hideAutoCompleteDropdown);
  }

  public ngOnChanges(changes: {[propName: string]: SimpleChange}): void {
    if (changes['ngModel']) {
      this.ngModel = this.addToStringFunction(changes['ngModel'].currentValue);
    }
  }

  //show auto-complete list below the current element
  public showAutoCompleteDropdown() {

    this.hideAutoCompleteDropdown();

    this.resolver.resolveComponent(AutoCompleteComponent).then((factory: ComponentFactory<AutoCompleteComponent>) => {

      this.componentRef = this.viewContainerRef.createComponent(factory);

      let component = this.componentRef.instance;
      component.listFormatter = this.listFormatter;
      component.pathToData = this.pathToData;
      component.minChars = this.minChars;
      component.valuePropertyName = this.valuePropertyName || "id";
      component.displayPropertyName = this.displayPropertyName || "value";
      component.source = this.source;
      component.placeholder = this.autoCompletePlaceholder;
      component.blankOptionText = this.blankOptionText;
      component.noMatchFoundText = this.noMatchFoundText;
      component.acceptUserInput = this.acceptUserInput;
      component.loadingText = this.loadingText;
      component.maxNumList = parseInt(this.maxNumList, 10);

      component.valueSelected.subscribe(this.selectNewValue);
      component.inputChanged.subscribe(this.componentInputChanged);

      this.acDropdownEl = this.componentRef.location.nativeElement;
      //this.acDropdownEl.style.display = "none";
    });

    this.moveAutocompleteDropDownAfterInputEl();
    setTimeout(this.styleAutoCompleteDropdown);
  };

  public hideAutoCompleteDropdown = (event?: any): void => {
    if (this.componentRef) {
      if (
          event && event.type === "click" &&
          event.target.tagName !== "INPUT" && !this.elementIn(event.target, this.acDropdownEl)
      ) {
        this.componentRef.destroy();
        this.componentRef = undefined;
      } else if (!event) {
        this.componentRef.destroy();
        this.componentRef = undefined;
      }
    }
  };

  public styleAutoCompleteDropdown = () => {
    if (this.componentRef) {
      let component = this.componentRef.instance;

      let thisElBCR = this.el.getBoundingClientRect();
      this.acDropdownEl.style.width = thisElBCR.width + "px";
      this.acDropdownEl.style.position = "absolute";
      this.acDropdownEl.style.zIndex = "1";
      this.acDropdownEl.style.top = "0";
      this.acDropdownEl.style.left = "0";
      this.acDropdownEl.style.display = "inline-block";

      let thisInputElBCR = this.inputEl.getBoundingClientRect();

      this.renderer.setElementStyle(component.autoCompleteInput.nativeElement, 'width', `${thisInputElBCR.width}px`);
      this.renderer.setElementStyle(component.autoCompleteInput.nativeElement, 'height', `${thisInputElBCR.height}px`);
      this.renderer.invokeElementMethod(component.autoCompleteInput.nativeElement, 'focus');
      component.closeToBottom = (thisInputElBCR.bottom + 100 > window.innerHeight);
    }
  };

  public addToStringFunction(val: any): any {
    if (val && typeof val === "object") {
      let displayVal = val[this.displayPropertyName || "value"];
      val.toString = function () {
        return displayVal;
      }
    }
    return val;
  }

  public componentInputChanged = (val: string) => {
    if (this.acceptUserInput !== false) {
      this.inputEl.value = val;
      if ((this.parentForm && this.formControlName) || this.extFormControl) {
        this.formControl.patchValue(val);
      }
      (val !== this.ngModel) && this.ngModelChange.emit(val);
      this.valueChanged.emit(val);
    }
  };

  public selectNewValue = (val: any) => {
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
    this.hideAutoCompleteDropdown();
  };

  private moveAutocompleteDropDownAfterInputEl(): void {
    this.inputEl = <HTMLInputElement>this.el;
    if (this.el.tagName !== "INPUT" && this.acDropdownEl) {
      this.inputEl = <HTMLInputElement>this.el.querySelector("input");
      this.inputEl.parentElement.insertBefore(this.acDropdownEl, this.inputEl.nextSibling);
    }
  }

  private elementIn(el: Node, containerEl: Node): boolean {
    while (el = el.parentNode) {
      if (el === containerEl) {
        return true;
      }
    }
    return false;
  }
}