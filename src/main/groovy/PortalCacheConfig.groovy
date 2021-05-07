

config {
            diskStore {
                path "/data/${appName}/cache"
            }

            cache {
                name 'proxy'
                eternal false
                overflowToDisk true
                maxElementsInMemory 10000
                maxElementsOnDisk 100000
            }

            cache {
                name 'qid'
                eternal false
                overflowToDisk true
                maxElementsInMemory 10000
                maxElementsOnDisk 100000
            }
            
            cache {
        		name 'viewConfigCache'
        		timeToLiveSeconds(3600 * 12)
    		}

            defaultCache {
                maxElementsInMemory 10000
                eternal false
                timeToIdleSeconds 120
                timeToLiveSeconds 120
                overflowToDisk true
                maxElementsOnDisk 100000
                diskPersistent false
                diskExpiryThreadIntervalSeconds 120
                memoryStoreEvictionPolicy 'LRU'
            }

            defaults {
                eternal false
                overflowToDisk false
                maxElementsInMemory 20000
                timeToLiveSeconds 3600
            }
        }