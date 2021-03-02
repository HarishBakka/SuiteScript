CurrentRecord.getSubrecord(options);
`to get a subrecord that does not exist, a new subrecord is created and returned, With this change in behavior, it is no
longer possible to use this method to check whether a record has an existing subrecord. 
Use the`
CurrentRecord.hasSubrecord(options); //method to determine if the field contains a subrecord.

define(['N/suiteAppInfo', 'N/email']); 
`new Module includes methods that let you access information about installed bundles and SuiteApps. These methods let you determine if a bundle
or SuiteApp is installed, retrieve a list of all installed bundles and SuiteApps, or retrieve a list of bundles
and SuiteApps that contain certain scripts`
//'N/email' Module has new feature EmaiI Send Security Update

//Asynchronous Server-Side Support
`SuiteScript 2.1 now fully supports non-blocking asynchronous server-side promises. Server-side promises
are expressed using the asnyc, await, and promise keywords. This change continues our support for
ECMAScript 2019 (ES2019) language features in SuiteScript. It lets you upload and deploy SuiteScript 2.1
scripts that include the async, await, and promise keywords. For this initial release, the following modules
are supported:`

//Regular javascript function method witout async
function hello() { return "Hello" };
hello();
//But what if we turn this into an async function? Try the following:
async function hello() { return "Hello" };
hello();
//You can also create an async function expression, like so:
let hello = async function() { return "Hello" };
hello();
//And you can use arrow functions:
let hello = async () => { return "Hello" };
//To actually consume the value returned when the promise fulfills, since it is returning a promise, we could use a .then() block:
hello().then((value) => console.log(value));
//or even just shorthand such as
hello().then(console.log)
`The advantage of an async function only becomes apparent when you combine it with the await keyword. await only works inside async functions within regular JavaScript code, however it can be used on it's own with JavaScript modules.
await can be put in front of any async promise-based function to pause your code on that line until the promise fulfills, then return the resulting value. You can use await when calling any function that returns a Promise, including web API functions.`
//Here is a trivial example:
async function hello() {
  return greeting = await Promise.resolve("Hello");
};
hello().then(alert);

//Supported modules
■ N/http Module
■ N/https Module
■ N/query Module
■ N/search Module
■ N/transaction Module

■ define(['N/file']function(file)); - module to copy files in the File Cabinet
■ file.copy(options)
