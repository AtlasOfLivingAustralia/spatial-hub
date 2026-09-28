// Loads the browser globals that the asset pipeline provides to spApp (jQuery, angular, angular-mocks) and lets
// specs load spApp files as plain scripts, the way the page does.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {afterEach, beforeEach} from 'vitest';

const root = resolve(import.meta.dirname, '../../..');

// Runs a script in the global scope, like a <script> tag, so its top level vars become globals.
globalThis.loadScript = function (path) {
    (0, eval)(readFileSync(resolve(root, path), 'utf8') + '\n//# sourceURL=' + path);
};

globalThis.loadSpApp = function (path) {
    loadScript('grails-app/assets/javascripts/spApp/' + path);
};

loadScript('grails-app/assets/javascripts/jquery-2.2.0.min.js');
loadScript('node_modules/angular/angular.js');

// angular-mocks only defines angular.mock.module/inject when it sees jasmine or mocha, and registers its hooks with
// the global beforeEach/afterEach, calling them with the current spec as `this`.
let currentSpec;
globalThis.mocha = true;
globalThis.beforeEach = function (fn) {
    beforeEach(function () {
        currentSpec = {};
        fn.call(currentSpec);
    });
};
globalThis.afterEach = function (fn) {
    afterEach(function () {
        fn.call(currentSpec);
    });
};
loadScript('node_modules/angular-mocks/angular-mocks.js');
delete globalThis.beforeEach;
delete globalThis.afterEach;

// Globals set by the hub page (spApp.gsp) and read by spApp files.
beforeEach(function () {
    globalThis.$SH = {
        baseUrl: 'https://hub.test',
        biocacheServiceUrl: 'https://biocache.test/ws',
        biocacheUrl: 'https://biocache.test',
        i18n: 'en',
        hub: 'default',
        rangeDataTypes: ['int', 'tfloat', 'tdate']
    };
    globalThis.$i18n = function (key, text) {
        return text;
    };
});
