var yearKey = context.key;
var items = context.values;
const finalWrap = [];
items.forEach(function (v){
  var parsedItems = JSON.parse(v);
  finalWrap.push(parsedItems);
});
log.debug("FINAL WRAP", finalWrap);
//Create File and drop in File Cabinet
var fileObj = file.create({
    name    : 'Inventory_Snapshots_12019.json',
    fileType: file.Type.JSON,
    contents: JSON.stringify(finalWrap)
});
fileObj.folder = 65090;
var fileId = fileObj.save();
