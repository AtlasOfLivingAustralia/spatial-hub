###  spatial-hub  [![Build Status](https://travis-ci.org/AtlasOfLivingAustralia/spatial-hub.svg?branch=master)](https://travis-ci.org/AtlasOfLivingAustralia/spatial-hub)

# spatial-hub
Replacement for spatial-portal with Grails, AngularJS and Leaflet.

# How to customise
## menu-config.json
The main menu is overridden with /data/spatial-hub/menu-config.json.

Also 
e.g. 
```$xslt
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
Templated dialog appearance can be overridden with view-config.json.

e.g. 
```$xslt
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


# Embedding spatial-hub

Example [embedExample.html](embedExample.html)
