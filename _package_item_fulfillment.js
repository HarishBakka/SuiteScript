//Package Details Assign
                const packageLineCount = itemFulfillment.getLineCount({
                    sublistId: 'package'
                });
                log.debug("Get Package Count", packageLineCount);
                for(var i = packageLineCount-1; i >= 0; i--) {
                    itemFulfillment.removeLine({
                        sublistId: 'package',
                        line: i
                    });
                }
                packData.forEach(function (pkg, index){
                    itemFulfillment.selectNewLine({
                        sublistId : 'package',
                        line: index
                    });
                    itemFulfillment.setCurrentSublistValue({
                        sublistId: 'package',
                        fieldId: 'packagetrackingnumber',
                        value: pkg.trackNum,
                    });
                    itemFulfillment.setCurrentSublistValue({
                        sublistId: 'package',
                        fieldId: 'packageweight',
                        value: pkg.shipWeight
                    });
                    itemFulfillment.setCurrentSublistValue({
                        sublistId: 'package',
                        fieldId: 'packagedescr',
                        value: pkg.Carrier
                    });
                    itemFulfillment.commitLine({
                        sublistId: 'package'
                    });

                });
