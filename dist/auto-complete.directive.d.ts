import { DynamicComponentLoader, ComponentRef, ViewContainerRef, EventEmitter, OnInit, Renderer, ComponentResolver, SimpleChange } from '@angular/core';
import { AutoCompleteComponent } from "./auto-complete.component";
import "rxjs/Rx";
import { ControlContainer, AbstractControl, FormControl } from "@angular/forms";
/**
 * display auto-complete section with input and dropdown list when it is clicked
 */
export declare class AutoCompleteDirective implements OnInit {
    dcl: DynamicComponentLoader;
    private resolver;
    viewContainerRef: ViewContainerRef;
    private renderer;
    private parentForm;
    autoCompletePlaceholder: string;
    listFormatter: (arg: any) => string;
    source: any;
    pathToData: string;
    minChars: number;
    valuePropertyName: string;
    displayPropertyName: string;
    blankOptionText: string;
    noMatchFoundText: string;
    acceptUserInput: boolean;
    loadingText: string;
    maxNumList: string;
    formControlName: string;
    extFormControl: FormControl;
    ngModel: String;
    ngModelChange: EventEmitter<{}>;
    valueChanged: EventEmitter<{}>;
    componentRef: ComponentRef<AutoCompleteComponent>;
    el: HTMLElement;
    acDropdownEl: HTMLElement;
    inputEl: HTMLInputElement;
    formControl: AbstractControl;
    constructor(dcl: DynamicComponentLoader, resolver: ComponentResolver, viewContainerRef: ViewContainerRef, renderer: Renderer, parentForm: ControlContainer);
    ngOnInit(): void;
    ngOnDestroy(): void;
    ngOnChanges(changes: SimpleChange): void;
    showAutoCompleteDropdown(): void;
    hideAutoCompleteDropdown: (event?: any) => void;
    styleAutoCompleteDropdown: () => void;
    addToStringFunction(val: any): any;
    componentInputChanged: (val: string) => void;
    selectNewValue: (val: any) => void;
    private moveAutocompleteDropDownAfterInputEl();
    private elementIn(el, containerEl);
}
