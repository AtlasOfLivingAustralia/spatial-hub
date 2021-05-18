## Description

The build is setup to work with Firefox and Chrome. 

Have a look at the `build.gradle` and the `src/test/resources/GebConfig.groovy` file.

From line 200 in build.gradle, you will find how we pass different test servers and authentication into tests. 

## Usage

The following commands will launch the tests with the individual browsers:

    ./gradlew firefoxTest

To run with all, you can run:

    ./gradlew test

Test on other servers:

    ./gradlew firefoxTest -DbaseUrl=http://spatial-test.ala.org.au

Authentication info can be passed through with -Dusername and -Dpassword

    /gradlew firefoxTest -Dusername=xxxx -Dpassword=xxxxx

Or stored in a config file. The default config file is located in

    /data/spatial-hub/test/default.properties
    
    username="xxxx@csiro.au"
    password="xxxxx"

We can change the config file with -DconfigFile

    /gradlew firefoxTest -DconfigFile="myconfig.properties"

##Prerequisite 
Layers required to be imported to Spatial Service:

    Koppen Climate Classification (Major Classes) 
    Precipitation - annual (Bio12)
    Temperature - annual mean (Bio01)
    GEOMACS - geometric mean
    ASGS Australian States and Territories

Williams 2030 best 5  - for predict and classify

    el1002, el1019, el1037, el1036, el1013

Libs

    GDAL: gdal_translate

## Samples

    Koppen.kml and Koppen.zip are stored in ./test/resources


## Module Structure

Code structure of functional tests:

    ./test/resources/Functional_Test_Module.png


## Run on Chrome

    ./gradlew chromeTest

Chrome driver > 89 is not available for webdirver
Use npm to set the chrome driver version and reference the lib path from node_modules.

Add `"chromedriver": "89.0.0"` to package.json

Run `npm install`

    In ./gebConfig.groovy

    if (!System.getProperty("webdriver.chrome.driver")) {
        System.setProperty("webdriver.chrome.driver", "node_modules/chromedriver/bin/chromedriver")
    } 
