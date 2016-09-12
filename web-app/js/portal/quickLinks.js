/*
 * Copyright (C) 2016 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 8/09/2016.
 */
L.Control.QuickLinks = L.Control.extend({
    options: {
        position: "bottomleft",
        title: 'Quick links'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create("div", "leaflet-control-quicklinks");
        this.container = container;
        $(container).append(this.options.template);
        L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
        L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
        return container;
    }
});