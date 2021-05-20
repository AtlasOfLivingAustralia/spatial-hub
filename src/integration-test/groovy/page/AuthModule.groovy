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
        if (propertiesFile.exists()) {
            propertiesFile.withInputStream {
                properties.load(it)
            }
        }

        user = System.getProperty("username")?: properties["username"]
        passwd = System.getProperty("password")?: properties["password"]

        if ( user && passwd) {
            username =  user
            password =  passwd
            submit.click()
        } else {
            println("Fatal error: Username or password is not provided!")
            println("Username and password should be passed with -Dusername, -Dpassword")
            println("Or stored in the default property file, e.g. /data/spatial-hub/test/default.property")
            throw new Exception( "Username and password is not supplied!")
        }
    }
}
