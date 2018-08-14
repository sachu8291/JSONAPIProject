/**
 * @desc This is Enum.
 */
var MimeTypeEnum = {"JS":"js", "CSS":"css", "IMAGE":"image", "TEXT":"text", "OTHER":"other"};
Object.freeze(MimeTypeEnum);

/**
 * @desc This is HarDiff Class. This is the API that is used for calling basic functions on json file.
 */
class HarAPI {

    constructor() {
        /**
         * @type {Object}
         * @desc It contains the parsed object of json file.
         */
        this.jsonVar = {};

        /**
         * @type {Object}
         * @desc It is the map. The key is MimeType. The entry is the list of objects of sub-requests.
         */
        this.mimeMap={};

        /**
         * @type {Boolean}
         * @desc It is used to indicate whether the mimeMap has been initialized or not.
         */
        this.initializeMimeMap = false;

        /**
         * @type {Boolean}
         * @desc It is used to indicate whether the entries of sub-requests have been sorted or not.
         */
        this.isSorted = false;
    }

    /**
     * @desc This function is called for loading JSON file.
     * @param {String} filelocation - the location of json file.
     * @return {void}.
     */
    loadJSON(fileLocation) {
        var jsonVarRes;
        $.ajax({
            url: fileLocation,
            async: false,
            dataType: 'json',
            success: function (response) {
                jsonVarRes = response;

            }
        })
        this.jsonVar = jsonVarRes;
    }


    /**
     * @desc This is the compare function which is used in getSlowURLS and getSlowDomains for comparing the elements.
     * @param {Object} a - This is the first element to compare.
     * @param {Object} b - This is the second element to compare.
     * @return {number} - It will return 1, 0 or -1 based on the comparison result.
     */
    compare(a,b) {
        if (a.time < b.time)
            return 1;
        if (a.time > b.time)
            return -1;
        return 0;
    }

    /**
     * @desc This is the function which is used to get urls of slow sub-requests of the request.
     * @param {Number} num - num is the number of slow urls needed. The default value of num is 5.
     * @return {List} - The list of urls of slow sub-requests.
     */
    getSlowURLs(num=5){
        var slowUrls = [];
        var arrEntries  = this.jsonVar.log.entries;
        if(!this.isSorted){
            arrEntries.sort(this.compare);
            this.isSorted = true;
        }
        var count = 0;
        for (var j = 0; j < arrEntries.length; j++){
            if(!(arrEntries[j].response.status == 404)){
                slowUrls.push(arrEntries[j].request.url);
                count = count +1;
            }
            if(count == num){
                break;
            }

        }
        return slowUrls;
    }

    /**
     * @desc This is the function which is used to get domain from url.
     * @param {String} str - The url whose domain is to be found out.
     * @return {String} - The domain of given url.
     */
    getDomainFromUrl(str){
        var index = str.search("//");
        var res = str.substring(index+2, str.length);
        index = res.search("/");
        res = res.substring(0, index);
        if(res.startsWith('www.')){
            res = res.substring(4,res.length);
        }
        return res;
    }


    /**
     * @desc This is the function which is used to get domains of slow sub-requests of the request.
     * @param {Number} num - num is the number of slow urls for which domains need to be calculated. The default value of num is 5.
     * @return {List} - The list of domain of slow sub-requests.
     */
    getSlowDomains(num=5){
        var slowDomains = [];
        var arrEntries  = this.jsonVar.log.entries;
        if(!this.isSorted) {
            arrEntries.sort(this.compare);
            this.isSorted = true;
        }
        var count = 0;
        for (var j = 0; j < arrEntries.length; j++){

            if(!(arrEntries[j].response.status == 404)){
                var domainVar = this.getDomainFromUrl(arrEntries[j].request.url);
                if(!(slowDomains.indexOf(domainVar) > -1)){
                    slowDomains.push(domainVar)
                }else{
                    console.log("The domain is already there " + domainVar);
                }
                count = count +1;
            }

            if(count == num)
                break;
        }
        return slowDomains;
    }


