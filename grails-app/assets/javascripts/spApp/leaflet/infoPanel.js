L.Control.InfoPanel = L.Control.extend({
    options: {
        position: 'bottomright'
    },
    timer: -1,
    lastTime: 0,
    pos: '',
    lastPos: '',
    intersect: '',

    hoverSet: function () {
        if (this.timer !== -1) {
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(this.hover, 2000, this)
    },
    hover: function (scope) {
        if (scope.pos !== scope.lastPos) {
            scope.lastPos = scope.pos;

            if ($SH.hoverLayers.length > 0) {
                var layer = $SH.hoverLayers.join(",");
                var split = scope.lastPos.split(' ');
                var url = $SH.layersServiceUrl + "/intersect/" + layer + "/" + split[1] + "/" + split[0];
                scope._container.innerHTML = 'searching...' + '<br/>' + scope.lastPos;
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
                                d += '<br/>' + data[k].layername + ': ' + data[k].value;
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
        var lng = L.Util.formatNum(e.latlng.lng, 5);
        var lat = L.Util.formatNum(e.latlng.lat, 5);
        this.pos = lng + ' ' + lat;
        this.intersect = '';
        if ($SH.hoverLayers.length > 0) {
            this._container.innerHTML = "hover to view layers<br/>" + this.pos
        } else {
            this._container.innerHTML = this.pos
        }

        this.hoverSet()
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