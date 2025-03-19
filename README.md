###  spatial-hub  [![Build Status](https://travis-ci.org/AtlasOfLivingAustralia/spatial-hub.svg?branch=master)](https://travis-ci.org/AtlasOfLivingAustralia/spatial-hub)

# Spatial-hub
Replacement for spatial-portal with Grails, AngularJS and Leaflet.

**_See also:_ [Integration Tests](#Tests)**

## Setup production

Modify configurations in

    /data/spatial-hub/config/spatial-hub-config.yml

The default production url is https://spatial.ala.org.au

The default develop url is http://devt.ala.org.au:8079

The dependent services point to other production servers by default

### Minimum configurations in external config file:

        google:
            apikey: xxxxxxxx

### Check the following configurations if deployed on different servers.
   
####Example:
    grails.serverURL: "https://spatial-test.ala.org.au"
    grails.app.context: "/"
    
    googleAnalyticsId: "xxxxxxxx"
    google:
        apikey: "xxxxxxxxxxxxxx"
    
    layersService:
        url: "https://spatial-test.ala.org.au/ws"
    
    geoserver:
        url: "https://spatial-test.ala.org.au/geoserver"


## How to customise
### menu-config.json
* The main menu is overridden with `/data/spatial-hub/menu-config.json`.

```$xslt
/* Example */
[
  {
    "name": "Add to map", /* Dropdown menu label */
    "width": 110, /* Dropdown menu button width in pixels. The left hand panel is a fixed width. */
    "items": [ /* Dropdown menu items */
      {
        "name": "Species", /* Button label */
        "open": "ToolAddSpeciesService" /* Open a service based tool. Compatible services are found in grails-app/assets/javascripts/spApp/services/tool*Service.js
      },
      {
        "name": "Area", /* Button label */
        "open": "addArea" /* Open a controller based tool. Compatible controllers are found in grails-app/assets/javascripts/spApp/controller/*Ctrl.js
      },
      {
        "name": "Detailed Area Report (PDF)", /* Button label */
        "open": "AreaReport" /* Open a spatial-service based tool. Available tools are found in spatial-service /admin/capabilities. 
      },
      {
        "name": "Getting Started", /* Button label */
        "open": "https://www.ala.org.au/spatial-portal-help/getting-started" /* Open a https:// or http:// url */
      }
    ]
  },
```

### view-config.json
* Templated dialog appearance can be overridden with `/data/spatial-hub/view-config.json`.

```$xslt
/* Example */
{
  "Maxent": { /* Name of tool in spatial-service capabilities */
    "view": [ /* List of input sections in the order to displa */
      {
        "name": "Area to restrict prediction", /* Title of first input section */ 
        "inputs": [ /* List of inputs from tool capabilities for this section */ 
          "area"
        ]
      },
      {
        "name": "MaxEnt options", /* Title of the second input section */
        "inputs": [ /* List of inputs from tool capabilities for this section */
          "testPercentage",
          "resolution"
        ]
      }
    ],
    "input": { /* Override input specifications */
      "testPercentage": { /* Input name */
        "description": "Percentage of records used for testing model?", /* new description */
        "constraints": {
          "default": 0.2 /* New default value */
        }
      }
  }
}
``` 

## Header and Footer

##### Configure [ala-bootstrap3](https://github.com/AtlasOfLivingAustralia/ala-bootstrap3)
* This is recommended since it can be reused by all components that use [ala-bootstrap3](https://github.com/AtlasOfLivingAustralia/ala-bootstrap3)

    1. Fork [commonui-bs3](https://github.com/AtlasOfLivingAustralia/commonui-bs3), modify and deploy

    1. Configure to use the deployed [commonui-bs3](https://github.com/AtlasOfLivingAustralia/commonui-bs3)
    ```
    # edit /data/spatial-hub/config/spatial-hub-config.properties
    skin.layout=generic
    headerAndFooter.baseURL=<URL to deployed commonui-bs3>
    ```

##### Fork [spatial-hub](https://github.com/AtlasOfLivingAustralia/spatial-hub), modify and deploy
* Use when development of spatial-hub is expected. It can be used with with the other methods.

##### Local files
* Adding files local to deployment can add new layouts and resources.
    
    1. Add a new layout gsp to the ```/data/spatial-hub/views/layouts``` directory.
        ```
        /data/spatial-hub/views/layouts/myLayout.gsp
        ```

    1. Additional assets can be added to the ```/data/spatial-hub/assets``` directory.
        ```
        /data/spatial-hub/assets/css/externalCss.css
        /data/spatial-hub/assets/js/externalJs.js
        /data/spatial-hub/assets/img/externalImage.png
        ```

    1. Assets can be referenced within the new layout gsp.
        ```
        <asset:stylesheet src="css/externalCss.css" />
        <asset:javascript src="js/externalJs.js" />
        <asset:image src="img/externalImg.png" />
        ```

    1. Change config to use the new layout gsp.
        ```
        # edit /data/spatial-hub/config/spatial-hub-config.properties
        skin.layout=myLayout
        ```

> **Note:**
>
> A forked [commonui-bs3](https://github.com/AtlasOfLivingAustralia/commonui-bs3) can be deployed to ```/data/spatial-hub/assets/``` and used with the config
> ```
> # edit /data/spatial-hub/config/spatial-hub-config.properties
> skin.layout=generic
> headerAndFooter.baseURL=<URL to this spatial-hub instance>/assets
> ```

# Adding hubs to spatial-hub

Additional map views can be created and served from urls hub/{{hub_name}}. This is done by creating additional files in the /data/spatial-hub directory.

Files required to create a new hub view. 

Files required | Overrides ```/data/spatial-hub/config/``` | Overrides ```grailsApp/conf/```
------------ | ------------- | -------------
```/data/spatial-hub/config/{{hub_name}}/app-config.json``` | ```spatial-hub-config.yml``` | ```application.yml```
```/data/spatial-hub/config/{{hub_name}}/view-config.json``` | ```view-config.json``` | ```view-config.json```
```/data/spatial-hub/config/{{hub_name}}/menu-config.json``` | ```menu-config.json``` | ```menu-config.json```

An additional css can be included with ```/data/spatial-hub/assets/css/{{hub_name}}.css``` when using ```skin.layout``` ```portal``` or ```generic```. This may not be used by a [local layout gsp file](#local-files). 

  
### Embedding spatial-hub

Example [embedExample.html](embedExample.html) (TODO: finish implementation)


## Tests

The build is setup to work with Firefox and Chrome.

Have a look at the `build.gradle` and the `src/test/resources/GebConfig.groovy` file.

From line 200 in build.gradle, you will find how we pass different test servers and authentication into tests.


### Usage

**Skip integration test in building process**


    ./gradlew build -x integrationTest



### Run with Firefox (default):

    ./gradlew :integrationTest -Dusername=xxxx -Dpassword=xxxxx

Or 

    ./gradlew :integrationTest

when authentication is stored into the default file:

    /data/spatial-hub/test/default.properties


**See more: [How to pass authentication](#Authentication)**

### run with Chrome:
This solution is not requried by M2 MBP

    ./gradlew :integrationTest -Ddriver=chrome

Chrome driver > 89 is not available for webdirver
Use npm to set the chrome driver version and reference the lib path from node_modules.

Add `"chromedriver": "89.0.0"` to package.json

Run `npm install`

    In ./gebConfig.groovy

    if (!System.getProperty("webdriver.chrome.driver")) {
        System.setProperty("webdriver.chrome.driver", "node_modules/chromedriver/bin/chromedriver")
    } 

### Test other servers:

    ./gradlew :integrationTest -DbaseUrl=http://spatial-test.ala.org.au/


### Authentication

Authentication info can be passed through with -Dusername and -Dpassword

    /gradlew :integrationTest -Dusername=xxxx -Dpassword=xxxxx

Or stored in a config file. The default config file is located in

    /data/spatial-hub/test/default.properties
    
    username="xxxx@csiro.au"
    password="xxxxx"

We can change the config file with -DconfigFile

    /gradlew :integrationTest -DconfigFile="myconfig.properties"


### Prerequisite
Layers required to be imported to Spatial Service:

    Koppen Climate Classification (Major Classes) 
    Precipitation - annual (Bio12)
    Temperature - annual mean (Bio01)
    GEOMACS - geometric mean
    ASGS Australian States and Territories
    IBRA 7 Subregions

Williams 2030 best 5  - for predict and classify

    el1002, el1019, el1037, el1036, el1013

Libs

    GDAL: gdal_translate

### Samples

    Koppen.kml and Koppen.zip are stored in ./test/resources


### Module Structure

Code structure of functional tests:

    ./test/resources/Functional_Test_Module.png


