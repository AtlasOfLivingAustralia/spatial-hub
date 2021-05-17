package page

import geb.Module

class AuthModule extends Module {
    static content = {
        username { $("#username") }
        password { $("#password") }
        submit { $("input[name=submit]") }
    }

    void login() {
        String user =""
        String passwd = ""

        Properties properties = new Properties()
        File propertiesFile = new File(System.getProperty("configFile"))
        propertiesFile.withInputStream {
            properties.load(it)
        }

        if ( System.getProperty("username")) {
           user = System.getProperty("username")
        } else {
            user = properties["username"]
        }

        if ( System.getProperty("password")) {
            passwd = System.getProperty("password")
        } else {
            passwd = properties["password"]
        }

        if ( user && passwd) {
            username =  user
            password =  passwd
            submit.click()
        } else {
            throw new Exception( "Username and password is not supplied!")
        }
    }
}
