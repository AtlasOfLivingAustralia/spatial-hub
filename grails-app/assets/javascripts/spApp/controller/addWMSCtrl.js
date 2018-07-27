(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name AddWMSCtrl
     * @description
     *   Add an WMS to the map
     */
    angular.module('add-w-m-s-ctrl', ['map-service', 'layers-service', 'predefined-areas-service'])
        .controller('AddWMSCtrl', ['LayoutService', '$scope', '$http','MapService', '$timeout', 'LayersService',
            '$uibModalInstance', 'PredefinedAreasService', 'data',
            function (LayoutService, $scope,$http, MapService, $timeout, LayersService, $uibModalInstance, inputData) {

                $scope.loading = false;
                $scope.warning ='';

                $scope.selectedLayerLabel = '';
                $scope.isAutomatic = true;
                $scope.version="";
                $scope.availableLayers = [];
                $scope.selectedServer = "";


                // $scope.presetServers = [
                //     {name:"AusCover", url:"http://data.auscover.org.au/geoserver/wms?request=getCapabilities"},
                //     {name:"Geoserver IMOS",url:"http://geoserver.imos.org.au/geoserver/wms?REQUEST=GetCapabilities"},
                //     {name:"GA",url:"http://www.ga.gov.au/gis/services/earth_science/GA_Surface_Geology_of_Australia/MapServer/WMSServer?request=GetCapabilities"},
                //     {name:"Geofabric BOM",url:"http://geofabric.bom.gov.au/simplefeatures/ows?request=getcapabilities"}
                // ]

                $scope.presetServers = $SH.presetWMSServers

                $scope.getMapExamples = $SH.getMapExamples

                $scope.ok = function () {


                };

                $scope.getCapabilities = function(){
                    var url = $scope.selectedServer + ($scope.version?"&version=" + $scope.version : "");
                    console.log("Get capabilites:" + url);
                    $scope.warning='';
                    $scope.loading = true;


                    $http.get($SH.baseUrl + "/portal/proxy?url=" +url)
                        .success(function (resp) {
                            $scope.availableLayers =[]
                            var x2js = new X2JS({attributePrefix: []});
                            var xml = x2js.xml_str2json(resp);
                            var version = xml.WMS_Capabilities._version;
                            var layers = xml.WMS_Capabilities.Capability.Layer.Layer;

                            for (i in layers){
                                try {
                                    var styles = layers[i].Style
                                    var legendurl = ''
                                    if (Array.isArray(styles))
                                        legendurl = styles[0].LegendURL.OnlineResource['xlink:href']
                                    else
                                        legendurl = styles.LegendURL.OnlineResource['xlink:href']

                                    $scope.availableLayers.push({
                                        name: layers[i].Name,
                                        title: layers[i].Title,
                                        version: version,
                                        legendurl: legendurl
                                    })
                                }catch(e){
                                    e.printStackTrace()
                                }
                            }

                        })
                        .error(function(resp){
                            if (resp.error){
                                $scope.warning =  resp.error;
                                $scope.warning += '['+url+' may not in proxy list!]'
                            }else
                                $scope.warning = resp.error;

                        })
                        .finally(function () {
                            $scope.loading = false;
                        });

                };


                $scope.addLayer = function(){
                    var serverUrl = $scope.selectedServer.substr(0,$scope.selectedServer.lastIndexOf('/')+1)+'wms';
                    var layer = Object.assign({url:serverUrl, layertype:"wms"}, $scope.selectedLayer)
                    $scope.selectedLayerLabel ? layer.name = $scope.selectedLayerLabel: null;

                    MapService.add(layer).then(function(data){
                        alert('You layer has been added!');

                    }).catch(function(err){
                        $scope.warning = err;
                    })
                };

                $scope.addLayerFromGetMapRequest = function(){
                    //parsing
                    console.log("Adding layer from GetMap:" + $scope.selectedGetMapExample)
                    if (!validateURL($scope.selectedGetMapExample)){
                        $scope.warning = "Invalid URL: " + url;
                        return;
                    }

                    var result = {};
                    var sepIndex = $scope.selectedGetMapExample.indexOf('?');
                    var url = $scope.selectedGetMapExample.substr(0,sepIndex);

                    result['URL'] = url;

                    var queryString = $scope.selectedGetMapExample.substr(sepIndex+1, $scope.selectedGetMapExample.length - sepIndex);
                    queryString.split("&").forEach(function(part) {
                        if(!part) return;
                        part = part.split("+").join(" "); // replace every + with space, regexp-free version
                        var eq = part.indexOf("=");
                        var key = eq>-1 ? part.substr(0,eq) : part;
                        var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
                        var from = key.indexOf("[");
                        if(from==-1) result[decodeURIComponent(key)] = val;
                        else {
                            var to = key.indexOf("]",from);
                            var index = decodeURIComponent(key.substring(from+1,to));
                            key = decodeURIComponent(key.substring(0,from));
                            if(!result[key]) result[key] = [];
                            if(!index) result[key].push(val);
                            else result[key][index] = val;
                        }
                    });
                    console.log(result)
                    if (!result.LAYERS || /^\s*$/.test(result.LAYERS)){
                        $scope.warning = "Layer is not given";
                        return;
                    }
                    if (result.REQUEST.toUpperCase()!= "GETMAP" ){
                        $scope.warning = "Request should be GetMap";
                        return;
                    }

                    var layer ={url:result.URL, type:'wms',layertype:result.SERVICE, version: result.VERSION, name: result.LAYERS}

                    MapService.add(layer).then(function(data){
                        console.log(data)
                        $scope.$close();
                    }).catch(function(err){
                        $scope.warning = err;
                    })
                }

                var validateURL = function(str) {
                    var pattern = new RegExp('((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[-;:&=\\+\\$,\\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\\+\\$,\\w]+@)[A-Za-z0-9.-]+)((?:\\/[\\+~%\\/.\\w-_]*)?\\??(?:[-\\+=&;%@.\\w_]*)#?(?:[\\w]*))?)'); // fragment locater
                    if(!pattern.test(str)) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }])
}(angular));