modules = {
    // used by ala-bootstrap3 plugin - removed legacy autocomplete library reference. It interferes with jquery ui autocomplete
    core {
        dependsOn 'jquery'
        resource url: [ dir:'js', file: 'html5.js', plugin:'ala-bootstrap3'], wrapper: { s -> "<!--[if lt IE 9]>$s<![endif]-->" }
    }

    bootstrap {
        dependsOn 'core', 'jquery'
        resource url:grailsApplication.config.headerAndFooter.baseURL + '/js/bootstrap.min.js', disposition: 'head'
        // ala-bootstrap3 references css file from ALA wordpress site. Therefore css finds it difficult to reference font icons.
        // this will make referencing fonts easy.
        resource url: [dir: 'node_modules/bootstrap/dist/css/', file: 'bootstrap.min.css'], attrs:[media:'screen, projection, print'], disposition: 'head'
    }

    // END ala-bootstrap3 plugin change

    'jquery' {
        resource url: [dir: 'node_modules/jquery/dist', file: 'jquery.min.js'], disposition: 'head'
    }

    'bootbox' {
        resource url: [dir: 'node_modules/ngbootbox', file: 'ngBootbox.js'], disposition: 'defer'
        resource url: [dir: 'node_modules/bootbox', file: 'bootbox.min.js'], disposition: 'defer'
    }

    leaflet {
        resource url: [dir: 'node_modules/leaflet/dist/', file: 'leaflet.js'], disposition: 'head'
        resource url: [dir: 'node_modules/leaflet/dist/', file: 'leaflet.css'], disposition: 'head'
        resource url: [dir: 'node_modules/leaflet-draw/dist/', file: 'leaflet.draw.js'], disposition: 'head'
        resource url: [dir: 'node_modules/leaflet-draw/dist/', file: 'leaflet.draw.css'], disposition: 'head'
    }

    dependencies {
        dependsOn('jquery', 'jquery-ui', 'leaflet', 'font-awesome')
        resource url: [dir: 'js/ala', file: 'html5.js'], disposition: 'head'
        resource url: [dir: 'js', file: 'Google.js'], disposition: 'head'
        resource url: [dir: 'js', file: 'leaflet.label.js'], disposition: 'head'
        resource url: [dir: 'js', file: 'jquery.csv.js'], disposition: 'head'
        resource url: [dir: 'js', file: 'leaflet-geodesy.js'], disposition: 'head'
        resource url: [dir: 'css', file: 'leaflet.label.css'], disposition: 'head'
        resource url: [dir: 'css', file: 'spatial-hub.css'], disposition: 'head'
    }

    angular {
        dependsOn('ala', 'dependencies')
        resource url: [dir: 'node_modules/angular', file: 'angular.min.js'], disposition: 'head'
        resource url: [dir: 'node_modules/angular', file: 'angular-csp.css']
    }

    'angular-ui-bootstrap' {
        dependsOn('angular')
        resource url: [dir: 'node_modules/angular-ui-bootstrap/dist', file: 'ui-bootstrap-csp.css']
        resource url: [dir: 'node_modules/angular-ui-bootstrap/dist', file: 'ui-bootstrap-tpls.js']
    }

    'angular-ui-dependencies'{
        dependsOn('angular', 'angular-ui-bootstrap')
        resource url: [dir: 'node_modules/angular-animate', file: 'angular-animate.js']
        resource url: [dir: 'node_modules/angular-touch', file: 'angular-touch.js']
    }

    'angular-libs' {
        dependsOn('angular', 'leaflet')
        resource url: [dir: 'node_modules/angular-leaflet-directive/dist', file: 'angular-leaflet-directive.min.js']
        resource url: [dir: 'js', file: 'slider.js']
        resource url: [dir: 'js', file: 'sortable.js']
    }

    portal {
        dependsOn('jquery', 'bootstrap', 'angular', 'angular-ui-bootstrap', 'angular-ui-dependencies', 'angular-libs',
                'leaflet', 'bootbox')
        resource url: [dir: 'js/portal', file: 'infoPanel.js']
        resource url: [dir: 'js/portal/controller', file: 'addAreaCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'addLayerCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'addSpeciesCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'addFacetCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'areaReportCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'backgroundProcessCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'basicTilesController.js']
        resource url: [dir: 'js/portal/controller', file: 'csvCtrl.js']
        resource url: [dir: 'js/portal/directive', file: 'drawArea.js']
        resource url: [dir: 'js/portal/directive', file: 'envelope.js']
        resource url: [dir: 'js/portal/controller', file: 'exportChecklistCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'exportSampleCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'exportMap.js']
        resource url: [dir: 'js/portal/controller', file: 'exportAreaCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'layoutCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'phyloCtrl.js']
        resource url: [dir: 'js/portal/directive', file: 'legend.js']
        resource url: [dir: 'js/portal/directive', file: 'map.js']
        resource url: [dir: 'js/portal/controller', file: 'modalIframeInstanceCtrl.js']
        resource url: [dir: 'js/portal/directive', file: 'nearestLocality.js']
        resource url: [dir: 'js/portal/directive', file: 'options.js']
        resource url: [dir: 'js/portal/controller', file: 'speciesInfoCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'tabulateCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'toolAreaReportCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'sandBoxCtrl.js']
        resource url: [dir: 'js/portal/controller', file: 'createSpeciesListCtrl.js']

        resource url: [dir: 'js/portal/directive', file: 'areaListSelect.js']
        resource url: [dir: 'js/portal/directive', file: 'gazAutoComplete.js']
        resource url: [dir: 'js/portal/directive', file: 'googlePlaces.js']
        resource url: [dir: 'js/portal/directive', file: 'layerAutocomplete.js']
        resource url: [dir: 'js/portal/directive', file: 'layerListSelect.js']
        resource url: [dir: 'js/portal/directive', file: 'layerListUpload.js']
        resource url: [dir: 'js/portal/directive', file: 'selectPhylo.js']
        resource url: [dir: 'js/portal/directive', file: 'listsList.js']
        resource url: [dir: 'js/portal/directive', file: 'menu.js']
        resource url: [dir: 'js/portal/directive', file: 'map.js']
        resource url: [dir: 'js/portal/directive', file: 'sandboxList.js']
        resource url: [dir: 'js/portal/directive', file: 'selectArea.js']
        resource url: [dir: 'js/portal/directive', file: 'selectLayers.js']
        resource url: [dir: 'js/portal/directive', file: 'selectSpecies.js']
        resource url: [dir: 'js/portal/directive', file: 'speciesAutoComplete.js']

        resource url: [dir: 'js/portal/service', file: 'biocacheService.js']
        resource url: [dir: 'js/portal/service', file: 'facetAutocompleteService.js']
        resource url: [dir: 'js/portal/service', file: 'gazAutocompleteService.js']
        resource url: [dir: 'js/portal/service', file: 'layerDistancesService.js']
        resource url: [dir: 'js/portal/service', file: 'layersAutocompleteService.js']
        resource url: [dir: 'js/portal/service', file: 'listsService.js']
        resource url: [dir: 'js/portal/service', file: 'phyloService.js']
        resource url: [dir: 'js/portal/service', file: 'layersService.js']
        resource url: [dir: 'js/portal/service', file: 'layoutService.js']
        resource url: [dir: 'js/portal/service', file: 'mapService.js']
        resource url: [dir: 'js/portal/service', file: 'predefinedAreasService.js']
        resource url: [dir: 'js/portal/service', file: 'predefinedLayerListsService.js']
        resource url: [dir: 'js/portal/service', file: 'sandboxService.js']
        resource url: [dir: 'js/portal/service', file: 'speciesAutoCompleteService.js']
        resource url: [dir: 'js/portal/service', file: 'popupService.js']

        resource url: [dir: 'js/portal', file: 'util.js']
        resource url: [dir: 'js/portal', file: 'wellknown.js']
    }
}