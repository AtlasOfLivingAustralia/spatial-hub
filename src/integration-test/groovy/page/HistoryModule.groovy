package page

import geb.Module

class HistoryModule extends Module {
    static content = {
        title { $("h3[testTag='logs'] span").text() }
    }

    def close() {
        $("button span", text: "Close").parent().click()
    }

    def shouldHaveLogs(){
       return $("table[testTag='logs'] tbody tr").size() > 0
    }

    def getLogCount( name ) {
        def count  = $("table[testTag='logs'] tbody tr td span", text: name).parent().siblings().children('a').text()
        if ( $("table[testTag='logs'] tbody tr td span", text: name).parent().siblings().children('a').text() ) {
            return count.toInteger()
        } else {
            return 0
        }
    }
}
