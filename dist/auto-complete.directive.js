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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('@angular/core');
var auto_complete_component_1 = require("./auto-complete.component");
require("rxjs/Rx");
var forms_1 = require("@angular/forms");
/**
 * display auto-complete section with input and dropdown list when it is clicked
 */
var AutoCompleteDirective = (function () {
    function AutoCompleteDirective(dcl, resolver, viewContainerRef, renderer, parentForm) {
        var _this = this;
        this.dcl = dcl;
        this.resolver = resolver;
        this.viewContainerRef = viewContainerRef;
        this.renderer = renderer;
        this.parentForm = parentForm;
        this.loadingText = "Loading";
        this.ngModelChange = new core_1.EventEmitter();
        this.valueChanged = new core_1.EventEmitter();
        this.hideAutoCompleteDropdown = function (event) {
            if (_this.componentRef) {
                if (event && event.type === "click" &&
                    event.target.tagName !== "INPUT" && !_this.elementIn(event.target, _this.acDropdownEl)) {
                    _this.componentRef.destroy();
                    _this.componentRef = undefined;
                }
                else if (!event) {
                    _this.componentRef.destroy();
                    _this.componentRef = undefined;
                }
            }
        };
        this.styleAutoCompleteDropdown = function () {
            if (_this.componentRef) {
                var component = _this.componentRef.instance;
                var thisElBCR = _this.el.getBoundingClientRect();
                _this.acDropdownEl.style.width = thisElBCR.width + "px";
                _this.acDropdownEl.style.position = "absolute";
                _this.acDropdownEl.style.zIndex = "1";
                _this.acDropdownEl.style.top = "0";
                _this.acDropdownEl.style.left = "0";
                _this.acDropdownEl.style.display = "inline-block";
                var thisInputElBCR = _this.inputEl.getBoundingClientRect();
                _this.renderer.setElementStyle(component.autoCompleteInput.nativeElement, 'width', thisInputElBCR.width + "px");
                _this.renderer.setElementStyle(component.autoCompleteInput.nativeElement, 'height', thisInputElBCR.height + "px");
                _this.renderer.invokeElementMethod(component.autoCompleteInput.nativeElement, 'focus');
                component.closeToBottom = (thisInputElBCR.bottom + 100 > window.innerHeight);
            }
        };
        this.componentInputChanged = function (val) {
            if (_this.acceptUserInput !== false) {
                _this.inputEl.value = val;
                if ((_this.parentForm && _this.formControlName) || _this.extFormControl) {
                    _this.formControl.patchValue(val);
                }
                (val !== _this.ngModel) && _this.ngModelChange.emit(val);
                _this.valueChanged.emit(val);
            }
        };
        this.selectNewValue = function (val) {
            if (val !== '') {
                val = _this.addToStringFunction(val);
            }
            if ((_this.parentForm && _this.formControlName) || _this.extFormControl) {
                if (!!val) {
                    _this.formControl.patchValue(val);
                }
            }
            (val !== _this.ngModel) && _this.ngModelChange.emit(val);
            _this.valueChanged.emit(val);
            _this.inputEl && (_this.inputEl.value = '' + val);
            _this.hideAutoCompleteDropdown();
        };
        this.el = this.viewContainerRef.element.nativeElement;
    }
    AutoCompleteDirective.prototype.ngOnInit = function () {
        // ...
        var divEl = document.createElement("div");
        divEl.className = 'ng2-auto-complete';
        divEl.style.position = 'relative';
        this.el.parentElement.insertBefore(divEl, this.el.nextSibling);
        divEl.appendChild(this.el);
        this.selectNewValue(this.ngModel);
        if (this.parentForm && this.formControlName) {
            if (this.parentForm['form']) {
                this.formControl = this.parentForm['form'].find(this.formControlName);
            }
        }
        else if (this.extFormControl) {
            this.formControl = this.extFormControl;
        }
        document.addEventListener("click", this.hideAutoCompleteDropdown);
    };
    AutoCompleteDirective.prototype.ngOnDestroy = function () {
        if (this.componentRef) {
            this.componentRef.instance.valueSelected.unsubscribe();
            this.componentRef.instance.inputChanged.unsubscribe();
        }
        document.removeEventListener("click", this.hideAutoCompleteDropdown);
    };
    AutoCompleteDirective.prototype.ngOnChanges = function (changes) {
        if (changes['ngModel']) {
            this.ngModel = this.addToStringFunction(changes['ngModel'].currentValue);
        }
    };
    //show auto-complete list below the current element
    AutoCompleteDirective.prototype.showAutoCompleteDropdown = function () {
        var _this = this;
        this.hideAutoCompleteDropdown();
        this.resolver.resolveComponent(auto_complete_component_1.AutoCompleteComponent).then(function (factory) {
            _this.componentRef = _this.viewContainerRef.createComponent(factory);
            var component = _this.componentRef.instance;
            component.listFormatter = _this.listFormatter;
            component.pathToData = _this.pathToData;
            component.minChars = _this.minChars;
            component.valuePropertyName = _this.valuePropertyName || "id";
            component.displayPropertyName = _this.displayPropertyName || "value";
            component.source = _this.source;
            component.placeholder = _this.autoCompletePlaceholder;
            component.blankOptionText = _this.blankOptionText;
            component.noMatchFoundText = _this.noMatchFoundText;
            component.acceptUserInput = _this.acceptUserInput;
            component.loadingText = _this.loadingText;
            component.maxNumList = parseInt(_this.maxNumList, 10);
            component.valueSelected.subscribe(_this.selectNewValue);
            component.inputChanged.subscribe(_this.componentInputChanged);
            _this.acDropdownEl = _this.componentRef.location.nativeElement;
            //this.acDropdownEl.style.display = "none";
        });
        this.moveAutocompleteDropDownAfterInputEl();
        setTimeout(this.styleAutoCompleteDropdown);
    };
    ;
    AutoCompleteDirective.prototype.addToStringFunction = function (val) {
        if (val && typeof val === "object") {
            var displayVal_1 = val[this.displayPropertyName || "value"];
            val.toString = function () {
                return displayVal_1;
            };
        }
        return val;
    };
    AutoCompleteDirective.prototype.moveAutocompleteDropDownAfterInputEl = function () {
        this.inputEl = this.el;
        if (this.el.tagName !== "INPUT" && this.acDropdownEl) {
            this.inputEl = this.el.querySelector("input");
            this.inputEl.parentElement.insertBefore(this.acDropdownEl, this.inputEl.nextSibling);
        }
    };
    AutoCompleteDirective.prototype.elementIn = function (el, containerEl) {
        while (el = el.parentNode) {
            if (el === containerEl) {
                return true;
            }
        }
        return false;
    };
    __decorate([
        core_1.Input('auto-complete-placeholder'), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "autoCompletePlaceholder", void 0);
    __decorate([
        core_1.Input('list-formatter'), 
        __metadata('design:type', Function)
    ], AutoCompleteDirective.prototype, "listFormatter", void 0);
    __decorate([
        core_1.Input('source'), 
        __metadata('design:type', Object)
    ], AutoCompleteDirective.prototype, "source", void 0);
    __decorate([
        core_1.Input('path-to-data'), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "pathToData", void 0);
    __decorate([
        core_1.Input('min-chars'), 
        __metadata('design:type', Number)
    ], AutoCompleteDirective.prototype, "minChars", void 0);
    __decorate([
        core_1.Input('value-property-name'), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "valuePropertyName", void 0);
    __decorate([
        core_1.Input('display-property-name'), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "displayPropertyName", void 0);
    __decorate([
        core_1.Input('blank-option-text'), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "blankOptionText", void 0);
    __decorate([
        core_1.Input('no-match-found-text'), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "noMatchFoundText", void 0);
    __decorate([
        core_1.Input('accept-user-input'), 
        __metadata('design:type', Boolean)
    ], AutoCompleteDirective.prototype, "acceptUserInput", void 0);
    __decorate([
        core_1.Input('loading-text'), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "loadingText", void 0);
    __decorate([
        core_1.Input('max-num-list'), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "maxNumList", void 0);
    __decorate([
        core_1.Input('formControlName'), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "formControlName", void 0);
    __decorate([
        core_1.Input('formControl'), 
        __metadata('design:type', forms_1.FormControl)
    ], AutoCompleteDirective.prototype, "extFormControl", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], AutoCompleteDirective.prototype, "ngModel", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], AutoCompleteDirective.prototype, "ngModelChange", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], AutoCompleteDirective.prototype, "valueChanged", void 0);
    AutoCompleteDirective = __decorate([
        core_1.Directive({
            selector: '[auto-complete], [ng2-auto-complete]',
            host: {
                '(click)': 'showAutoCompleteDropdown()',
            }
        }),
        __param(4, core_1.Optional()),
        __param(4, core_1.Host()),
        __param(4, core_1.SkipSelf()), 
        __metadata('design:paramtypes', [core_1.DynamicComponentLoader, core_1.ComponentResolver, core_1.ViewContainerRef, core_1.Renderer, forms_1.ControlContainer])
    ], AutoCompleteDirective);
    return AutoCompleteDirective;
}());
exports.AutoCompleteDirective = AutoCompleteDirective;
//# sourceMappingURL=auto-complete.directive.js.map