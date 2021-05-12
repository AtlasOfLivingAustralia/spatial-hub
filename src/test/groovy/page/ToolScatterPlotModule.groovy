package page

class ToolScatterPlotModule extends ModalModule {

    static content = {
        status { $("textarea.logText").text() }

        //Only for multiple scalletplot
        openNewWindow { $("a", text: "open in new window") }

        //Need to switch iFrame before access an element in iFrame
        //e.g  driver.switchTo().frame("outputDocs")
        outputDoc { $("iframe[testTag='outputDocs'") }
    }

    def close() {
        $("button.btn",text:"Close").click()
    }
}
