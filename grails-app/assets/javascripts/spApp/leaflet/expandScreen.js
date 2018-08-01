L.Control.Expand = L.Control.extend({
    options: {
        position: 'topleft',
        titleLeft: 'Expand Map Left',
        titleRight: 'Expand Map Right',
        titleUp: 'Expand Map Up',
        titleDown: 'Expand Map Down',
        toggleExpandLeft: null,
        toggleExpandUp: null
    },

    _up_state: false,
    _left_state: false,

    onAdd: function (map) {
        var container;

        if (map.zoomControl) {
            container = map.zoomControl._container;
        } else {
            container = L.DomUtil.create('div', 'leaflet-bar');
        }

        map.expandControl = this;

        this.up = L.DomUtil.create('a', 'icon-expand-up', container);
        this.up.href = '#';
        this.up.title = this.options.titleUp;
        L.DomEvent.addListener(this.up, 'click', L.DomEvent.stopPropagation)
            .addListener(this.up, 'click', L.DomEvent.preventDefault)
            .addListener(this.up, 'click', this._toggleUp, map);

        this.left = L.DomUtil.create('a', 'icon-expand-left', container);
        this.left.href = '#';
        this.left.title = this.options.titleLeft;
        L.DomEvent.addListener(this.left, 'click', L.DomEvent.stopPropagation)
            .addListener(this.left, 'click', L.DomEvent.preventDefault)
            .addListener(this.left, 'click', this._toggleLeft, map);

        return container;
    },

    _toggleUp: function () {
        if (this.expandControl._up_state) {
            this.expandControl.up.title = this.expandControl.options.titleUp;
            $(".icon-expand-up").removeClass("icon-expand-down")
        } else {
            this.expandControl.up.title = this.expandControl.options.titleDown;
            $(".icon-expand-up").addClass("icon-expand-down")
        }
        this.expandControl.options.toggleExpandUp(this);
        this.expandControl._up_state = !this.expandControl._up_state
    },

    _toggleLeft: function () {
        if (this.expandControl._left_state) {
            this.expandControl.left.title = this.expandControl.options.titleLeft;
            $(".icon-expand-left").removeClass("icon-expand-right")
        } else {
            this.expandControl.left.title = this.expandControl.options.titleRight;
            $(".icon-expand-left").addClass("icon-expand-right")
        }
        this.expandControl.options.toggleExpandLeft(this);
        this.expandControl._left_state = !this.expandControl._left_state
    }
});