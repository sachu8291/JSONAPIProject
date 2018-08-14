/**
 * @desc This is HarDiff Class. This is the API that is used for finding the differences between two requests.
 */
class HarDiff {


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
        this.harLocations = [];
    }

    /**
     * @desc This function is called for loading JSON files. The number of files that can be loaded is atmost 2.
     * @param {String} filelocation - the location of json file.
     * @return {void}.
     */
    loadJSON(fileLocation) {

        if(this.harLocations  == 2){
            console.log("More than 2 files can not be loaded");
            return;
        }
        if (!(this.harLocations.indexOf(fileLocation) > -1)) {
            var harVar = new HarAPI();
            harVar.loadJSON(fileLocation);
            this.harCollections.push(harVar);
            this.harLocations.push(fileLocation);
        }
    }

    /**
     * @desc This method will return the difference between two members of set.
     * @param {Object} Set - The set.
     * @return {List} - It will return list of 2 elements. First element will be the list of element which are in first element of set but not
     * in second element of set. Second element will be the list of element which are in second element of set but not in first element of set.
     */
    getDiffOfSets(set){
        var countMap={};

        for(var i =0;i < set.length;i++){
            var markCount = -1;
            if(i == 1){
                markCount = 1;
            }
            for(var  j=0;j < set[i].length;j++) {
                var urlEntry = set[i][j];
                if (urlEntry in countMap) {
                    countMap[urlEntry] = countMap[urlEntry] + markCount;
                } else {
                    countMap[urlEntry] = markCount;
                }
            }
        }

        var firstRequestUrls=[];
        var secondRequestUrls=[];

        for (var url in countMap){
            if(countMap[url] == -1){
                firstRequestUrls.push(url);
            }

            if(countMap[url] == 1){
                secondRequestUrls.push(url);
            }
        }
        var diffUrls = [];
        diffUrls.push(firstRequestUrls);
        diffUrls.push(secondRequestUrls);
        return diffUrls;
    }


    /**
     * @desc This method is called for finding the difference between size of two members of set.
     * @param {Object} Set - The set.
     * @return {number} - It will return the difference between size of two members of set.
     */
    getDiffInSizeOfSetMembers(set){
        var diffLen = 0;

        if(set.length == 2){
            var firstElementLen =set[0].length;
            var secondElementLen = set[1].length;
            diffLen  = firstElementLen - secondElementLen;
            return diffLen;
        }

        if(set.length == 1){
            return  set.length;
        }
        return diffLen;
    }



    /**
     * @desc This method will return the difference between urls of non-error sub-requests of two requests.
     * @return {List} - It will return list of 2 elements. First element will be the list of urls which are in request 1 but not
     * in request 2. Second element will be the list of urls which are in request 2 but not in request 1.
     */
    getDiffNonErrorUrls(){

        var set=[];

        for(var z = 0;z<this.harCollections.length; z++){
            var harEntry = this.harCollections[z];
            set.push(harEntry.getAllNonErrorURLs());
        }

        return this.getDiffOfSets(set);
    }

    /**
     * @desc This method is called for finding the difference between number of urls of non error sub-requests of two requests.
     * @return {number} - It will return the difference between number of urls of non error sub-requests of two requests.
     */
    getDiffNumOfNonErrorRequest(){
        var set=[];

        for(var z = 0;z<this.harCollections.length; z++){
            var harEntry = this.harCollections[z];
            set.push(harEntry.getAllNonErrorURLs());
        }
        return this.getDiffInSizeOfSetMembers(set);
    }

    /**
     * @desc This method is called for finding the difference between number of urls of error sub-requests of two requests.
     * @return {number} - It will return the difference between number of urls of error sub-requests of two requests.
     */
    getDiffNumOfErrorRequest(){
        var set=[];

        for(var z = 0;z<this.harCollections.length; z++){
            var harEntry = this.harCollections[z];
            set.push(harEntry.getErrorResponseUrls());
        }

        return this.getDiffInSizeOfSetMembers(set);
    }

    /**
     * @desc This method will return the difference between urls of error sub-requests of two requests.
     * @return {List} - It will return list of 2 elements. First element will be the list of urls which are in request 1 but not
     * in request 2. Second element will be the list of urls which are in request 2 but not in request 1.
     */
    getDiffErrorUrls(){

        var set=[];
        for(var z = 0;z<this.harCollections.length; z++){
            var url =[];
            var harEntry = this.harCollections[z];
            set.push(harEntry.getErrorResponseUrls());
        }

        return this.getDiffOfSets(set);
    }

    /**
     * @desc This method will return the difference between urls of sub-requests of type mimeType of two requests.
     * @param {MimeTypeEnum} mimeType - The type of sub-requests.
     * @return {List} - It will return list of 2 elements. First element will be the list of urls which are in request 1 but not
     * in request 2. Second element will be the list of urls which are in request 2 but not in request 1.
     */
    getDiffInMimeTypeUrls(mimeType){

        var set=[];
        for(var z = 0;z<this.harCollections.length; z++){
            var harEntry = this.harCollections[z];
            var urls =  harEntry.getUrlsForMIME(mimeType);
            set.push(urls);
        }

        return this.getDiffOfSets(set);
    }

    /**
     * @desc This method is called for finding the difference between number of urls of sub-requests of type mimeType of two requests.
     * @param {MimeTypeEnum} mimeType - The type of sub-requests.
     * @return {number} - It will return the difference between number of urls of sub-requests of type mimeType of two requests.
     */
    getDiffNumOfMimeRequests(mimeType){

        var set=[];
        for(var z = 0;z<this.harCollections.length; z++){
            var harEntry = this.harCollections[z];
            var urls =  harEntry.getUrlsForMIME(mimeType);
            set.push(urls);
        }

        return this.getDiffInSizeOfSetMembers(set);
    }

    /**
     * @desc This method is called for finding the difference between total loading time of sub-requests of type mimeType of two requests.
     * @param {MimeTypeEnum} mimeType - The type of sub-requests.
     * @return {number} - It will return the difference between total loading time of sub-requests of type mimeType of two requests.
     */
    getDiffLoadingTimeOfMimeRequests(mimeType){

        var firstRequestTime = 0;
        var secondRequestTime = 0;
        var diffTime = 0;
        if(this.harCollections.length == 1){
            return this.harCollections[0].getLoadingTimeForMIMERequests(mimeType);
        }

        if(this.harCollections.length == 2){
            firstRequestTime = this.harCollections[0].getLoadingTimeForMIMERequests(mimeType);
            console.log("The first request time " +firstRequestTime );
            secondRequestTime = this.harCollections[1].getLoadingTimeForMIMERequests(mimeType);
            console.log("The second request time " +secondRequestTime );
            diffTime  = firstRequestTime - secondRequestTime;
            return diffTime;
        }
        return diffTime;
    }

    /**
     * @desc This method is called for finding the difference between total size of sub-requests of type mimeType of two requests.
     * @return {number} - It will return the difference between total size of sub-requests of type mimeType of two requests.
     */
    getDiffSizeOfMimeRequests(mimeType){

        var firstRequestSize = 0;
        var secondRequestSize = 0;
        var diffSize = 0;
        if(this.harCollections.length == 1){
            return this.harCollections[0].getSizeForMIMERequests(mimeType);
        }

        if(this.harCollections.length == 2){
            firstRequestSize = this.harCollections[0].getSizeForMIMERequests(mimeType);
            secondRequestSize = this.harCollections[1].getSizeForMIMERequests(mimeType);
            diffSize  = firstRequestSize - secondRequestSize;
            return diffSize;
        }
        return diffSize;
    }

    /**
     * @desc This method will return the difference between urls of image sub-requests of two requests.
     * @return {List} - It will return list of 2 elements. First element will be the list of urls which are in request 1 but not
     * in request 2. Second element will be the list of urls which are in request 2 but not in request 1.
     */
    getDiffInImageRequests(){
        return this.getDiffInMimeTypeUrls(MimeTypeEnum.IMAGE);
    }

    /**
     * @desc This method is called for finding the difference between number of urls of image sub-requests of two requests.
     * @return {number} - It will return the difference between number of urls of image sub-requests of two requests.
     */
    getDiffNumOfImageRequest(){
        return this.getDiffNumOfMimeRequests(MimeTypeEnum.IMAGE);
    }

    /**
     * @desc This method is called for finding the difference between total loading time of image sub-requests of two requests.
     * @return {number} - It will return the difference between total loading time of image sub-requests of two requests.
     */
    getDiffLoadingTimeOfImageRequest(){
        return this.getDiffLoadingTimeOfMimeRequests(MimeTypeEnum.IMAGE);
    }

    /**
     * @desc This method is called for finding the difference between total size of image sub-requests of two requests.
     * @return {number} - It will return the difference between total size of image sub-requests of two requests.
     */
    getDiffSizeOfImageRequest(){
        return this.getDiffSizeOfMimeRequests(MimeTypeEnum.IMAGE);
    }

    /**
     * @desc This method will return the difference between urls of CSS sub-requests of two requests.
     * @return {List} - It will return list of 2 elements. First element will be the list of urls which are in request 1 but not
     * in request 2. Second element will be the list of urls which are in request 2 but not in request 1.
     */
    getDiffInCSSRequests(){
        return this.getDiffInMimeTypeUrls(MimeTypeEnum.CSS);
    }

    /**
     * @desc This method is called for finding the difference between number of urls of CSS sub-requests of two requests.
     * @return {number} - It will return the difference between number of urls of CSS sub-requests of two requests.
     */
    getDiffNumOfCSSRequest(){
        return this.getDiffNumOfMimeRequests(MimeTypeEnum.CSS);
    }

    /**
     * @desc This method is called for finding the difference between total loading time of CSS sub-requests of two requests.
     * @return {number} - It will return the difference between total loading time of CSS sub-requests of two requests.
     */
    getDiffLoadingTimeOfCSSRequests(){
        return this.getDiffLoadingTimeOfMimeRequests(MimeTypeEnum.CSS);
    }

    /**
     * @desc This method is called for finding the difference between total size of CSS sub-requests of two requests.
     * @return {number} - It will return the difference between total size of CSS sub-requests of two requests.
     */
    getDiffSizeOfCSSRequest(){
        return this.getDiffSizeOfMimeRequests(MimeTypeEnum.CSS);
    }

    /**
     * @desc This method will return the difference between urls of JS sub-requests of two requests.
     * @return {List} - It will return list of 2 elements. First element will be the list of urls which are in request 1 but not
     * in request 2. Second element will be the list of urls which are in request 2 but not in request 1.
     */
    getDiffInJSRequests(){
        return this.getDiffInMimeTypeUrls(MimeTypeEnum.JS);
    }

    /**
     * @desc This method is called for finding the difference between number of urls of JS sub-requests of two requests.
     * @return {number} - It will return the difference between number of urls of JS sub-requests of two requests.
     */
    getDiffNumOfJSRequest(){
        return this.getDiffNumOfMimeRequests(MimeTypeEnum.JS);
    }

    /**
     * @desc This method is called for finding the difference between total loading time of JS sub-requests of two requests.
     * @return {number} - It will return the difference between total loading time of JS sub-requests of two requests.
     */
    getDiffLoadingTimeOfJSRequests(){
        return this.getDiffLoadingTimeOfMimeRequests(MimeTypeEnum.JS);
    }

    /**
     * @desc This method is called for finding the difference between total size of JS sub-requests of two requests.
     * @return {number} - It will return the difference between total size of JS sub-requests of two requests.
     */
    getDiffSizeOfJSRequest(){
        return this.getDiffSizeOfMimeRequests(MimeTypeEnum.JS);
    }

    /**
     * @desc This method will return the difference between urls of Text sub-requests of two requests.
     * @return {List} - It will return list of 2 elements. First element will be the list of urls which are in request 1 but not
     * in request 2. Second element will be the list of urls which are in request 2 but not in request 1.
     */
    getDiffInTextRequests(){
        return this.getDiffInMimeTypeUrls(MimeTypeEnum.TEXT);
    }

    /**
     * @desc This method is called for finding the difference between number of urls of Text sub-requests of two requests.
     * @return {number} - It will return the difference between number of urls of Text sub-requests of two requests.
     */
    getDiffNumOfTextRequest(){
        return this.getDiffNumOfMimeRequests(MimeTypeEnum.TEXT);
    }

    /**
     * @desc This method is called for finding the difference between total loading time of Text sub-requests of two requests.
     * @return {number} - It will return the difference between total loading time of Text sub-requests of two requests.
     */
    getDiffLoadingTimeOfTextRequests(){
        return this.getDiffLoadingTimeOfMimeRequests(MimeTypeEnum.TEXT);
    }

    /**
     * @desc This method is called for finding the difference between total size of Text sub-requests of two requests.
     * @return {number} - It will return the difference between total size of Text sub-requests of two requests.
     */
    getDiffSizeOfTextRequest(){
        return this.getDiffSizeOfMimeRequests(MimeTypeEnum.TEXT);
    }

    /**
     * @desc This method will return the difference between urls of Other sub-requests of two requests.
     * @return {List} - It will return list of 2 elements. First element will be the list of urls which are in request 1 but not
     * in request 2. Second element will be the list of urls which are in request 2 but not in request 1.
     */
    getDiffInOthersRequests(){
        return this.getDiffInMimeTypeUrls(MimeTypeEnum.OTHER);
    }

    /**
     * @desc This method is called for finding the difference between number of urls of Other sub-requests of two requests.
     * @return {number} - It will return the difference between number of urls of Other sub-requests of two requests.
     */
    getDiffNumOfOthersRequest(){
        return this.getDiffNumOfMimeRequests(MimeTypeEnum.OTHER);
    }


    /**
     * @desc This method is called for finding the difference between total loading time of Other sub-requests of two requests.
     * @return {number} - It will return the difference between total loading time of Other sub-requests of two requests.
     */
    getDiffLoadingTimeOfOthersRequests(){
        return this.getDiffLoadingTimeOfMimeRequests(MimeTypeEnum.OTHER);
    }

    /**
     * @desc This method is called for finding the difference between total size of Other sub-requests of two requests.
     * @return {number} - It will return the difference between total size of Other sub-requests of two requests.
     */
    getDiffSizeOfOtherRequest(){
        return this.getDiffSizeOfMimeRequests(MimeTypeEnum.OTHER);
    }


    /**
     * @desc This method is called for finding the difference between the total loading time of two requests.
     * @return {number} - It will return the difference between the total loading time of two requests.
     */
    getDiffInTotalLoadingTime(){
       var firstRequestTime = 0;
       var secondRequestTime = 0;
       var diffTime = 0;
       if(this.harCollections.length == 1){
           return this.harCollections[0].getTotalLoadTime();
       }

       if(this.harCollections.length == 2){
           firstRequestTime = this.harCollections[0].getTotalLoadTime();
           secondRequestTime = this.harCollections[1].getTotalLoadTime();
           diffTime  = firstRequestTime - secondRequestTime;
           return diffTime;
       }
       return diffTime;
    }

    /**
     * @desc This method is called for finding the difference between the total size of two requests.
     * @return {number} - It will return the difference between the total size of two requests.
     */
    getDiffInTotalTransferredBytes(){

        var firstTransferedBytes = 0;
        var secondTransferedBytes= 0;
        var diffTransferedBytes = 0;
        if(this.harCollections.length == 1){
            return this.harCollections[0].getTotalSize();
        }

        if(this.harCollections.length == 2){
            firstTransferedBytes = this.harCollections[0].getTotalSize();
            secondTransferedBytes = this.harCollections[1].getTotalSize();
            diffTransferedBytes  = firstTransferedBytes - secondTransferedBytes;
            return diffTransferedBytes;
        }
        return diffTransferedBytes;

    }

}