    /**
     * @desc This is the function which is used to get a map. The key of the map is status of sub-response. The value is the number of sub-responses corresponding to status.
     * @return {List} - The map.
     */

    getResponseStatusMap() {

        var map = {};
        var arrEntries  = this.jsonVar.log.entries;

        for (var j = 0; j < arrEntries.length; j++){
            var statusVar = arrEntries[j].response.status;
            if(statusVar in map){
                map[statusVar] = map[statusVar] +1;
            }else{
                map[statusVar] = 1;
            }
        }
        return map;
    }

    /**
     * @desc This is the function which is used to get number of sub-requests corresponding to given status. The examples of status are 402, 301, 200 etc.
     * @param {String} status - the status.
     * @return {List} - The number of sub-requests of response code of status.
     */
    getNumResponses(status)
    {
        var numResponses = 0;
        var map = this.getResponseStatusMap();
        if(status in map){
            numResponses = map[status] ;
        }
        return  numResponses;
    }

    /**
     * @desc This is the function which is used to get a map. The key of the map is MimeType. The value of the map is the objects of sub-requests corresponding to MimeType.
     * @return {Map} - The map.
     */
    getRequestMiMeMap()
    {

        if(this.initializeMimeMap){
            return this.mimeMap;
        }

        this.initializeMimeMap = true;

        var jsPattern = new RegExp("javascript","i");
        var cssPattern = new RegExp("css","i");
        var textPattern = new RegExp("text","i");
        var imagePattern = new RegExp("image","i");
        var arrEntries  = this.jsonVar.log.entries;

        for (var j = 0; j < arrEntries.length; j++){
            var mimeVar = arrEntries[j].response.content.mimeType;
            if(imagePattern.test(mimeVar)){
                if(MimeTypeEnum.IMAGE in  this.mimeMap){
                    this.mimeMap[MimeTypeEnum.IMAGE].push(arrEntries[j]);
                }else{
                    this.mimeMap[MimeTypeEnum.IMAGE] =[];
                    this.mimeMap[MimeTypeEnum.IMAGE].push(arrEntries[j]);
                }
            }else{
                if(jsPattern.test(mimeVar)){
                    if(MimeTypeEnum.JS in  this.mimeMap){
                        this.mimeMap[MimeTypeEnum.JS].push(arrEntries[j]);
                    }else {
                        this.mimeMap[MimeTypeEnum.JS] = [];
                        this.mimeMap[MimeTypeEnum.JS].push(arrEntries[j]);
                    }
                }else{
                    if(cssPattern.test(mimeVar)){
                        if(MimeTypeEnum.CSS in  this.mimeMap){
                            this.mimeMap[MimeTypeEnum.CSS].push(arrEntries[j]);
                        }else {
                            this.mimeMap[MimeTypeEnum.CSS] = [];
                            this.mimeMap[MimeTypeEnum.CSS].push(arrEntries[j]);
                        }
                    }else{
                        if(textPattern.test(mimeVar)){
                            if(MimeTypeEnum.TEXT in  this.mimeMap){
                                this.mimeMap[MimeTypeEnum.TEXT].push(arrEntries[j]);
                            }else {
                                this.mimeMap[MimeTypeEnum.TEXT] = [];
                                this.mimeMap[MimeTypeEnum.TEXT].push(arrEntries[j]);
                            }
                        }else{
                            if(MimeTypeEnum.OTHER in  this.mimeMap){
                                this.mimeMap[MimeTypeEnum.OTHER].push(arrEntries[j]);
                            }else {
                                this.mimeMap[MimeTypeEnum.OTHER] = [];
                                this.mimeMap[MimeTypeEnum.OTHER].push(arrEntries[j]);
                            }
                        }
                    }
                }
            }
        }
        return this.mimeMap;

    }

