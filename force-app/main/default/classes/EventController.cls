public with sharing class EventController {

    @AuraEnabled
    public static Event selectEventRecord(String recordId, String fieldsetName){
        String fieldNames = selectQueryFieldsFromFieldset(fieldsetName);
        System.debug(fieldNames);
        Event dbQueryResult = Database.query('SELECT ' + fieldNames + ' FROM Event WHERE Id =: recordId');
        return dbQueryResult;
    }

    private static String selectQueryFieldsFromFieldset(String fieldsetName) {
        Schema.FieldSet fieldset = getFieldset(fieldsetName);
        List<String> fieldNames = new List<String>();
        List<Schema.FieldSetMember> fields = fieldset.getFields();

        for(Schema.FieldSetMember fsm : fields) {
          fieldNames.add(fsm.getFieldPath());
        }
        
        String res =  String.join(fieldNames, ',');
        System.debug('fields '+ res);
        return res;
    }

    private static Schema.FieldSet getFieldset(String fieldsetName) {
        Map<String, Schema.SObjectType> GlobalDescribeMap = Schema.getGlobalDescribe();
        Schema.SObjectType SObjectTypeObj = GlobalDescribeMap.get('Event');
        Schema.DescribeSObjectResult DescribeSObjectResultObj = SObjectTypeObj.getDescribe();
        Schema.FieldSet fieldSetObj = DescribeSObjectResultObj.FieldSets.getMap().get(fieldsetName);
        return fieldSetObj;
    }

    @AuraEnabled
    public static Boolean upsertEventRecord(String eventJSON) {
        Event event = new Event();
        System.debug('json');
        System.debug(eventJSON);
        try {
            event = (Event) System.JSON.deserialize(eventJSON, Event.class);
        } catch(TypeException tex) {
            System.debug('tex!');
            return false;
        }

        try {
            event.isAllDayEvent = true;
            upsert event;
        } catch(System.DmlException dmlex) {
            System.debug(dmlex);
            return false;
        }
        
        return true;
    }
}