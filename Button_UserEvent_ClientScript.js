//The following sample is a custom module client script named clientDemo.js. This script updates fields on the current record. After you upload the clientDemo.js script file to a NetSuite account, it can be called by other scripts.

//Because clientDemo.js is a custom module script, it must manually load the N/currentRecord by naming it in the define statement. It must also retrieve a currentRecord.CurrentRecord object by using the currentRecord.get() method.

//Cleint Scrit
/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
//Add modules based on requirement
define(['N/currentRecord'], function(currentRecord) {
    return({
        test_set_getValue: function() {
            var record = currentRecord.get();
            record.setValue({
                fieldId: 'custpage_textfield',
                value: 'Body value',
                ignoreFieldChange: true,
                forceSyncSourcing: true
            });
            var actValue = record.getValue({
                fieldId: 'custpage_textfield'
            });
            record.setValue({
                fieldId: 'custpage_resultfield',
                value: actValue,
                ignoreFieldChange: true,
                forceSyncSourcing: true
            });
        },

        test_set_getCurrentSublistValue: function() {
            var record = currentRecord.get();
            record.setCurrentSublistValue({
                sublistId: 'sitecategory',
                fieldId: 'custpage_subtextfield',
                value: 'Sublist Value',
                ignoreFieldChange: true,
                forceSyncSourcing: true
            });
            var actValue = record.getCurrentSublistValue({
                sublistId: 'sitecategory',
                fieldId: 'custpage_subtextfield'
            });
            record.setValue({
                fieldId: 'custpage_sublist_resultfield',
                value: actValue,
                ignoreFieldChange: true,
                forceSyncSourcing: true
            });
        },
    });
});

//The following sample is a user event script deployed on a non-inventory item record. Before the record loads, the script updates the form used by the record to add new text fields, a sublist, and buttons that call the clientDemo.js methods. The buttons access the current record and set values for some of the form’s fields. This sample demonstrates how to customize a form, use the code you created in Sample 1, and see the new fields and buttons in action.
//User Event
/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define([], function() {
    return {
        beforeLoad: function (params)
        {
            var form = params.form;

            var textfield = form.addField({
                id: 'custpage_textfield',
                type: 'text',
                label: 'Text'
            });
            var resultfield = form.addField({
                id: 'custpage_resultfield',
                type:'text',
                label: 'Result'
            });
            var sublistResultfield = form.addField({
                id: 'custpage_sublist_resultfield',
                type: 'text',
                label: 'Sublist Result Field'
            });

            var sublistObj = form.getSublist({
                id: 'sitecategory'
            });
            var subtextfield = sublistObj.addField({
                id: 'custpage_subtextfield',
                type: 'text',
                label: 'Sublist Text Field'
            });

            form.clientScriptModulePath = './clientDemo.js';
            form.addButton({
                id: 'custpage_custombutton',
                label: 'SET_GET_VALUE',
                functionName: 'test_set_getValue'
            });
            form.addButton({
                id: 'custpage_custombutton2',
                label: 'SET_GETCURRENTSUBLISTVALUE',
                functionName: 'test_set_getCurrentSublistValue'
            });
        }
    };
});
