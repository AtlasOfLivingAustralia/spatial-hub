package page

class ToolScatterPlotModule extends ModalModule {

    static content = {
        status { $("textarea.logText").text() }

        //Only for multiple scalletplot
        openNewWindow { $("a", text: "open in new window") }
        outputDoc { $("iframe[testTag='outputDocs'") }
    }

    def close() {
        $("button.btn",text:"Close").click()
    }
}
