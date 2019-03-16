L.Control.Images = L.Control.extend({
    options: {
        position: 'topleft',
        title: 'Show Location Images',
        titleCancel: 'Hide Location Images',
        toggleImages: null
    },

    _images_state: false,

    onAdd: function (map) {
        var container;

        if (map.zoomControl) {
            container = map.zoomControl._container;
        } else {
            container = L.DomUtil.create('div', 'leaflet-bar');
        }

        map.imagesControl = this;

        this.link = L.DomUtil.create('a', 'icon-images icon-exit-images', container);
        this.link.href = '#';
        this.link.title = this.options.title;
        L.DomEvent.addListener(this.link, 'click', L.DomEvent.stopPropagation)
            .addListener(this.link, 'click', L.DomEvent.preventDefault)
            .addListener(this.link, 'click', this._toggle, map); //map->this?

        return container;
    },

    _toggle: function () {
        this.imagesControl._images_state = !this.imagesControl._images_state;
        this.imagesControl.options.toggleImages(this);

        if (this.imagesControl._images_state) {
            this.imagesControl.link.title = this.imagesControl.options.titleCancel;
            $(".icon-images").removeClass("icon-exit-images")
        } else {
            this.imagesControl.link.title = this.imagesControl.options.title;
            $(".icon-images").addClass("icon-exit-images")
        }
    }

});