    /**
     * @desc This function is called to get the url of sub-request having largest loading time corresponding to given <mimeType>.
     * @param {MimeTypeEnum} mimeType - mimeType is of type MimeTypeEnum.
     * @return {String} -  returns the url of sub-request having largest loading time.
     */
    getSlowestFile(mimeType) {
        var urls = [];
        var time = -1;
        this.getRequestMiMeMap();
        var i = 0;
        if (mimeType in this.mimeMap) {
            for (var j = 0; j < this.mimeMap[mimeType].length; j++) {
                if(this.mimeMap[mimeType][j].time > time){
                    url =   this.mimeMap[mimeType][j].request.url;
                    time = this.mimeMap[mimeType][j].time;
                }
            }
        }
        return url;
    }

    /**
     * @desc This function is called to get the url of image sub-request having largest loading time.
     * @return {String} -  returns the url of image sub-request having largest loading time.
     */
    getSlowestImageFile() {
        return this.getSlowestFile(MimeTypeEnum.IMAGE);
    }

    /**
     * @desc This function is called to get the url of sub-request having largest size corresponding to given <mimeType>.
     * @param {MimeTypeEnum} mimeType - mimeType is of type MimeTypeEnum.
     * @return {String} -  returns the url of sub-request having largest size.
     */
    getLargestFile(mimeType) {
        var url = "";
        var size = -1;
        this.getRequestMiMeMap();
        var i = 0;
        if (mimeType in this.mimeMap) {
            for (var j = 0; j < this.mimeMap[mimeType].length; j++) {
                if(this.mimeMap[mimeType][j].response.content.size > size){
                    url =   this.mimeMap[mimeType][j].request.url;
                    size = this.mimeMap[mimeType][j].response.content.size;
                }
            }
        }
        return url;
    }

    /**
     * @desc This function is called to get the url of image sub-request having largest size.
     * @return {String} -  returns the url of image sub-request having largest size.
     */
    getLargestImageFile() {
        return this.getLargestFile(MimeTypeEnum.IMAGE);
    }

    /**
     * @desc This function is called to get location.
     * @return {String} -  returns the location of the request.
     */
    getLocation()   {
        return this.jsonVar.log.location;
    }


    /**
     * @desc This is the function which is used to get a map. The key of the map is MimeType. The value of the map is the total loading time by sub-requests corresponding to MimeType.
     * @return {Map} - The map.
     */
    getLoadTimeMIMEMap()  {
        var loadTimeMimeMap = {};
        this.getRequestMiMeMap();
        for (var i in MimeTypeEnum){
            var loadTime = 0;
            for (var j = 0; j < this.mimeMap[MimeTypeEnum[i]].length; j++) {
                loadTime = loadTime + this.mimeMap[MimeTypeEnum[i]][j].time;
            }
            loadTimeMimeMap[MimeTypeEnum[i]] = loadTime;
        }

        return loadTimeMimeMap;
    }

    /**
     * @desc This is the function which is used to get a map. The key of the map is MimeType. The value of the map is the total size of sub-requests corresponding to MimeType.
     * @return {Map} - The map.
     */
    getSizeMIMEMap()  {
        var sizeMimeMap = {};
        this.getRequestMiMeMap();
        for (var i in MimeTypeEnum){
            var size = 0;
            for (var j = 0; j < this.mimeMap[MimeTypeEnum[i]].length; j++) {
                size = size + this.mimeMap[MimeTypeEnum[i]][j].response.content.size;
            }
            sizeMimeMap[MimeTypeEnum[i]] = size;
        }
        return sizeMimeMap;
    }

    /**
     * @desc This is the function which is used to get the total size of all the sub-requests corresponding to mimeType.
     * @param {MimeTypeEnum} mimeType - mimeType is of type MimeTypeEnum.
     * @return {Number} - The total size of all the sub-requests corresponding to mimeType.
     */
    getSizeForMIMERequests(mimeType){
        return this.getSizeMIMEMap()[mimeType];
    }

    /**
     * @desc This is the function which is used to get the total loading time of all the sub-requests corresponding to mimeType.
     * @param {MimeTypeEnum} mimeType - mimeType is of type MimeTypeEnum.
     * @return {Number} - The total loading time of all the sub-requests corresponding to mimeType.
     */
    getLoadingTimeForMIMERequests(mimeType){
        return this.getLoadTimeMIMEMap()[mimeType];
    }

