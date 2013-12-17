/**
 * @license
 * resol-vbus - A JavaScript library for processing RESOL VBus data
 */
'use strict';



var crypto = require('crypto');
var EventEmitter = require('events').EventEmitter;


var _ = require('lodash');


var extend = require('./extend');



var idHashes = {};



var optionKeys = [
    'timestamp',
];



var HeaderSet = extend(EventEmitter, {

    timestamp: null,

    headerMap: null,

    constructor: function(options) {
        EventEmitter.call(this);

        this.headerMap = {};

        _.extend(this, _.pick(options, optionKeys));

        if (!this.timestamp) {
            this.timestamp = new Date();
        }

        if (_.has(options, 'headers')) {
            this.addHeaders(options.headers);
        }
    },

    addHeader: function(header) {
        var id = header.getId();
        this.headerMap [id] = header;

        if (this.timestamp.getTime() < header.timestamp.getTime()) {
            this.timestamp = header.timestamp;
        }

        this.emit('addHeader', header);
    },

    addHeaders: function(headers) {
        var _this = this;

        _.forEach(headers, function(header) {
            _this.addHeader(header);
        });
    },

    removeHeadersOlderThan: function(timestamp) {
        var _this = this;

        var time = timestamp.getTime();

        var keys = [];
        _.forEach(this.headerMap, function(header, key) {
            if (header.timestamp.getTime() < time) {
                keys.push(key);
            }
        });

        _.forEach(keys, function(key) {
            this.emit('removeHeader', _this.headerMap [key]);

            delete _this.headerMap [key];
        });
    },

    getSortedHeaders: function() {
        var _this = this;

        var sortedKeys = _.keys(this.headerMap).sort();

        var sortedHeaders = _.map(sortedKeys, function(key) {
            return _this.headerMap [key];
        });

        return sortedHeaders;
    },

    getId: function() {
        var sortedKeys = _.keys(this.headerMap).sort();

        var id = sortedKeys.join(',');

        return id;
    },

    getIdHash: function() {
        var id = this.getId();

        if (!_.has(idHashes, id)) {
            var shasum = crypto.createHash('sha256');

            shasum.update(id);

            idHashes [id] = shasum.digest('hex');
        }

        return idHashes [id];
    },

});



module.exports = HeaderSet;