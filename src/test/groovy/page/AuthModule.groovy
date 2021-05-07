package page

import geb.Module

class AuthModule extends Module {
    static content = {
        username { $("#username") }
        password { $("#password") }
        submit { $("input[name=submit]") }
    }

    void login() {
        username = "qifeng.bai@csiro.au"
        password = "q1w2e3r4"
        submit.click()
    }
}
