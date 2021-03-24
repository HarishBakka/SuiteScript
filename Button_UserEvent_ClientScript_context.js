//How to send context or record data to client script using User Event button click

/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/email', 'N/runtime', 'N/search'],
    function(record, log, email, runtime, search) {
        function errorHandler(e) {
            var subject = 'Error Occured While Processing Shipment!';
            var authorId = 'Employee ID';
            var recipientEmail = 'Employee Email';
            email.send({
                author: authorId,
                recipients: recipientEmail,
                subject: subject,
                body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id +'\n\n' + JSON.stringify(e)
            });
        }
        function beforeLoad(context) {
            try {
                if (context.type === context.UserEventType.VIEW) {
                    const customerRecord = context.newRecord;
                    //log.debug('Record Context:', customerRecord);
                    const form = context.form;
                    form.clientScriptFileId = 565091;
                    //form.clientScriptModulePath = 'SuiteScripts/Prod_Scripts_2/ClientScripts Scripts/LC_ButtonCLientMenthods.js';
                    if ((customerRecord.type !== 'inventoryadjustment') && (customerRecord.type !== 'inventoryitem')) {
                        const customFormID = search.lookupFields({
                            type: customerRecord.type,
                            id: customerRecord.id,
                            columns: ['customform', 'status']
                        });
                        //log.debug('Get Class Value: VIEW', customFormID);
                        const formId = parseInt(customFormID.customform[0].value);
                        const statusName = customFormID.status[0].value;

                        if (formId === 159) {
                            if (statusName && statusName != 'pendingApproval') {
                                //log.debug('Status', statusName);
                                //Current Record Data
                                // Check If any Back order qyty still available
                                const backQty  = [];
                                const loadRecord = record.load({
                                    type: customerRecord.type,
                                    id: customerRecord.id,
                                    isDynamic: true
                                });
                                const lineCount = loadRecord.getLineCount('item');
                                if (lineCount) {
                                    for (var x = 0; x < lineCount; x++) {
                                        var backOrderQty = loadRecord.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantitybackordered',
                                            line: x
                                        });
                                        if (backOrderQty > 0) {
                                            backQty.push(backOrderQty);
                                        }
                                    }
                                }
                                if (backQty.length > 0) {
                                    if (formId === 159) {
                                        //log.debug('Get form Data:', form);
                                        form.addButton({
                                            id: 'custpage_invtransfer',
                                            label: 'InvTransfer',
                                            functionName: 'inventoryTransferLocation("'+customerRecord.type+':'+customerRecord.id+'")'
                                        });
                                    }
                                }
                                else {
                                    //log.debug('Get Back Order Qty:', backQty);
                                }
                            }
                        }
                        else if (formId === 150 || 151) {
                            //log.debug('Start: Record Status:', statusName);
                            //pendingBilling - Status
                            //closed - Status
                            //itemtype - "Assembly"
                            if ((statusName !== 'pendingBilling') && (statusName !== 'closed')) {
                                //log.debug('!Record Status:', statusName);
                            }
                            else {
                                //log.debug('Record Status:', statusName);
                            }
                            const soRecord = record.load({
                                type: customerRecord.type,
                                id: customerRecord.id,
                                isDynamic: true
                            });
                            const custId = soRecord.getValue({
                                fieldId: 'entity'
                            });
                            const soLines = soRecord.getLineCount('item');
                            const createWos = [];
                            var finaldata = {};
                            if (soLines) {
                                for (var y = 0; y < soLines; y++) {
                                    var itemType = soRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemtype',
                                        line: y
                                    });
                                    var isClose = soRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'isclosed',
                                        line: y
                                    });

                                    if ((itemType === 'Assembly') && (!isClose)) {
                                        //log.debug('Is Closed:', isClose);
                                        //log.debug('Pull Item Type', itemType);
                                        var skuId = soRecord.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'item',
                                            line: y
                                        });
                                        var qunty = soRecord.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantity',
                                            line: y
                                        });
                                        var fulFilQty = soRecord.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantityfulfilled',
                                            line: y
                                        });
                                        var locationId = soRecord.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'location',
                                            line: y
                                        });
                                        var backQtyCheck = soRecord.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantitybackordered',
                                            line: y
                                        });
                                        finaldata["locationID"] = locationId;
                                        //log.debug('Back Order Qty Check', backQtyCheck);
                                        if (backQtyCheck > 0) {
                                            if (qunty - fulFilQty > 0 ) {
                                                var neededQty = qunty - fulFilQty;
                                                log.debug('Quantity Check:', qunty +' : ' + fulFilQty);
                                                createWos.push({"itemId": skuId, "quantity": neededQty});
                                            }
                                        }
                                    }
                                }
                            }

                            finaldata["jobType"] = "cratebuild";
                            finaldata["recordId"] = customerRecord.id;
                            finaldata["recordType"] = customerRecord.type;
                            finaldata["customerId"] = custId;

                            finaldata["items"] = createWos;

                            var jsonStringData = JSON.stringify(finaldata);
                            if (createWos.length) {
                                //log.debug('Get Length of Create WOs:', finaldata);
                                form.addButton({
                                    id: 'custpage_cratebuild',
                                    label: 'BOMS Build',
                                    functionName: 'assemblyBuild('+ jsonStringData +')'
                                });
                            }
                        }
                    }
                    else if (customerRecord.type === 'inventoryitem') {
                        //log.debug('Get Record Type: if Inventroy Item:', customerRecord);
                        const finalParseData = JSON.stringify(customerRecord);
                        form.addButton({
                            id: 'custpage_inventoryadj',
                            label: 'Inv Adj',
                            functionName: 'InventoryAdjustmentFromItem('+ finalParseData +')'
                        });
                    }
                    else {

                        const parseData = JSON.stringify(customerRecord);
                        form.addButton({
                            id: 'custpage_iaclasschange',
                            label: 'Change Class',
                            functionName: 'inventoryAdjustMentClassChange('+ parseData +')'
                        });
                    }
                }
            }
            catch (e) {
                errorHandler(e);
            }
        }
        function beforeSubmit(context) {
            if (context.type === context.UserEventType.CREATE) {
                const customerRecord = context.newRecord;
            }
            else {
                log.debug('context.type', context.type);
            }
        }
        function afterSubmit(context) {
            if (context.type !== context.UserEventType.CREATE) {
                const customerRecord = context.newRecord;
            }
        }
        return {
            beforeLoad: beforeLoad
            //beforeSubmit: beforeSubmit
            //afterSubmit: afterSubmit
        };
    });

