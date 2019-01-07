L.Control.Poi = L.Control.extend({
    options: {
        position: 'topleft',
        title: 'Show Point of Interest Images',
        titleCancel: 'Hide Point of Interest Images',
        togglePoi: null
    },

    _poi_state: false,

    onAdd: function (map) {
        var container;

        if (map.zoomControl) {
            container = map.zoomControl._container;
        } else {
            container = L.DomUtil.create('div', 'leaflet-bar');
        }

        map.poiControl = this;

        this.link = L.DomUtil.create('a', 'icon-poi icon-exit-poi', container);
        this.link.href = '#';
        this.link.title = this.options.title;
        L.DomEvent.addListener(this.link, 'click', L.DomEvent.stopPropagation)
            .addListener(this.link, 'click', L.DomEvent.preventDefault)
            .addListener(this.link, 'click', this._toggle, map); //map->this?

        return container;
    },

    _toggle: function () {
        this.poiControl._poi_state = !this.poiControl._poi_state;
        this.poiControl.options.togglePoi(this);

        if (this.poiControl._poi_state) {
            this.poiControl.link.title = this.poiControl.options.titleCancel;
            $(".icon-poi").removeClass("icon-exit-poi")
        } else {
            this.poiControl.link.title = this.poiControl.options.title;
            $(".icon-poi").addClass("icon-exit-poi")
        }
    }

});