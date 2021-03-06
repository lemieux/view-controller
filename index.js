( function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'marionette'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('underscore'), require('backbone.marionette'));
    }
} )(this, function(_, Marionette) {

    'use strict';

    return Marionette.Object.extend({
        /**
         * Constructor to use to instantiate the view
         * Cannot be a function.
         * Can be overriden by options at instantiation.
         * @type {Function}
         */
        viewClass: Marionette.ItemView,

        /**
         * Options passed the the view on instantiation
         * Can be a function.
         * Can be overriden by options at instantiation.
         * @type {Object}
         */
        viewOptions: {},

        /**
         * Events bindings similar as what a view does with DOM Events
         * Can be a function.
         * Can be overriden by options at instantiation.
         * @type {Object}
         *
         * @example
         *
         * viewEvents: {
         *   'model:save': 'saveModel',
         *   'model:delete': 'deleteModel'
         * },
         *
         * saveModel: function(model){
         *   model.save();
         * },
         *
         * deleteModel: function(model){
         *   model.delete();
         * }
         */
        viewEvents: {},

        /**
         * Events triggered by the view that will bubble up higher instead of being
         * handled by the current controller.
         * Can be a function.
         * Can be overriden by options at instantiation.
         * @type {Object}
         *
         * @example
         *
         * // Most of the time, you might keep the same trigger name, but you can
         * // change it if necessary
         * viewTriggers: {
         *   'model:save': 'model:save',
         *   'model:delete': 'model:delete'
         * }
         */

        viewTriggers: {},


        /**
         * Events bindings on the model
         * Can be a function.
         * Can be overriden by options at instantiation.
         * @type {Object}
         *
         * @example
         *
         * modelEvents: {
         *   'save': 'onModelSave',
         *   'sync': 'onModelSync'
         * },
         *
         * onModelSave: function(){
         *   this.view.collapse();
         * },
         *
         * onModelSync: function(){
         *   this.view.showLoading();
         * }
         */
        modelEvents: {},

        /**
         * Events bindings on the collection
         * Can be a function.
         * Can be overriden by options at instantiation.
         * @type {Object}
         *
         * @example
         *
         * collectionEvents: {
         *   'add': 'onCollectionAdd',
         *   'remove': 'onCollectionRemove'
         * },
         *
         * onCollectionAdd: function(model) {
         *   this.view.hideBanner();
         * },
         *
         * onCollectionSync: function(model) {
         *   if(this.collection.length === 0) {
         *     this.view.showBanner();
         *   }
         * }
         */
        collectionEvents: {},

        /**
         * Determines if the controller is destroyed when the view is.
         * Cannot be a function.
         * Can be overriden by options at instantiation.
         * @type {Boolean}
         */
        isDestroyedWithView: true,

        constructor: function(options) {
            options || (options = {});
            if (options.model) {
                this.model = options.model;

                this.modelEvents = this.getModelEvents();
                Marionette.bindEntityEvents(this, this.model, this.modelEvents);
            }

            if (options.collection) {
                this.collection = options.collection;

                this.collectionEvents = this.getCollectionEvents();
                Marionette.bindEntityEvents(this, this.collection, this.collectionEvents);
            }

            Marionette.Object.call(this, options);
        },

        getViewClass: function() {
            return this.getOption('viewClass');
        },

        _getOption: function(name) {
            var option = this.getOption(name);

            _.isFunction(option) && (option = option.call(this));

            return option;
        },

        getViewOptions: function() {
            var baseOptions = {};

            if (this.model) {
                baseOptions.model = this.model;
            }

            if (this.collection) {
                baseOptions.collection = this.collection;
            }

            var options = this._getOption('viewOptions');

            return _.extend(baseOptions, options);
        },

        getViewEvents: function() {
            return this._getOption('viewEvents');
        },

        getViewTriggers: function() {
            return this._getOption('viewTriggers');
        },

        getModelEvents: function() {
            return this._getOption('modelEvents');
        },

        getCollectionEvents: function() {
            return this._getOption('collectionEvents');
        },

        buildView: function() {
            var viewOptions = this.getViewOptions();
            var ViewClass = this.getViewClass();

            var view = new ViewClass(viewOptions);
            this.bindEvents(view);
            this.bindTriggers(view);

            return view;
        },

        bindEvents: function(view) {
            this.viewEvents = this.getViewEvents();
            Marionette.bindEntityEvents(this, view, this.viewEvents);

            // this triggers the `'bind:events'` event and calls `onBindEvents`
            this.triggerMethod('bind:events', view);
        },

        bindTriggers: function(view) {
            this.viewTriggers = this.getViewTriggers();

            _.each(this.viewTriggers, function(value, key) {
                this._buildTrigger(view, key, value);
            }, this);

            // this triggers the `'bind:triggers'` event and calls `onBindTriggers`
            this.triggerMethod('bind:triggers', view);
        },

        _buildTrigger: function(view, eventName, triggerName) {
            this.listenTo(view, eventName, _.bind(function() {
                this.trigger.apply(this, _.union([triggerName], _.toArray(arguments)));
            }, this));
        },

        hasView: function() {
            return this.view && !this.view.isDestroyed;
        },

        getView: function() {
            if (!this.view || this.view.isDestroyed) {
                this.view = this.buildView();

                if (this.getOption('isDestroyedWithView')) {
                    this.listenTo(this.view, 'destroy', this.destroy);
                }
            }

            return this.view;
        },

        onDestroy: function() {
            if (this.view && !this.view.isDestroyed) {
                this.view.destroy();
            }
        }
    });
});