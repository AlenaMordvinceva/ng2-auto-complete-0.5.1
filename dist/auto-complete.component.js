"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var auto_complete_1 = require('./auto-complete');
var AutoCompleteComponent = (function () {
    function AutoCompleteComponent(elementRef, autoComplete) {
        this.elementRef = elementRef;
        this.autoComplete = autoComplete;
        this.minChars = 0;
        this.valuePropertyName = 'id';
        this.displayPropertyName = 'value';
        this.loadingText = "Loading";
        this.inputChanged = new core_1.EventEmitter();
        this.valueSelected = new core_1.EventEmitter();
        this.closeToBottom = false;
        this.dropdownVisible = false;
        this.isLoading = false;
        this.filteredList = [];
        this.itemIndex = 0;
        this.minCharsEntered = false;
        this.delay = (function () {
            var timer = 0;
            return function (callback, ms) {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })();
        this.el = elementRef.nativeElement;
    }
    AutoCompleteComponent.prototype.isSrcArr = function () {
        return (this.source.constructor.name === "Array");
    };
    AutoCompleteComponent.prototype.ngOnInit = function () {
        this.inputEl = (this.el.querySelector("input"));
        this.userInputEl = this.el.parentElement.querySelector("input");
        this.autoComplete.source = this.source;
        this.autoComplete.pathToData = this.pathToData;
    };
    AutoCompleteComponent.prototype.reloadListInDelay = function () {
        var _this = this;
        var delayMs = this.isSrcArr() ? 10 : 500;
        var keyword = this.inputEl.value;
        // executing after user stopped typing
        this.delay(function () { return _this.reloadList(keyword); }, delayMs);
        this.inputChanged.emit(keyword);
    };
    AutoCompleteComponent.prototype.showDropdownList = function () {
        this.keyword = this.userInputEl.value;
        this.inputEl.style.display = '';
        this.inputEl.focus();
        this.userInputElTabIndex = this.userInputEl['tabIndex'];
        this.userInputEl['tabIndex'] = -100; //disable tab focus for <shift-tab> pressed
        this.reloadList(this.keyword);
    };
    AutoCompleteComponent.prototype.hideDropdownList = function () {
        this.inputEl.style.display = 'none';
        this.dropdownVisible = false;
        this.userInputEl['tabIndex'] = this.userInputElTabIndex; // enable tab focus
    };
    AutoCompleteComponent.prototype.reloadList = function (keyword) {
        var _this = this;
        this.filteredList = [];
        if (keyword.length < (this.minChars || 0)) {
            this.minCharsEntered = false;
            return;
        }
        else {
            this.minCharsEntered = true;
        }
        this.dropdownVisible = true;
        if (this.isSrcArr()) {
            this.isLoading = false;
            this.filteredList = this.autoComplete.filter(this.source, this.keyword);
            if (this.maxNumList) {
                this.filteredList = this.filteredList.slice(0, this.maxNumList);
            }
        }
        else {
            this.isLoading = true;
            if (typeof this.source === "function") {
                // custom function that returns observable
                this.source(keyword).subscribe(function (resp) {
                    if (_this.pathToData) {
                        var paths = _this.pathToData.split(".");
                        paths.forEach(function (prop) { return resp = resp[prop]; });
                    }
                    _this.filteredList = resp;
                    if (_this.maxNumList) {
                        _this.filteredList = _this.filteredList.slice(0, _this.maxNumList);
                    }
                }, function (error) {
                    null, function (any) { return _this.isLoading = false; };
                });
            }
            else {
                // remote source
                this.autoComplete.getRemoteData(keyword).subscribe(function (resp) {
                    _this.filteredList = resp;
                    if (_this.maxNumList) {
                        _this.filteredList = _this.filteredList.slice(0, _this.maxNumList);
                    }
                }, function (error) { return null; }, function () { return _this.isLoading = false; } // complete
                 // complete
                );
            }
        }
    };
    AutoCompleteComponent.prototype.selectOne = function (data) {
        this.hideDropdownList();
        this.valueSelected.emit(data);
    };
    ;
    AutoCompleteComponent.prototype.inputElKeyHandler = function (evt) {
        var totalNumItem = this.filteredList.length;
        switch (evt.keyCode) {
            case 27:
                this.hideDropdownList();
                break;
            case 38:
                this.itemIndex = (totalNumItem + this.itemIndex - 1) % totalNumItem;
                break;
            case 40:
                this.dropdownVisible = true;
                this.itemIndex = (totalNumItem + this.itemIndex + 1) % totalNumItem;
                break;
            case 13:
                if (this.filteredList.length > 0) {
                    this.selectOne(this.filteredList[this.itemIndex]);
                }
                evt.preventDefault();
                break;
        }
    };
    ;
    AutoCompleteComponent.prototype.getFormattedList = function (data) {
        var formatter = this.listFormatter || this.defaultListFormatter;
        return formatter.apply(this, [data]);
    };
    AutoCompleteComponent.prototype.defaultListFormatter = function (data) {
        var html = "";
        html += data[this.valuePropertyName] ? "<b>(" + data[this.valuePropertyName] + ")</b>" : "";
        html += data[this.displayPropertyName] ? "<span>" + data[this.displayPropertyName] + "</span>" : data;
        return html;
    };
    __decorate([
        core_1.Input('list-formatter'), 
        __metadata('design:type', Function)
    ], AutoCompleteComponent.prototype, "listFormatter", void 0);
    __decorate([
        core_1.Input('source'), 
        __metadata('design:type', Object)
    ], AutoCompleteComponent.prototype, "source", void 0);
    __decorate([
        core_1.Input('path-to-data'), 
        __metadata('design:type', String)
    ], AutoCompleteComponent.prototype, "pathToData", void 0);
    __decorate([
        core_1.Input('min-chars'), 
        __metadata('design:type', Number)
    ], AutoCompleteComponent.prototype, "minChars", void 0);
    __decorate([
        core_1.Input('value-property-name'), 
        __metadata('design:type', String)
    ], AutoCompleteComponent.prototype, "valuePropertyName", void 0);
    __decorate([
        core_1.Input('display-property-name'), 
        __metadata('design:type', String)
    ], AutoCompleteComponent.prototype, "displayPropertyName", void 0);
    __decorate([
        core_1.Input('placeholder'), 
        __metadata('design:type', String)
    ], AutoCompleteComponent.prototype, "placeholder", void 0);
    __decorate([
        core_1.Input('blank-option-text'), 
        __metadata('design:type', String)
    ], AutoCompleteComponent.prototype, "blankOptionText", void 0);
    __decorate([
        core_1.Input('no-match-found-text'), 
        __metadata('design:type', String)
    ], AutoCompleteComponent.prototype, "noMatchFoundText", void 0);
    __decorate([
        core_1.Input('accept-user-input'), 
        __metadata('design:type', Boolean)
    ], AutoCompleteComponent.prototype, "acceptUserInput", void 0);
    __decorate([
        core_1.Input('loading-text'), 
        __metadata('design:type', String)
    ], AutoCompleteComponent.prototype, "loadingText", void 0);
    __decorate([
        core_1.Input('max-num-list'), 
        __metadata('design:type', Number)
    ], AutoCompleteComponent.prototype, "maxNumList", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], AutoCompleteComponent.prototype, "inputChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], AutoCompleteComponent.prototype, "valueSelected", void 0);
    __decorate([
        core_1.ViewChild('autoCompleteInput'), 
        __metadata('design:type', core_1.ElementRef)
    ], AutoCompleteComponent.prototype, "autoCompleteInput", void 0);
    AutoCompleteComponent = __decorate([
        core_1.Component({
            selector: 'auto-complete',
            template: "\n  <div class=\"auto-complete\">\n\n    <!-- keyword input -->\n    <input #autoCompleteInput class=\"keyword\"\n           placeholder=\"{{placeholder}}\"\n           (focus)=\"showDropdownList()\"\n           (blur)=\"hideDropdownList()\"\n           (keydown)=\"inputElKeyHandler($event)\"\n           (input)=\"reloadListInDelay()\"\n           [(ngModel)]=\"keyword\" />\n\n    <!-- dropdown that user can select -->\n    <ul *ngIf=\"dropdownVisible\"\n        [style.bottom]=\"inputEl.style.height\"\n        [style.position]=\"closeToBottom ? 'absolute': ''\">\n      <li *ngIf=\"isLoading\" class=\"loading\">{{loadingText}}</li>\n      <li *ngIf=\"minCharsEntered && !isLoading && !filteredList.length\"\n           (mousedown)=\"selectOne('')\"\n           class=\"blank-item\">{{noMatchFoundText || 'No Result Found'}}</li>\n      <li *ngIf=\"blankOptionText && filteredList.length\"\n          (mousedown)=\"selectOne('')\"\n          class=\"blank-item\">{{blankOptionText}}</li>\n      <li class=\"item\"\n          *ngFor=\"let item of filteredList; let i=index\"\n          (mousedown)=\"selectOne(item)\"\n          [ngClass]=\"{selected: i === itemIndex}\"\n          [innerHtml]=\"getFormattedList(item)\">\n      </li>\n    </ul>\n  </div>",
            providers: [auto_complete_1.AutoComplete],
            styles: ["\n  @keyframes slideDown {\n    0% {\n      transform:  translateY(-10px);\n    }\n    100% {\n      transform: translateY(0px);\n    }\n  }\n  .auto-complete input {\n    outline: none;\n    border: 2px solid transparent;\n    border-width: 3px 2px;\n    margin: 0;\n    box-sizing: border-box;\n    background-clip: content-box;\n  }\n  .auto-complete ul {\n    background-color: #fff;\n    margin: 0;\n    width : 100%;\n    overflow-y: auto;\n    list-style-type: none;\n    padding: 0;\n    border: 1px solid #ccc;\n    box-sizing: border-box;\n    animation: slideDown 0.1s;\n  }\n  .auto-complete ul li {\n    padding: 2px 5px;\n    border-bottom: 1px solid #eee;\n  }\n  .auto-complete ul li.selected {\n    background-color: #ccc;\n  }\n  .auto-complete ul li:last-child {\n    border-bottom: none;\n  }\n  .auto-complete ul li:hover {\n    background-color: #ccc;\n  }\n"],
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, auto_complete_1.AutoComplete])
    ], AutoCompleteComponent);
    return AutoCompleteComponent;
}());
exports.AutoCompleteComponent = AutoCompleteComponent;
//# sourceMappingURL=auto-complete.component.js.map