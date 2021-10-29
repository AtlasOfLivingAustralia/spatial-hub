package page
import geb.Module

class MenuModule extends Module {
    static content = {
    }

    def isReady() {
        return $("button[testTag='menu']").first().displayed
    }

    void clickMenu(name) {
        $("button[testTag='menu']", text: name).click()
    }
    void clickMenuitem(name) {
        $("ul li a[testTag='menuItem']", text: name).click()
    }

}
