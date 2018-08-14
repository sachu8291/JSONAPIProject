/**
 * @desc This is ItemInfo Class. It is used to represent the intermediate data.
 */
class ItemInfo{
    constructor(id, count, loadTime) {
        this.id =  id;
        this.count= count;
        this.loadTime = loadTime;
    }

    incLoadTime(loadTime){
        this.loadTime = this.loadTime + loadTime;
    }

    incCount(){
        this.count= this.count + 1;
    }
}

/**
 * @desc This is HarCommon Class. It is the api that is used to find the common urls/domains of slow sub-requests among requests.
 */
class HarCommon {
    constructor() {
        /**
         * @type {Object}
         * @desc This is the list having members of object of type HarAPI.
         */
        this.harCollections = [];
        /**
         * @type {Object}
         * @desc This is the list having paths of loaded HAR files.
         */
        this.harLocations =[];
    }

    /**
     * @desc This function is called for loading JSON file.
     * @param {String} filelocation - the location of json file.
     * @return {void}.
     */
    loadJSON(fileLocation) {
        if(!(this.harLocations.indexOf(fileLocation) > -1)){
            var harVar = new HarAPI();
            harVar.loadJSON(fileLocation);
            this.harCollections.push(harVar);
            this.harLocations.push(fileLocation);
        }
    }


    /**
     * @desc This is the compare function which is passed to either getSlowCommonUrlsViaLoadTimeFromAllUrls or getSlowCommonDomainsViaLoadTimeFromAllDomains for comparing elements. The below function is preferred one.
     * @param {ItemInfo} a - This is the first element to compare.
     * @param {ItemInfo} b - This is the second element to compare.
     * @return {number} - It will return 1, 0 or -1 based on the comparison result.
     */
    compareByLoadTimeCount(a,b) {
        if (a.loadTime < b.loadTime)
            return 1;
        if (a.loadTime > b.loadTime)
            return -1;
        if(a.count > b.count)
            return 1;
        if(a.count < b.count)
            return -1;
        return 0;
    }

    /**
     * @desc This is the compare function which is passed to either getSlowCommonUrlsViaLoadTimeFromAllUrls or getSlowCommonDomainsViaLoadTimeFromAllDomains for comparing elements.
     * @param {ItemInfo} a - This is the first element to compare.
     * @param {ItemInfo} b - This is the second element to compare.
     * @return {number} - It will return 1, 0 or -1 based on the comparison result.
     */
    compareByCount(a,b) {
        if(a.count < b.count)
            return 1;
        if(a.count > b.count)
            return -1;
        if (a.loadTime < b.loadTime)
            return 1;
        if (a.loadTime > b.loadTime)
            return -1;
        return 0;
    }


    /**
     * @desc  This method will return common urls of slow sub-requests among all requests.
     * @param {number} num - This is the number of slow sub-requests.
     * @param {Function} compareFunc - This is the reference to compare function.
     * @return {List} - It will return the list of urls of slow sub-requests among all requests.
     */
    getSlowCommonUrlsViaLoadTimeFromAllUrls(num,compareFunc){
        var map = {};
        for(var z = 0;z<this.harCollections.length; z++){
            var harEntry = this.harCollections[z];
            var slowUrls =  harEntry.getAllNonErrorURLs();
            for(var j =0;j < slowUrls.length;j++){
                var slowUrlEntry = slowUrls[j];
                var loadTime =  harEntry.getLoadTimeForUrl(slowUrlEntry);
                if(loadTime > -1) {
                    if (slowUrlEntry in map) {
                        map[slowUrlEntry].incCount();
                        map[slowUrlEntry].incLoadTime(loadTime);
                    } else {
                        var urlInfoEntry = new ItemInfo(slowUrlEntry,1,loadTime);
                        map[slowUrlEntry] = urlInfoEntry;
                    }
                }
            }
        }

        var urlInfoList = [];
        for (var url in map){
            urlInfoList.push(map[url]);
        }

        urlInfoList.sort(compareFunc);

        var topUrlInfoList = [];
        for (var j = 0; j < urlInfoList.length; j++){
            if( j == num){
                break;
            }
            topUrlInfoList.push(urlInfoList[j]);
        }

        return topUrlInfoList;
    }



    /**
     * @desc  This method will return common domains of slow sub-requests among all requests.
     * @param {number} num - This is the number of slow sub-requests.
     * @param {Function} compareFunc - This is the reference to compare function.
     * @return {List} - It will return the list of domains of slow sub-requests among all requests.
     */
    getSlowCommonDomainsViaLoadTimeFromAllDomains(num,compareFunc){

        var map = {};
        for(var z = 0;z<this.harCollections.length; z++){
            var harEntry = this.harCollections[z];
            var urls =  harEntry.getAllNonErrorURLs();
            for(var j =0;j < urls.length;j++){
                var urlEntry = urls[j];
                var loadTime =  harEntry.getLoadTimeForUrl(urlEntry);
                if(loadTime > -1) {
                    var domainName = harEntry.getDomainFromUrl(urlEntry);
                    if (domainName in map) {
                        map[domainName].incCount();
                        map[domainName].incLoadTime(loadTime);
                    } else {
                        var domainInfoEntry = new ItemInfo(domainName,1,loadTime);
                        map[domainName] = domainInfoEntry;
                    }
                }
            }
        }

        var domainInfoList = [];
        for (var domain in map){
            domainInfoList.push(map[domain]);
        }

        domainInfoList.sort(compareFunc);

        var topDomainInfoList = [];
        for (var j = 0; j < domainInfoList.length; j++){
            if( j == num){
                break;
            }
            topDomainInfoList.push(domainInfoList[j]);
        }

        return topDomainInfoList;
    }


}





