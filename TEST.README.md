## Description

It uses  Spock and JUnit 4 tests to Spatial Hub / Spatial Service

The build is setup to work with Firefox and Chrome. Have a look at the `build.gradle` and the `src/test/resources/GebConfig.groovy` files.

##Prerequisite 
Layers required to be imported to Spatial Service:

    Koppen Climate Classification (Major Classes) 
    Precipitation - annual (Bio12)
    Temperature - annual mean (Bio01)
    GEOMACS - geometric mean
    ASGS Australian States and Territories

Libs

    GDAL: gdal_translate

## Samples for tests

Resource files for test should be put in `/data/spatial-hub/test`

    koppen.kml
    koppen.shp


## Todo
Chrome driver > 89 is not available for webdirver
Use npm to set the chrome driver version and reference the lib path from node_modules.

Add `"chromedriver": "89.0.0"` to package.json

Run `npm install`

    In ./gebConfig.groovy

    if (!System.getProperty("webdriver.chrome.driver")) {
        System.setProperty("webdriver.chrome.driver", "node_modules/chromedriver/bin/chromedriver")
    } 


## Usage

The following commands will launch the tests with the individual browsers:

    ./gradlew chromeTest
    ./gradlew firefoxTest

Test another server:

    ./gradlew firefoxTest -DbaseUrl=http://spatial-test.ala.org.au

To run with all, you can run:

    ./gradlew test
