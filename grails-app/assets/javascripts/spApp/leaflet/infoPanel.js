L.Control.InfoPanel = L.Control.extend({
    options: {
        position: 'bottomright'
    },
    timer: -1,
    lastTime: 0,
    pos: '',
    lat: 0,
    lng: 0,
    lastPos: '',
    lastLat: 0,
    lastLng: 0,
    intersect: '',

    // method no longer used
    hoverSet: function () {
        if (this.timer !== -1) {
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(this.hover, 2000, this)
    },

    // method no longer used
    hover: function (scope) {
        if (scope.pos !== scope.lastPos) {
            scope.lastPos = scope.pos;
            scope.lastLat = scope.lat;
            scope.lastLng = scope.lng;

            if ($SH.hoverLayers.length > 0) {
                var layer = $SH.hoverLayers.join(",");
                // latitude/longitude
                if (layer.length > 0) {
                    var url = $SH.layersServiceUrl + "/intersect/" + layer + "/" + scope.lastLat + "/" + scope.lastLng;
                    scope._container.innerHTML = $i18n(401, "searching...") + '<br/>' + scope.lastPos;
                    $.ajax({
                        container: scope._container,
                        hoverSet: scope.hoverSet,
                        pos: scope.lastPos,
                        url: url,
                        dataType: "json",
                        success: function (data) {
                            var d = '';
                            for (var k in data) {
                                if (data.hasOwnProperty(k)) {
                                    if (d.length > 0) d += '<br/>';
                                    d += data[k].layername + ': ' + data[k].value;
                                    if (data[k].units !== undefined) {
                                        d += ' ' + data[k].units
                                    }
                                }
                            }
                            this.container.innerHTML = d + '<br/>' + this.pos;

                            this.hoverSet()
                        },
                        async: true
                    });
                }
            }
        }
    },

    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
        L.DomEvent.disableClickPropagation(this._container);
        map.on('mousemove', this._onMouseMove, this);
        this._container.innerHTML = '';
        return this._container;
    },

    onRemove: function (map) {
        map.off('mousemove', this._onMouseMove);

        if (this.timer !== -1) {
            clearTimeout(this.timer)
        }
    },

    _onMouseMove: function (e) {
        var lng = L.Util.formatNum(e.latlng.lng, 3);
        var lat = L.Util.formatNum(e.latlng.lat, 3);
        this.pos = '<span class="coord">' + lng + '</span>&nbsp;<span class="coord">' + lat + '</span>';
        this.lat = lat;
        this.lng = lng;
        this.intersect = '';
        this._container.innerHTML = this.pos;
    }

});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.mousePosition = function (options) {
    return new L.Control.MousePosition(options);
};