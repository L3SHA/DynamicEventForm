import { LightningElement, wire, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFieldSetMetadata from '@salesforce/apex/FieldSetController.getFieldSetMetadata';
import selectEventRecord from '@salesforce/apex/EventController.selectEventRecord';
import upsertEventRecord from '@salesforce/apex/EventController.upsertEventRecord';
import { NavigationMixin } from 'lightning/navigation';
import { getInputFieldAttributes, getRecordFieldValue, getInputValue } from './eventFormHelper';

export default class Fieldset extends NavigationMixin(LightningElement) {

    
    showTitle = true;
    strTitle= 'Event';
    iconName;
    iconNewEventName = 'action:new_event';
    iconEditEventName = 'action:log_event';
    columnsLarge = true;
    columnsMedium = true;
    columnsSmall = true;
    fieldSetName = 'Dynamic_Form_Set';
    

    @track sObjectName;
    @track recordFields = [];
    @track metadataError;
    @track eventRecord;
    @api recordId;
    @track objectTypeName = 'Event';
    
    @track isLoading = true;
    @track layoutSizeLarge;
    @track layoutSizeMedium;
    @track layoutSizeSmall;

    connectedCallback() {
       
        if (this.columnsLarge) this.layoutSizeLarge = 12 / this.columnsLarge;
        if (this.columnsMedium) this.layoutSizeMedium = 12 / this.columnsMedium;
        if (this.columnsSmall) this.layoutSizeSmall = 12 / this.columnsSmall;
        
    }  

    @wire(getFieldSetMetadata, {
        objectTypeName: '$objectTypeName',
        fieldSetName: '$fieldSetName'
    })
    wiredFieldSetMetadata(result) {
        this.isLoading = true;
        let data = result.data;
        let error = result.error;
        if (data) {
            selectEventRecord({
                recordId: this.recordId,
                fieldsetName: this.fieldSetName
            }).then(result => {
                    console.log(result);
                    this.eventRecord = result;
                    this.formRecordFields(data);
                    this.isLoading = false;
                })
                .catch(error => {
                    this.error = error;
                    console.log('Record retrieve error! ');
                    console.log(error);
                    this.formRecordFields(data);
                    this.isLoading = false;
                });
            
        } else if (error) {
            console.log("Error!");
            this.metadataError = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.metadataError = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.metadataError = error.body.message;
            }
            console.error('getMetadata error', this.metadataError);
        }
        if (this.recordFields.length || this.metadataError) this.isLoading = false;
    }

    formRecordFields(data) {
        if (this.recordId) {
            this.strTitle = 'Edit ' + this.strTitle;
            this.iconName = this.iconEditEventName;
        } else {
            this.strTitle = 'Create  ' + this.strTitle;
            this.iconName = this.iconNewEventName;;
        }
        
        this.sObjectName = data.sObjectName;

        let newRecordFields = [];
        data.fieldsMetadata.forEach((fd) => {            
            const fieldProperties = JSON.parse(fd);
            const {
                fieldSetProperties,
                fieldDescribeProperties
            } = fieldProperties;

            let field = getInputFieldAttributes(fieldDescribeProperties);

            if(this.eventRecord) { 
                field.value = getRecordFieldValue(this.eventRecord, field.name);
                console.log('Field value');
                console.log(field.value);
            }
            
            newRecordFields.push(field);
            console.log(this.recordFields);
        });
        this.metadataError = undefined;
        this.recordFields = newRecordFields;
    }

    get cardTitle() {
        return this.showTitle ? this.strTitle : null;
    }

    get showSpinner() {
        return this.isLoading || this.isSaving;
    }

    get showForm() {
        return !this.isLoading && !!this.sObjectName && !this.metadataError;
    }   

    handleSave() {
        let inputs = this.template.querySelectorAll("lightning-input");
        let comboboxes = this.template.querySelectorAll("lightning-combobox");
        let eventFromForm = {};
        this.recordFields.forEach(field => eventFromForm[field.name] = getInputValue(inputs, comboboxes, field));

        if(this.recordId) {
            eventFromForm.Id = this.recordId;
        }

        upsertEventRecord({
            eventJSON: JSON.stringify(eventFromForm)
        }).then(result => {
                this.showSuccessToast(this.recordId ? 'Event successfully edited!' : 'Event successfully created!');
            })
            .catch(error => {
                this.error = error;
            });
    }

    showSuccessToast(message) {
        const event = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success'
        });
        this.dispatchEvent(event);
    }
}