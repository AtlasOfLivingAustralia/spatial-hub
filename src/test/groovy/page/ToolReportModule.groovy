package page

class ToolReportModule extends ModalModule {

    static content = {
        reportName  { $("h4.modal-title").text() }
    }

    def getCount(name) {
        def td = $("tr[testTag='reportItem'] td[testTag='name']", text: name)
        def value = td.siblings("[testTag='count']").text()
        if (value){
            try {
                return  Float.parseFloat(value)
            } catch (NumberFormatException e) {
                return null
            }
        }
    }

    def close() {
        $("button.btn",text:"Close").click()
    }

}
