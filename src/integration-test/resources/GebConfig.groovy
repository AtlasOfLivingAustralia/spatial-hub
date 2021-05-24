/**
 * To run the tests with all browsers just run “./gradlew firefoxTest”
 *
 * ./gradlew firefoxTest -baseUrl="https://spatial-test.ala.org.au" --tests="AddFacetSpec" -Dusername=xxxx -Dpassword=xxxxx
 *
 * Username and password can be stored in default config file: /data/spatial-hub/test/default.properties
 * We can also point to another property file by passing --DconfigFile=xxxxxx
 *
 */
import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.chrome.ChromeOptions
import org.openqa.selenium.firefox.FirefoxDriver

import java.awt.Dimension

waiting {
	timeout = 2
}

if (!System.getProperty("webdriver.chrome.driver")) {
	System.setProperty("webdriver.chrome.driver", "node_modules/chromedriver/bin/chromedriver")
}

environments {
	// run via “./gradlew :integrationTest -Ddriver=chrome”
	chrome {
		driver = {
			def chrome = new ChromeDriver()
			chrome.manage().window().fullscreen()
			chrome
		}
	}

	chromeHeadless {
		driver = {
			ChromeOptions o = new ChromeOptions()
			o.addArguments('headless')
			def chrome = new ChromeDriver(o)
			chrome.manage().window().fullscreen()
			chrome
		}
	}

	firefox {
		atCheckWaiting = 1
		driver = {
			def firefox  = new FirefoxDriver()
			firefox.manage().window().fullscreen() //run full screen
			firefox
			}
		}
}



