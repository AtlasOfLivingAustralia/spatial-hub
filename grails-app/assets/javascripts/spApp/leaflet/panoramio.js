L.Control.Panoramio = L.Control.extend({
    options: {
        position: 'topleft',
        title: 'Show Location Images',
        titleCancel: 'Hide Location Images',
        togglePanoramio: null
    },

    _panoramio_state: false,

    onAdd: function (map) {
        var container;

        if (map.zoomControl) {
            container = map.zoomControl._container;
        } else {
            container = L.DomUtil.create('div', 'leaflet-bar');
        }

        map.panoramioControl = this;

        this.link = L.DomUtil.create('a', 'icon-panoramio', container);
        this.link.href = '#';
        this.link.title = this.options.title;
        L.DomEvent.addListener(this.link, 'click', L.DomEvent.stopPropagation)
            .addListener(this.link, 'click', L.DomEvent.preventDefault)
            .addListener(this.link, 'click', this._toggle, map); //map->this?

        return container;
    },

    _toggle: function() {
        this.panoramioControl._panoramio_state = !this.panoramioControl._panoramio_state;
        this.panoramioControl.options.togglePanoramio(this);

        if (this.panoramioControl._panoramio_state){
            this.panoramioControl.link.title = this.panoramioControl.options.titleCancel;
            $(".icon-panoramio").addClass("icon-exit-panoramio")
        } else {
            this.panoramioControl.link.title = this.panoramioControl.options.title;
            $(".icon-panoramio").removeClass("icon-exit-panoramio")
        }
    }

});