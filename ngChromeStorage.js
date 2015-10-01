'use strict';

//TODO: Add explanations

(function() {
angular.module('ngChromeStorage', []).

factory('$chromeStoreSync', _storageFactory('sync')).
factory('$chromeStoreLocal', _storageFactory('local'));

function _storageFactory(area){

	return ['$rootScope', function($rootScope){
		// var area = area,
		var	chromeStorage = chrome.storage[area],
			NUMBER_OF_OPERATIONS = 0,
			$storage = { 
				$init : function(data){
					_addop();
					chromeStorage.get(null, function(items){

						angular.forEach(items, function(val, key){
							if ('ngCS-' === key.slice(0, 5)) {
								$storage[key.slice(5)] = val;
							}
						});	
						_last$storage = angular.copy($storage);

						angular.forEach(data, function(value, key){
							if(!angular.isDefined($storage[key])){
								$storage[key] = value;
							}
						});
						
						$rootScope.$apply();
					});
				},
				$clearAll : function() {
					chromeStorage.clear();
				}
			},
			_last$storage = {};		

		$rootScope.$watch(function() {
			var lastKeys = Object.keys( _last$storage).filter(function(v){return v[0] != '$' ? true : false;});
			var data = {};
			angular.forEach($storage, function(v, k) {
				if(angular.isDefined(v) && '$' !== k[0] && !angular.equals($storage[k], _last$storage[k])){
					data['ngCS-'+ k] = v;
				}
				for( var i =0; i < lastKeys.length; i++ ){
					if( k == lastKeys[i] ){
						lastKeys.splice(i,1);
					}
				}		
			});
			if(!angular.equals(data, {})){
				_addop();
				chromeStorage.set(data, function(){
				});
			}
			if(!angular.equals(lastKeys, [])){
				_addop();
				chromeStorage.remove(lastKeys.map(function(k){return "ngCS-"+k})); // remove deleted keys
			}
			_last$storage = angular.copy($storage);
		});

		chrome.storage.onChanged.addListener(function(changes, nameSpace){
			if(nameSpace == area){
				angular.forEach(changes, function(v, k){
					if ('ngCS-' === k.slice(0, 5)) {
						v.newValue ? $storage[k.slice(5)] = v.newValue : delete $storage[k.slice(5)];
						_last$storage = angular.copy($storage);
						
						$rootScope.$apply();
					}
				});
			}
		});

		var _addop = function(){NUMBER_OF_OPERATIONS+=1;};

		return $storage; 

	}];	
}
})();