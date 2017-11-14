L.Control.Expand = L.Control.extend({
    options: {
        position: 'topleft',
        titleLeft: 'Expand Map Left',
        titleUp: 'Expand Map Up',
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

        var up = L.DomUtil.create('a', 'icon-expand-up', container);
        up.href = '#';
        up.title = this.options.titleUp;
        L.DomEvent.addListener(up, 'click', L.DomEvent.stopPropagation)
            .addListener(up, 'click', L.DomEvent.preventDefault)
            .addListener(up, 'click', this._toggleUp, map);

        var left = L.DomUtil.create('a', 'icon-expand-left', container);
        left.href = '#';
        left.title = this.options.titleLeft;
        L.DomEvent.addListener(left, 'click', L.DomEvent.stopPropagation)
            .addListener(left, 'click', L.DomEvent.preventDefault)
            .addListener(left, 'click', this._toggleLeft, map);

        return container;
    },

    _toggleUp: function() {
        if (this.expandControl._up_state) {
            $(".icon-expand-up").removeClass("icon-expand-down")
        } else {
            $(".icon-expand-up").addClass("icon-expand-down")
        }
        this.expandControl.options.toggleExpandUp(this);
        this.expandControl._up_state = !this.expandControl._up_state
    },

    _toggleLeft: function() {
        if (this.expandControl._left_state) {
            $(".icon-expand-left").removeClass("icon-expand-right")
        } else {
            $(".icon-expand-left").addClass("icon-expand-right")
        }
        this.expandControl.options.toggleExpandLeft(this);
        this.expandControl._left_state = !this.expandControl._left_state
    }
});