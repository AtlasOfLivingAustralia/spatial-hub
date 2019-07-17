###  spatial-hub  [![Build Status](https://travis-ci.org/AtlasOfLivingAustralia/spatial-hub.svg?branch=master)](https://travis-ci.org/AtlasOfLivingAustralia/spatial-hub)

# spatial-hub
Replacement for spatial-portal with Grails, AngularJS and Leaflet.

# How to customise
## menu-config.json
* The main menu is overridden with `/data/spatial-hub/menu-config.json`.

```json
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

## view-config.json
* Templated dialog appearance can be overridden with `/data/spatial-hub/view-config.json`.

```json
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

  
# Embedding spatial-hub

Example [embedExample.html](embedExample.html) (TODO: finish implementation)
