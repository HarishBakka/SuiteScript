/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/log', 'N/email', 'N/runtime', 'N/error','N/file', 'N/http', 'N/https'],
    function(ui, record, search, log, email, runtime, error, file, http, https) {
        function onRequest(context) {
            //context.response.write({ output: '{"message":"Request has been successfully received."}' });
            const companyInfo = config.load({ type: config.Type.COMPANY_PREFERENCES });
            const authKey = companyInfo.getValue('authorizationkey');
            try {
                if (context.request.method === 'GET') {
                    //If you want to get from NetSuite
                    //log.debug('GET',JSON.stringify(context));
                    const reqHeaders = context.request.headers;
                    const thankFulAuthKey = context.request.headers["X-Api-Token"];
                    if (thankFulAuthKey === authKey) {
                        var orderRes = {};
                        var getReqBody = JSON.parse(context.request.body);
                        log.debug('GET Thankful Webhook Message Body', getReqBody);
                        switch (reqHeaders.Action) {
                            case "cancel":
                                log.debug("Get Action Type", reqHeaders.Action);
                                context.response.write(JSON.stringify(orderRes));
                                log.debug("Order Res", orderRes);
                                break;
                            case "warehousestatus":
                                log.debug("Get Action Type", reqHeaders.Action);
                                context.response.write(JSON.stringify(orderRes));
                                break;
                            case "shipstatus":
                                log.debug("Get Action Type", reqHeaders.Action);
                                context.response.write(JSON.stringify(orderRes));
                                break;
                            default:
                                log.debug("Get Default Action Type", reqHeaders.Action);
                                context.response.write(JSON.stringify(orderRes));
                        }
                        //Finally return info you needed
                    }

                } else {
                    //POST Request: you can define logic as you want, like delete, update
                    const responseData = JSON.parse(context.request.body);
                    log.debug("Get Thankful Headers", webhookHeaders);
                    log.debug('Get Webhook Message headers', context);
                    const reqBody = JSON.parse(context.request.body);
                    log.debug('Get Webhook Message Body', reqBody);
                }
            }
            catch (e) {
                handleErrorAndSendNotification(e);
            }
        }
        function handleErrorAndSendNotification(e, shipmentmId) {
            var subject = 'Error Occurred While Processing Shipment! '+ shipmentmId;
            var authorId = 'Employee ID';
            var recipientEmail = 'Email';
            email.send({
                author: authorId,
                recipients: recipientEmail,
                subject: subject,
                body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id +'\n\n' + JSON.stringify(e)
            });
        }
        return {
            onRequest: onRequest
        };
    });
