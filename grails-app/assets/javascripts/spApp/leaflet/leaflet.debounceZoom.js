if (L.Map) {
    L.Map.prototype._resetViewPreserved = L.Map.prototype._resetView;
    L.Map.prototype._resetView = function (center, zoom, preserveMapOffset, afterZoomAnim, debounced) {
        // do not debounce on first request
        a = this
        console.log(a)
        if (this._resetViewTimeout === undefined || debounced) {
            console.log('_resetViewPreserved')
            this._resetViewPreserved(center, zoom, preserveMapOffset, afterZoomAnim)

            // make future requests debounce
            this._resetViewTimeout = 0
        } else {
            console.log("resetting view on a timeout and clearing: " + this._resetViewTimeout)
            clearTimeout(this._resetViewTimeout)

            // 500ms debounce
            this._resetViewTimeout = setTimeout(L.bind(this._resetView, this, center, zoom, preserveMapOffset, afterZoomAnim, true), 500)
            console.log("new timeout value: " + this._resetViewTimeout)
        }
    }
}