import { ElementRef, OnInit, EventEmitter } from '@angular/core';
import { AutoComplete } from './auto-complete';
export declare class AutoCompleteComponent implements OnInit {
    elementRef: ElementRef;
    autoComplete: AutoComplete;
    /**
     * public variables
     */
    listFormatter: (arg: any) => string;
    source: any;
    pathToData: string;
    minChars: number;
    valuePropertyName: string;
    displayPropertyName: string;
    placeholder: string;
    blankOptionText: string;
    noMatchFoundText: string;
    acceptUserInput: boolean;
    loadingText: string;
    maxNumList: number;
    inputChanged: EventEmitter<{}>;
    valueSelected: EventEmitter<{}>;
    autoCompleteInput: ElementRef;
    el: HTMLElement;
    inputEl: HTMLInputElement;
    userInputEl: any;
    userInputElTabIndex: any;
    closeToBottom: boolean;
    dropdownVisible: boolean;
    isLoading: boolean;
    filteredList: any[];
    itemIndex: number;
    keyword: string;
    minCharsEntered: boolean;
    isSrcArr(): boolean;
    constructor(elementRef: ElementRef, autoComplete: AutoComplete);
    ngOnInit(): void;
    reloadListInDelay(): void;
    showDropdownList(): void;
    hideDropdownList(): void;
    reloadList(keyword: string): void;
    selectOne(data: any): void;
    inputElKeyHandler(evt: any): void;
    getFormattedList(data: any): string;
    private defaultListFormatter(data);
    private delay;
}