    /**
     * @desc This is the function which is used to get list of urls of all the sub-requests corresponding to mimeType.
     * @param {MimeTypeEnum} mimeType - mimeType is of type MimeTypeEnum.
     * @return {List} - The List of urls of all the sub-requests corresponding to mimeType.
     */
    getUrlsForMIME(mimeType){
        var urls = [];
        this.getRequestMiMeMap();
        var i = 0;
        if (mimeType in this.mimeMap) {
            for (var j = 0; j < this.mimeMap[mimeType].length; j++) {
                urls.push(this.mimeMap[mimeType][j].request.url);
            }
        }
        return urls;
    }

    /**
     * @desc This is the function which is used to get list of urls of all the error sub-requests.
     * @return {List} - The List.
     */
    getErrorResponseUrls() {
        var errorUrls = [];
        var arrEntries  = this.jsonVar.log.entries;

        for (var j = 0; j < arrEntries.length; j++){
            if(arrEntries[j].response.status == 404){
                errorUrls.push(arrEntries[j].request.url);
            }

        }
        return errorUrls;
    }

    /**
     * @desc This is the function which is used to get loading time of given url.
     * @param {String} url - The url.
     * @return {Number} - The loading time of url.
     */
    getLoadTimeForUrl(url) {
        var arrEntries  = this.jsonVar.log.entries;

        for (var j = 0; j < arrEntries.length; j++){
            if(arrEntries[j].request.url == url){
                return  arrEntries[j].time;
            }
        }
        return -1;
    }

    /**
     * @desc This is the function which is used to get list of urls of all the non-error sub-requests.
     * @return {List} - The List.
     */
    getAllNonErrorURLs(){
        var urls = [];
        var arrEntries  = this.jsonVar.log.entries;
        for (var j = 0; j < arrEntries.length; j++){
            if(!(arrEntries[j].response.status == 404)){
                urls.push(arrEntries[j].request.url);
            }

        }
        return urls;
    }

    /**
     * @desc This is the function which is used to get size in bytes of all the sub-requests.
     * @return {Number} - Total Size.
     */
    getTotalSize(){
        var sizeMimeMap = this.getSizeMIMEMap();
        var size = 0;
        for (var i in MimeTypeEnum){
            if(sizeMimeMap[MimeTypeEnum[i]] > 0){
                size = size +  sizeMimeMap[MimeTypeEnum[i]];
            }
        }
        return size;
    }

    /**
     * @desc This is the function which is used to get loading time of all the sub-requests.
     * @return {Number} - Total Time.
     */
    getTotalLoadTime() {

        var arrPages  = this.jsonVar.log.pages;
        var totalTime = 0;
        for (var j = 0; j < arrPages.length; j++){
            var mapPageTimings = arrPages[j].pageTimings;
            if(mapPageTimings!= null) {
                if ("onLoad" in mapPageTimings) {
                    var loadTime = mapPageTimings["onLoad"];
                    if (loadTime > 0) {
                        totalTime = totalTime + loadTime;
                    }
                }
            }
        }
        return totalTime;
    }

    /**
     * @desc This is the function which is used to get size in bytes of given url.
     * @param {String} url - The url.
     * @return {Number} - The size.
     */
    getSizeForUrl(url) {
        var arrEntries  = this.jsonVar.log.entries;

        for (var j = 0; j < arrEntries.length; j++){
            if(arrEntries[j].request.url == url){
                return  arrEntries[j].response.content.size;
            }
        }
        return -1;
    }

    /**
     * @desc This is the function which is used to get the information about all the sub-requests of request. Each line will contain the url, status and size.
     * @return {String} - The string containing the information about all the sub-requests of request. Each line will contain the url, status and size.
     */
    getInfoForDiff(){
        var arrEntries  = this.jsonVar.log.entries;
        var infoText = "";
        for (var j = 0; j < arrEntries.length; j++){
            infoText = infoText + arrEntries[j].request.url;
            infoText = infoText +" "+  arrEntries[j].response.status;
            infoText = infoText +" "+  arrEntries[j].response.content.size;
            infoText = infoText + "\n";
        }
        return infoText;
    }

}



