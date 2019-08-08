/*!
    Simple JavaScript Templating
    John Resig - https://johnresig.com/ - MIT Licensed
*/
(function () {
    var cache = {};

    window.tmpl = function tmpl(str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
                tmpl(document.getElementById(str).innerHTML) :

            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

                // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +

                // Convert the template into pure JavaScript
                str
                    .replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'")
                + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn(data) : fn;
    };
})();

/* @preserve
 * Copyright (C) 2019 Atlas of Living Australia
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
 * Created by Temi on 2019-05-07.
 */
window.BC_CONF = window.BC_CONF || {};
jQuery(function () {
    var autoCompleteSelector = BC_CONF.autoCompleteSelector || "#autocompleteHeader",
        appendToSelector = BC_CONF.appendToSelector || "#autocompleteSearchALA",
        bieURL = BC_CONF.autocompleteURL || "https://bie-ws.ala.org.au/ws/search/auto.json",
        templateId = BC_CONF.templateId || "autoCompleteTemplate",
        autocomplete = $.ui && $.ui.autocomplete;

    if (typeof autocomplete === "function") {
        var instance = autocomplete({
            appendTo: appendToSelector,
            minLength: 0,
            source: function (request, response) {
                $.ajax({
                    url: bieURL,
                    dataType: "json",
                    data: {
                        q: request.term
                    },
                    success: function (data) {
                        response(data.autoCompleteList);
                    }
                });
            },
            focus: function (event, ui) {
                var getName = $(this).data('ui-autocomplete').options.getMatchingName;
                $(autoCompleteSelector).val(getName(ui.item));
                return false;
            },
            select: function (event, ui) {
                var getName = $(this).data('ui-autocomplete').options.getMatchingName;
                $(autoCompleteSelector).val(getName(ui.item));
                return false;
            },
            getMatchingName: function (item) {
                if (item.commonNameMatches && item.commonNameMatches.length) {
                    return item.commonName;
                } else {
                    return item.name;
                }
            }
        }, $(autoCompleteSelector));
        instance._renderItem = function (ul, item) {
            return $(tmpl(templateId)(item))
                .appendTo(ul);
        };
        instance._resizeMenu = function () {
            var ul = this.menu.element;
            ul.outerWidth(this.element.outerWidth());
        };
    }
});

function focusOnClickSearchButton() {
    // setTimeout to overturn focus on trigger button called by BS collapse plugin
    setTimeout(function () {
        document.getElementById('autocompleteHeader').focus();
    }, 0);
}