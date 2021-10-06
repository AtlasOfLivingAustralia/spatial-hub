(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name MenuService
     * @description
     *   Menu configuration
     */
    angular.module('menu-service', [])
        .factory('MenuService', ['$injector', '$q', '$http', '$timeout',
            function ($injector, $q, $http, $timeout) {
                var menuConfig = {};

                var _httpDescription = function (method, httpconfig) {
                    if (httpconfig === undefined) {
                        httpconfig = {};
                    }
                    httpconfig.service = 'MenuService';
                    httpconfig.method = method;

                    return httpconfig;
                };

                //TODO: support dynamic menu update

                if ($SH.menu.indexOf('http') == 0) {
                    var setup = $http.get($SH.menu, _httpDescription('getMenu')).then(function (data) {
                        console.log(data.data);
                        if(window.getCookie('lang') == 'en') {
                            var it_0 = 0;
                            var it_1 = 0;
                            for(it_0 = 0; it_0 < data.data.length; it_0++) {
                                if(data.data[it_0].name == 'Hinzufügen') {
                                    data.data[it_0].name = 'Add';
                                }
                                if(data.data[it_0].name == 'Analysetools') {
                                    data.data[it_0].name = 'Tools';
                                }
                                if(data.data[it_0].name == 'Importieren') {
                                    data.data[it_0].name = 'Import';
                                }
                                if(data.data[it_0].name == 'Exportieren') {
                                    data.data[it_0].name = 'Export';
                                }
                                if(data.data[it_0].name == 'Hilfe') {
                                    data.data[it_0].name = 'Help';
                                }
                                for(it_1 = 0; it_1 < data.data[it_0].items.length; it_1++) {
                                    if(data.data[it_0].items[it_1].name == 'Arten') {
                                        data.data[it_0].items[it_1].name = 'Species';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Gebiete') {
                                        data.data[it_0].items[it_1].name = 'Area';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Layer') {
                                        data.data[it_0].items[it_1].name = 'Layer';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Lebensraumtypen') {
                                        data.data[it_0].items[it_1].name = 'Habitats';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Eigenschaften') {
                                        data.data[it_0].items[it_1].name = 'Properties';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Ökosystemleistungen') {
                                        data.data[it_0].items[it_1].name = 'Eco-system services';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Gebietsbericht - interaktiv') {
                                        data.data[it_0].items[it_1].name = 'Area report - interactive';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Gebietsbericht - PDF') {
                                        data.data[it_0].items[it_1].name = 'Area report - PDF';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Scatterplot') {
                                        data.data[it_0].items[it_1].name = 'Scatterplot';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Scatterplot - matrix') {
                                        data.data[it_0].items[it_1].name = 'Scatterplot - matrix';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Artenhäufigkeit') {
                                        data.data[it_0].items[it_1].name = 'Taxon Frequency';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Vektorlayer vergleichen') {
                                        data.data[it_0].items[it_1].name = 'Tabulate';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Arten von Layern') {
                                        data.data[it_0].items[it_1].name = 'Species by Layer';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Punkte vergleichen') {
                                        data.data[it_0].items[it_1].name = 'Compare Points';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Gebiete vergleichen') {
                                        data.data[it_0].items[it_1].name = 'Compare areas';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Punkteraster generieren') {
                                        data.data[it_0].items[it_1].name = 'Generate Points';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Punkte zu Raster') {
                                        data.data[it_0].items[it_1].name = 'Points to grid';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Verbreitung (EOO) & Vorkommen (AOO)') {
                                        data.data[it_0].items[it_1].name = 'Calculate AOO and EOO';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Potenzielle Verbreitung (MaxEnt)') {
                                        data.data[it_0].items[it_1].name = 'Predict';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Klassifikation') {
                                        data.data[it_0].items[it_1].name = 'Classify';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Phylogenetische Diversität') {
                                        data.data[it_0].items[it_1].name = 'Phylogenetic diversity';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Nächstgelegene Gebiete') {
                                        data.data[it_0].items[it_1].name = 'Nearest locality';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Vorherige Analyse wiederherstellen') {
                                        data.data[it_0].items[it_1].name = 'Restore Prior Analysis';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Fundpunkte') {
                                        data.data[it_0].items[it_1].name = 'Points';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Artenliste') {
                                        data.data[it_0].items[it_1].name = 'Species list';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Gebiet') {
                                        data.data[it_0].items[it_1].name = 'Add area';
                                    }
                                    // Analysis multiplied avoid
                                    if(data.data[it_0].items[it_1].name == 'Gebiet') {
                                        data.data[it_0].items[it_1].name = 'Add area';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Karte') {
                                        data.data[it_0].items[it_1].name = '';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Artencheckliste') {
                                        data.data[it_0].items[it_1].name = 'Area checklist';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Punkte zu BCCVL') {
                                        data.data[it_0].items[it_1].name = 'Points to BCCVL';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Erste Schritte') {
                                        data.data[it_0].items[it_1].name = 'Getting Started';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Hinzufügen') {
                                        data.data[it_0].items[it_1].name = 'Add to map';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Analysetools') {
                                        data.data[it_0].items[it_1].name = 'Tools';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Importieren') {
                                        data.data[it_0].items[it_1].name = 'Import';
                                    }
                                    if(data.data[it_0].items[it_1].name == 'Exportieren') {
                                        data.data[it_0].items[it_1].name = 'Export';
                                    }
                                }
                            }
                        }
                        menuConfig = data.data;
                        return menuConfig;
                    });
                } else {
                    menuConfig = $SH.menu;
                    setup = $q.when(menuConfig)
                }

                return {
                    /**
                     * Get menu config
                     * @memberof MenuService
                     * @returns {Promise(Map)} menu configuration
                     */
                    getMenuConfig: function () {
                        if (menuConfig.size > 0) {
                            return $q.when(menuConfig)
                        } else {
                            return setup
                        }
                    },

                    find: function (name) {
                        for (var i in menuConfig) {
                            var menu = menuConfig[i]
                            for (var j in menu.items) {
                                var item = menu.items[j]
                                if (item.open == name) {
                                    return {name: item.name, parent: menu.name}
                                }
                            }
                        }
                    }
                }
            }])
}(angular));