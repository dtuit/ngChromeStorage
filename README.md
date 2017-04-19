ngChromeStorage
===================

An [AngularJS](https://github.com/angular/angular.js) module for [chrome.storage](https://developer.chrome.com/extensions/storage), Contains two services `$chromeStoreSync` and `$chromeStoreLocal` which give access to [`chrome.storage.sync`](https://developer.chrome.com/extensions/storage#property-sync) and [`chrome.storage.local`](https://developer.chrome.com/extensions/storage#property-local) respectively.
###Features
* **Two-way binding** no need to use getters and setters, storage objects appear as plain old JavaScript objects.

### Install
##### bower : 
`bower install ngChromeStorage`

### Usage
```javascript
angular.module('app', [
    'ngChromeStorage'
]).controller('Ctrl', function(
    $scope,
    $chromeStoreSync,
    $chromeStoreLocal
){});
```
#### Read and Write
Pass `$chromeStoreSync` and/or`$chromeStoreLocal` and attach to scope
```javascript
$scope.$store = $chromeStoreSync
```
Use it like a normal javascript object.
```html
<body ng-controller="Ctrl">
	<button ng-click="$store.counter = $store.counter + 1">{{$store.counter}}</button>
</body>
```
here any changes made to `$scope.$store` , `$chromeStoreSync` and`chrome.storage.sync` will automatically be synced this includes changes detected by  [`chrome.storage.onChanged` ](https://developer.chrome.com/extensions/storage#event-onChanged)

### Note
*  Internally changes are detected by using `$rootScope.$watch` so be aware of the potential proformance issues.
*  `chrome.storage` is an asynchronous API, and ngChromeStorage gives it a seemingly synchronous interface.
* [`chrome.storage.sync`](https://developer.chrome.com/extensions/storage#property-sync) has limitations that you must be mindful of, with ngChromeStorage it is easy to exceed these limits.
  * `MAX_WRITE_OPERATIONS_PER_MINUTE` 120 
  * `MAX_WRITE_OPERATIONS_PER_HOUR` 1,800
  * `QUOTA_BYTES_PER_ITEM` 8,192

----------
