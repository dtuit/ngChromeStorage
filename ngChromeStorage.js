'use strict';
(function() {
    angular.module('ngChromeStorage', [])
    	.provider('$chromeStoreSync', _storageProvider('sync'))
    	.provider('$chromeStoreLocal', _storageProvider('local'));

    function _storageProvider(storageArea) {
        return function() {
            var storageKeyPrefix = 'ngCStore-';
            this.setKeyPrefix = function(prefix) {
                if (typeof prefix != 'string') {
                    throw new TypeError('[ngChromeStorage] - ' + storageType + 'Provider.setKeyPrefix() expects a String.');
                }
                storageKeyPrefix = prefix;
            };
            this.get = function(key, callback) {
                chrome.storage[storageArea].get(key, callback);
            };
            this.set = function(data, callback) {
                chrome.storage[storageArea].set(data, callback);
            };
            this.$get = 
            	['$rootScope',
            	 '$log',
            	 '$q',
                function(
                	$rootScope,
                	$log,
                	$q
                	){
                    function getStorageArea(storageArea) {
                        try {
                            chrome.storage[storageArea];
                        } catch (ex) {
                            throw new Error('chrome.storage.' + storageArea + ' is not accessible, make sure to include "storage" permision in app manifest.json');
                        }
                        return chrome.storage[storageArea];
                    }

                    var prefixLength = storageKeyPrefix.length;
                    var chromeStorage = getStorageArea(storageArea);
                    var _lastStorage = {};

                    var $storage = {
                        $default: function(items) {

                            return $storage.$pull().then(function(res){
                            	for (var k in items) {
	                                if (!angular.isDefined($storage[k])) {
	                                    $storage[k] = angular.copy(items[k]);
	                                }
	                            }
	                            return res;
                            });

                            // var defered = $q.defer();

                            // for (var k in items) {
                            //     if (!angular.isDefined($storage[k])) {
                            //         $storage[k] = angular.copy(items[k]);
                            //     }
                            // }
                            // return $storage.$pull();
                        },
                        $pull: function() {
                            var defered = $q.defer();
                            chromeStorage.get(null, function(items) {
                                for (var k in items) {
                                    if (storageKeyPrefix === k.slice(0, prefixLength)) {
                                        $storage[k.slice(prefixLength)] = items[k];
                                    }
                                }
                                defered.resolve({
                                    _store: $storage,
                                    _chromeStore: items
                                });
                            });
                            return defered.promise;
                        },
                        $push: function() {
                        	// var defered = $q.defer();

							var lastKeys = Object.keys( _lastStorage).filter(function(v){return v[0] != '$' ? true : false;});
							var data = {};
							angular.forEach($storage, function(v, k) {
								if(angular.isDefined(v) && '$' !== k[0] && !angular.equals($storage[k], _lastStorage[k])){
									data[storageKeyPrefix + k] = v;
								}
								for( var i =0; i < lastKeys.length; i++ ){
									if( k == lastKeys[i] ){
										lastKeys.splice(i,1);
									}
								}		
							});
							if(!angular.equals(data, {})){
								chromeStorage.set(data, function(){
								});
							}
							if(!angular.equals(lastKeys, [])){
								chromeStorage.remove(lastKeys.map(function(k){return storageKeyPrefix+k}));
							};
							_lastStorage = angular.copy($storage);
                        },
						$reset: function(items) {
							var oldKeys = [];

							for(var k in $storage){
								if (k[0] !== '$'){
									delete $storage[k];
									oldKeys.push( storageKeyPrefix + k);
								}
							}
							chromeStorage.remove(oldKeys, function(){});

							return $storage.$default(items);
						},
                        $getBytesInUse: function(keys) {
                            var defered = $q.defer();
                            chromeStorage.getBytesInUse(keys, function(n) {
                                defered.resolve(n);
                            });
                            return defered.promise;
                        },
                        $ChromeStoreApi : chromeStorage
                        
                    };

                    $rootScope.$watch(function(){
                    	$storage.$push();
                    });

                    chrome.storage.onChanged.addListener(function(changes, nameSpace){
						if(nameSpace == storageArea){
							angular.forEach(changes, function(v, k){
								if (storageKeyPrefix === k.slice(0, prefixLength)) {
									v.newValue ? $storage[k.slice(prefixLength)] = v.newValue : delete $storage[k.slice(prefixLength)];
									_lastStorage = angular.copy($storage);
									
									$rootScope.$apply();
								}
							});
						}
					});

					return $storage;

                }
            ];
        };
    }
})();