//Client script that will receive response from UserEvent script
/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 * Author: Harish Bakka
 * Date: 02.18.2019
 */

define(['N/error','N/record','N/ui/dialog','N/search','N/runtime', 'N/email', 'N/url', 'N/https', '/SuiteScripts/oauth', '/SuiteScripts/secret', 'N/ui/message'],
    function(error,record,dialog,search, runtime, email, url, https, oauth, secret, message) {
        function errorHandler(e) {
            var subject = 'Error Occured While Processing Inventory Transfer!';
            var authorId = 'employee ID';
            var recipientEmail = 'employee email';
            email.send({
                author: authorId,
                recipients: recipientEmail,
                subject: subject,
                body: '\n\n' +JSON.stringify(e)
            });
        }
        function inventoryTransferLocation(context) {
            try {
                var p = confirm("Are you sure, you want to Transfer Inventory ?");
                if (p) {
                    var currentRecord = context.split(':');

                    //Retrieve URL of RESTlet
                    var urlLink = url.resolveScript({
                        scriptId: 'customscript_inventorytransferrl',
                        deploymentId: 'customdeploy_inventorytransferrestdp',
                        returnExternalUrl: true
                    });
                    const splitUrl = urlLink.split('&compid');
                    console.log('Get URL:', splitUrl[0]);
                    console.log('Get Urls of restlet', urlLink);

                    //Call RestLet
                    var dataBody = {
                        'recordType': currentRecord[0],
                        'sointernalid': currentRecord[1]
                    };
                    console.log(dataBody);
                    var headers = oauth.getHeaders({
                        url: splitUrl[0],
                        method: 'POST',
                        tokenKey:    secret.token.public,
                        tokenSecret: secret.token.secret
                    });
                    headers['Content-Type'] = 'application/json';
                    headers['User-Agent-X'] = 'SuiteScript-Call';

                    const response = https.post({url: splitUrl[0], body: JSON.stringify(dataBody), headers: headers});
                    console.log('Write Res', response.body);

                    location.reload();
                }
                else {
                    //location.reload();

                    var myMsg = message.create({
                        title: "Changes",
                        message: "You haven't transfer inventory.",
                        type: message.Type.INFORMATION
                    });
                    // will disappear after 5s
                    myMsg.show({
                        duration: 5000
                    });

                    jQuery('#document').ready(function() {
                        console.log( "ready!: JQuery Testing:");
                    });
                }
            }
            catch (e) {
                if (e.name == 'SSS_REQUEST_TIME_EXCEEDED') {
                    log.debug('Throw Error in Debug:', e.name);
                }
                else {
                    errorHandler(e.name);
                }
            }
        }
        function assemblyBuild(context) {
            //Suitelet: Suitelet methods
            //console.log('Start');
            var locationId = prompt('Please enter fulfilled location\nLockhaven - 39\nVernon - 43\nif you don"t enter location id,\nthen will be taken from line level as a default', '43');
            console.log(locationId);
            if (locationId) {
                context["locationID"] = locationId;
            }

            var bodyResp = context;
            //console.log(bodyResp);
            var urlLink = url.resolveScript({
                scriptId: 'customscript_suiteletcommonmethods',
                deploymentId: 'customdeploy_lcsuiteletcommonmehtods',
                returnExternalUrl: true
            });
            //console.log(urlLink);
            var headers = {};
            headers['Content-Type'] = 'application/json';
            headers['User-Agent'] = 'Mozilla/5.0';
            var response = https.post({
                url: urlLink,
                body: JSON.stringify(context),
                headers: headers
            });
            console.log(JSON.stringify(response.code));
            if (parseInt(response.code) === 200) {
                location.reload();
            }
            else {
                alert('Something Went Wrong! '+response.code);
            }
        }
        function jQueryForms() {
            jQuery('#document').ready(function() {
                $overlay = jQuery('<div id="overlay"></div>');
                $modal = jQuery('<div id="modal"></div>');
                $content = jQuery('<div id="content"></div>');
                $close = jQuery('<a id="close" href="#">close</a>');
                $modal.hide();
                $overlay.hide();
                $modal.append($content, $close);
                jQuery('body').append($overlay, $modal);
                console.log( "ready!: JQuery Testing:");
            });
        }
        function inventoryAdjustMentClassChange(context) {
            console.log(context);
            const recordId = context.id;
            const recordType = context.type;
            const classId = context.fields.class;
            console.log(classId +':'+ recordId +':'+recordType);
            const finalData = {};

            var newClassId = prompt('Please give new class internal id or keep default id', classId);

            if (parseInt(newClassId)) {
                try {
                    finalData["jobType"] = "classchange";
                    finalData["recordId"] = recordId;
                    finalData["recordType"] = recordType;
                    finalData["class"] = parseInt(newClassId);

                    //Push Into SuiteLet methods
                    const responseCode = suiteletUrlResolve(finalData);
                    console.log(responseCode);
                    console.log(JSON.stringify(finalData));
                    if (parseInt(responseCode) === 200) {
                        location.reload();
                    }
                    else {
                        alert('Something Went Wrong! '+response.code);
                    }
                    // const loadIa = record.load({
                    //     type: record.Type.INVENTORY_ADJUSTMENT,
                    //     id: recordId
                    // });
                    // console.log(JSON.stringify(loadIa));
                    // const classIds = loadIa.getValue('class');
                    // console.log('Class ' + classIds);
                    // const lineCount = loadIa.getLineCount('inventory');
                    // console.log(lineCount);
                    // for (var i = 0; i < lineCount; i++) {
                    //     loadIa.setSublistValue({
                    //         sublistId: 'inventory',
                    //         fieldId: 'class',
                    //         value: newClassId,
                    //         line: i
                    //     });
                    // }
                    // try {
                    //     const saveRec = loadIa.save({
                    //         enableSourcing: true,
                    //         ignoreMandatoryFields: true
                    //     });
                    //     console.log(saveRec);
                    // }
                    // catch (error) {
                    //     console.log(JSON.stringify(error));
                    // }

                }
                catch (e) {
                    console.log(JSON.stringify(e));
                }
            }
        }
        function InventoryAdjustmentFromItem(context) {
            console.log(context);
            const iAFinalData = {};
            const itemId = context.id;
            const itemType = context.type;
            const locationId = context.fields.location;
            const getQuantity = prompt('Please Enter Adjustment Quantity', 1);
            const getLocation = prompt('Please Enter Adjustment Location\n Default will be taken from current Item Location:', locationId);
            if (getQuantity && getLocation) {
                iAFinalData['jobType'] = 'inventoryadjustment';
                iAFinalData['itemid'] = itemId;
                iAFinalData['class'] = context.fields.class;
                iAFinalData['adjustmentQty'] = getQuantity;
                iAFinalData['getLocation'] = getLocation;
                //const getCalss = prompt('Please Enter Adjustment Class', context.fields.class);
                //const classValue = getCalss ? getCalss : context.fields.class;
                console.log(getLocation +' : '+ getQuantity + ' : ' + context.fields.class);

                const responseCodes = suiteletUrlResolve(iAFinalData);
                if (parseInt(responseCodes) === 200) {
                    location.reload();
                }
                else {
                    alert('Something Went Wrong! '+responseCodes.code);
                }
            }

        }
        function suiteletUrlResolve(context) {

            var urlLink = url.resolveScript({
                scriptId: 'customscript_suiteletcommonmethods',
                deploymentId: 'customdeploy_lcsuiteletcommonmehtods',
                returnExternalUrl: true
            });
            var headers = {};
            headers['Content-Type'] = 'application/json';
            headers['User-Agent'] = 'Mozilla/5.0';
            var response = https.post({
                url: urlLink,
                body: JSON.stringify(context),
                headers: headers
            });
            console.log(JSON.stringify(response.code));
            return response.code;
        }
        function pageInit() {}
        return {
            pageInit: pageInit,
            inventoryTransferLocation: inventoryTransferLocation,
            assemblyBuild: assemblyBuild,
            inventoryAdjustMentClassChange: inventoryAdjustMentClassChange,
            InventoryAdjustmentFromItem: InventoryAdjustmentFromItem
        };
    });
