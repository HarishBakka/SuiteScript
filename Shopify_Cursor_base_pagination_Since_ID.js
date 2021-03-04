//Business logic to get orders list within a day or days
function yesterdate() {
  // Date and Time
  const date = new Date();
  //date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = ('0'+(date.getMonth()+1)).slice(-2);
  const daDate = ('0'+date.getDate()).slice(-2);
  
  return year+'-'+month+'-'+daDate;
}
//Cursor based logic for javascript
function cursorBasedPagination() {
  try {
    var ordersList = [];
    //Initial REST Request to Get Next page Info
    var pageNationShopUrl = appInfo() + '/orders.json?created_at_min='+ yesterdate() +'T00:00:00-07:00&created_at_max='+ yesterdate() +'T23:59:59-07:00&limit=250&status=any&fields=id,created_at, financial_status, name';
    var resPagNat = shopifyExtractRequest(pageNationShopUrl); //Initial Shopify Request
    const bodyPgNat = JSON.parse(resPagNat.body); //Body parse
    bodyPgNat.orders.forEach(function (v){
      ordersList.push(v); //Initial orders list of 250 limit
    });
    var headersValues = resPagNat.headers; //Headers to grab next link
    //log.debug("GET Headers", headersValues);
    //log.debug("GET Headers", headersValues.Link);
    var nextLink = headersValues.Link; //Link to grab Next and previous
    //Navigate through Next to get all results
    do {
      if(resPagNat.headers.link && nextLink.indexOf('rel="next"') > -1){
        var parseLink = nextLink
        //log.debug("GET NEXT INDEX", parseLink.indexOf('rel="next"'));
        if (parseLink.indexOf('rel="previous"') > -1) {
          parseLink = parseLink.substr(parseLink.indexOf(",") + 2, parseLink.length);
        }
        parseLink = parseLink.substr(1, parseLink.indexOf(">") - 1);
        parseLink = parseLink.split('page_info=')[1];
        log.debug('Page Info URL', parseLink);
        var nextUrlInfo = appInfo() + '/orders.json?limit=250&fields=id,created_at, financial_status, name&page_info=' + parseLink;
        var nextPageInfoRes = shopifyExtractRequest(nextUrlInfo);
        var nextPagebodyPgNat = JSON.parse(nextPageInfoRes.body);
        //log.debug("GET Orders Per Page", nextPagebodyPgNat);
        nextPagebodyPgNat.orders.forEach(function (v){
          ordersList.push(v); //Initial orders list of 250 limit
        });
        ordersList.push(nextPagebodyPgNat);
        var nextPageHeaders = nextPageInfoRes.headers;
        nextLink = nextPageHeaders.Link
      }
      else {
        nextLink = false;
      }
    }
    while (nextLink);
    log.debug("GET Order Count", ordersList.length);
    //Final Orders List return
    return ordersList;
  }
  catch (e) {
    handleErrorAndSendNotification(e, 'cursor Based Function')
  }
}
function shopifyExtractRequest(shopifyUrl) {
  const shopifyApi = config.load({
    type: config.Type.COMPANY_PREFERENCES
  });
  var apiKey = shopifyApi.getValue('custscript_shopifyapiprodkey');
  //log.debug('Key ID', apiKey);
  var headers = {
    'Authorization': 'Basic '+ apiKey,
    'Accept':'application/json'
  };
  const response = https.get({
    url: shopifyUrl,
    headers: headers
  });
  return response;
}
//You can call from anywhere
const OrderList = cursorBasedPagination();
