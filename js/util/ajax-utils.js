class AjaxUtils {
    /**
     * @param url {String}
     * @return {Promise<string>}
     */
    loadHtml(url) {
        return $.ajax({url: url, dataType: html});
    }
}