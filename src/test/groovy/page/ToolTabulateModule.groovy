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
        reportIframe {$("iFrame#outputDocs")}
        //reportTable { $("table[name='layersTable']") } // does not work?
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

    def reportDisplayed() {
        $("table[name='layersTable']").displayed
    }

    def getCellInReport(row, col){
        def rols =   $("table[name='layersTable']").find("tr")
        return  rols[row].find("td")[col].text()
    }

    def getTableSize() {
        def rols =  $("table[name='layersTable']").find("tr")
        return  rols.size()
    }

}
