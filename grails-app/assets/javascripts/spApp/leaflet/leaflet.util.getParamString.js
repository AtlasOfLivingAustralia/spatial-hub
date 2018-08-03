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
 * Created by Temi on 13/09/2016.
 *
 * This function is because of a bug in leaflet. all params to wms are capitalised. However, biocache does not like fq to be capitalised.
 */
if (L.Util.getParamString) {
    L.Util.getParamString = function (obj, existingUrl, uppercase) {
        var params = [];
        for (var i in obj) {
            if (typeof obj[i] === 'array') {
                for (var j = 0; j < obj[i].length; j++) {
                    if (i !== 'fq') {
                        params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i][j]));
                    } else {
                        params.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i][j]));
                    }
                }
            } else {
                if (i !== 'fq') {
                    params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
                } else {
                    params.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
                }
            }
        }
        return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
    }
}