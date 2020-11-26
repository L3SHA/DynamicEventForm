export { getInputFieldAttributes,  getRecordFieldValue, getInputValue};

const getInputFieldAttributes = (field) => {
    let fieldObject = {};
    switch(field.type) {
        case 'combobox':
            fieldObject.isCombobox = true;
            fieldObject.type = 'combobox';
            fieldObject.picklistValues = field.picklistValues;
            fieldObject.isInput = false;
            break;
        case 'phone':
            fieldObject.isInput = true;
            fieldObject.pattern = '[0-9]+';
            break;
        case 'email':
            fieldObject.isInput = true;
            fieldObject.type = 'email';
            break;
        case 'currency':  
            fieldObject.isInput = true;
            fieldObject.type = 'number'; 
            fieldObject.formatter = 'currency';
            fieldObject.step = '0.5';            
            break;
        case 'date':  
            fieldObject.isInput = true;
            fieldObject.type = 'date';  
            break;  
        case 'boolean':  
            fieldObject.isInput = true;
            fieldObject.type = 'checkbox';   
            break; 
        case 'int':  
            fieldObject.isInput = true;
            fieldObject.type = 'number';
            fieldObject.min = '0';
            fieldObject.max = '99999999999999';
            fieldObject.step = '1';
            break;    
        case 'string':  
            fieldObject.isInput = true;
            fieldObject.type = 'text';  
            break;           
        case 'textarea':  
            fieldObject.isInput = true;
            fieldObject.type = 'text';  
            break;       
    }
    fieldObject.name = field.name;
    fieldObject.label = field.label;
    field.dataMyId = field.name;
    return fieldObject;
};

const getRecordFieldValue = (record, field) => {
    return record[field];
}

const getInputValue = (inputs, comboboxes, field) => {
    console.log('search for ' + field.name);
    console.log('search for ' + field.name);
    let value;
    console.log(field.type);
    if(field.type == 'combobox') {
        comboboxes.forEach((element) => {
            console.log(element.name + ' vs ' + field.name);
            if(element.name == field.name) {
                value = element.value;                
            }
        }, value);
    } else {
        inputs.forEach((element) => {
            console.log(element.name + ' vs ' + field.name);
            if(element.name == field.name) {
                if(field.type == 'checkbox') {
                    value = element.checked;
                } else {
                    value = element.value;
                }                
            }
        }, value);
    }
        
    return value;
}
    