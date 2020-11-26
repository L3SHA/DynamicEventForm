public with sharing class FieldSetController {

    public static DescribeSObjectResult sObjectResult;

    @AuraEnabled(Cacheable=true)
    public static MetadataResponse getObjectMetadata(String objectTypeName) {
        // Setup response object
        MetadataResponse response = new MetadataResponse();
        try {
            // Handle Errors
            System.debug('### getMetadata objectTypeName >>> '+objectTypeName);
            if (String.isBlank(objectTypeName)) newException('objectTypeName is required to get fieldset', null);           
            sObjectResult = Schema.getGlobalDescribe().get(objectTypeName).getDescribe();
            System.debug('### getMetadata sObjectResult >>> '+sObjectResult);
            response.sObjectName = sObjectResult.getName();
        } catch (Exception ex) {
            //raise aura exception
            newException(ex.getMessage(), ex.getStackTraceString());
        }
        // Return metadata
        return response;
    }

    @AuraEnabled(Cacheable=true)
    public static MetadataResponse getFieldSetMetadata(String objectTypeName, String fieldSetName) {
        // Setup response object
        MetadataResponse response = new MetadataResponse();
        try {
            // Get SObject
            response = getObjectMetadata(objectTypeName);
            System.debug('### getMetadata sObjectResult >>> '+sObjectResult);
            response.sObjectName = sObjectResult.getName();
            // Handle Errors
            System.debug('### getMetadata fieldSetName >>> '+fieldSetName);
            if (String.isBlank(fieldsetName)) newException('Fieldset Name required to get Field Metadata', null);           
            Map<String, FieldSet> fieldSets = sObjectResult.fieldSets.getMap();            
            if (fieldSets.containsKey(fieldSetName)) {
                Map<String, SObjectField> fields = sObjectResult.fields.getMap();
                // Get the Label
                response.fieldSetLabel = fieldSets.get(fieldSetName).getLabel();
                System.debug('### getMetadata response.fieldSetLabel >>> '+response.fieldSetLabel);
                response.fieldsMetadata = new List<String>();
                for (FieldSetMember fieldSetMember : fieldSets.get(fieldSetName).getFields()) {                   
                    String fieldName = fieldSetMember.getFieldPath();
                    System.debug('### getMetadata fieldName >>> '+fieldName);
                    // We can't handle Relationship fields
                    if (!fieldName.contains('.')) {
                        DescribeFieldResult fd = fields.get(fieldName).getDescribe();
                        System.debug('### getMetadata fd.isAccessible() >>> '+fd.isAccessible());
                        if (fd.isAccessible()) {
                            response.fieldsMetadata.add(JSON.serialize(
                                new Map<String, Object>{
                                    'fieldSetProperties' => fieldSetMember,
                                    'fieldDescribeProperties' => fd
                                }
                            ));
                        }
                    } else {
                        newException('Relationship Fields not supported FieldSet: "'+fieldSetName+'" Field Name: "'+fieldName+'"', null);
                    }
                }
                // Make sure we have fields
                System.debug('### getMetadata response.fieldsMetadata >>> '+response.fieldsMetadata);
                if (response.fieldsMetadata.isEmpty()) newException('No accessible fields for the current user in FieldSet "'+fieldSetName+'"', null);
            } else {
                newException('Fieldset "'+fieldSetName+'" not found for SObject "'+sObjectResult.getName()+'"', null);
            }
        } catch (Exception ex) {
            newException(ex.getMessage(), ex.getStackTraceString());
        }
        // Return metadata
        return response;
    }

    private static void newException(String exceptionMessage, String stackTraceString) {
        System.debug('### newException exceptionMessage >>> '+exceptionMessage);
        System.debug('### newException stackTraceString >>> '+stackTraceString);
        AuraHandledException ex = new AuraHandledException(exceptionMessage);
        ex.setMessage(exceptionMessage + (String.isNotBlank(stackTraceString) ? ' ' + stackTraceString : ''));
        throw ex;
    }

   
}