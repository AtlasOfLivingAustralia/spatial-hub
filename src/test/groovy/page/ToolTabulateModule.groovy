package page
/**
 * 2-D Tabulation
 */

class ToolTabulateModule extends ModalModule {

    static content = {
        layer1 { $("select[ng-model='layer1']")}
        layer2 { $("select[ng-model='layer2']")}
        reportType { $("select[ng-model='type']")}

        //csv report
        reportIframe {$("iFrame[testTag='outputDocs']")}
        reportTable { $("table[name='layersTable']") }
    }

    def selectLayer1(name) {
        layer1.find("option", text: name).click()
    }

    def selectLayer2(name) {
        layer2.find("option", text: name).click()
    }

    /**
     *
     * @param area, species, occurrences
     * @return
     */
    def selectReportType(name) {
        reportType.find("option", text: name).click()
    }

    def getCellInReport(row, col){
        def rols =  reportTable.find("tr")
        return  rols[row].find("td")[col].text()
    }

    def getTableSize() {
        def rols =  reportTable.find("tr")
        return  rols.size()
    }

}
