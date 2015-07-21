(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone', 'marionette', '../../index'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('underscore'), require('backbone'), require('backbone.marionette'), require('../../index'));
    }
})(this, function(_, Backbone, Marionette, ViewController) {
    describe('ViewController', function() {
        'use strict';

        var sandbox;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();
        });


        describe('Controller definition using extend', function() {

            var onBindEventsSpy;
            var onBindTriggersSpy;
            var viewEventBindingSpy;
            var modelEventBindingSpy;
            var collectionEventBindingSpy;
            var Controller;

            beforeEach(function() {
                onBindEventsSpy = sandbox.spy();
                onBindTriggersSpy = sandbox.spy();
                viewEventBindingSpy = sandbox.spy();
                modelEventBindingSpy = sandbox.spy();
                collectionEventBindingSpy = sandbox.spy();

                Controller = ViewController.extend({
                    viewClass: Marionette.LayoutView,
                    viewOptions: {
                        test: 'test'
                    },

                    viewEvents: {
                        'view:event': 'triggerEventBinding'
                    },

                    viewTriggers: {
                        'view:trigger': 'view:trigger'
                    },

                    modelEvents: {
                        'change': 'onModelChange'
                    },

                    collectionEvents: {
                        'add': 'onCollectionAdd'
                    },

                    onBindEvents: onBindEventsSpy,
                    onBindTriggers: onBindTriggersSpy,
                    triggerEventBinding: viewEventBindingSpy,
                    onModelChange: modelEventBindingSpy,
                    onCollectionAdd: collectionEventBindingSpy
                });

            });


            describe('#getView', function() {

                var controllerInstance,
                    onBindEventsTriggerSpy;

                beforeEach(function() {
                    onBindEventsTriggerSpy = sandbox.spy();
                    controllerInstance = new Controller();
                    controllerInstance.on('bind:events', onBindEventsTriggerSpy);
                });

                afterEach(function() {
                    controllerInstance.destroy();
                });

                it('should output an instance of the given view class', function() {
                    var view = controllerInstance.getView();
                    view.should.be.an.instanceof(Marionette.LayoutView);
                });

                it('should use the given view options', function() {
                    var view = controllerInstance.getView();
                    view.getOption('test').should.equal('test');
                });

                it('should trigger bindEvents', function() {
                    controllerInstance.getView();
                    onBindEventsSpy.should.have.been.calledOnce;
                    onBindEventsTriggerSpy.should.have.been.calledOnce;
                });
            });

            describe('#viewEvents', function() {
                var controllerInstance,
                    view;

                beforeEach(function() {
                    controllerInstance = new Controller();
                    view = controllerInstance.getView();
                });

                afterEach(function() {
                    controllerInstance.destroy();
                });

                it('should call the function defined in the view events definition', function() {
                    view.trigger('view:event');
                    viewEventBindingSpy.should.have.been.calledOnce;
                });
            });

            describe('#onBindEvents', function() {
                var controllerInstance,
                    onBindEventsTriggerSpy;

                beforeEach(function() {
                    onBindEventsTriggerSpy = sandbox.spy();
                    controllerInstance = new Controller();
                    controllerInstance.once('bind:events', onBindEventsTriggerSpy);
                });

                afterEach(function() {
                    controllerInstance.destroy();
                });

                it('should trigger default bindEvents', function() {
                    controllerInstance.getView();
                    onBindEventsSpy.should.have.been.calledOnce;
                    onBindEventsTriggerSpy.should.have.been.calledOnce;
                });
            });

            describe('#viewTriggers', function() {
                var controllerInstance,
                    view,
                    controllerTriggerSpy;

                beforeEach(function() {
                    controllerTriggerSpy = sandbox.spy();
                    controllerInstance = new Controller();
                    controllerInstance.once('view:trigger', controllerTriggerSpy);
                    view = controllerInstance.getView();
                });

                afterEach(function() {
                    controllerInstance.destroy();
                });

                it('should call the function defined in the view events definition', function() {
                    view.trigger('view:trigger');
                    controllerTriggerSpy.should.have.been.calledOnce;
                });
            });

            describe('#onBindTriggers', function() {
                var controllerInstance,
                    onBindTriggersTriggerSpy;

                beforeEach(function() {
                    onBindTriggersTriggerSpy = sandbox.spy();
                    controllerInstance = new Controller();
                    controllerInstance.on('bind:triggers', onBindTriggersTriggerSpy);
                });

                afterEach(function() {
                    controllerInstance.destroy();
                });

                it('should trigger default bindTriggers', function() {
                    controllerInstance.getView();
                    onBindEventsSpy.should.have.been.calledOnce;
                    onBindTriggersTriggerSpy.should.have.been.calledOnce;
                });
            });

            describe('#destroy', function() {
                var controllerInstance,
                    onDestroySpy,
                    viewDestroySpy,
                    view;

                beforeEach(function() {
                    controllerInstance = new Controller();
                    view = controllerInstance.getView();
                    viewDestroySpy = sandbox.spy(view, 'destroy');
                    onDestroySpy = sandbox.spy(controllerInstance, 'onDestroy');
                });

                afterEach(function() {
                    controllerInstance.destroy();
                });

                it('should call onDestroy', function() {
                    controllerInstance.destroy();
                    onDestroySpy.should.have.been.calledOnce;
                });

                it('should call view#destroy and destroy the view', function() {
                    controllerInstance.destroy();
                    viewDestroySpy.should.have.been.calledOnce;
                    view.isDestroyed.should.be.true;
                });
            });

            describe('#isDestroyedWithView', function() {
                var DestroyedWithViewController = ViewController.extend({
                    isDestroyedWithView: true
                });

                var controllerInstance,
                    destroySpy,
                    viewDestroySpy,
                    view;

                beforeEach(function() {
                    controllerInstance = new DestroyedWithViewController();
                    destroySpy = sandbox.spy(controllerInstance, 'destroy');
                    view = controllerInstance.getView();
                    viewDestroySpy = sandbox.spy(view, 'destroy');
                });

                afterEach(function() {
                    controllerInstance.destroy();
                });

                it('should destroy the controller when destroying the view', function() {
                    view.destroy();
                    viewDestroySpy.should.have.been.calledOnce;
                    destroySpy.should.have.been.calledOnce;
                });
            });

            describe('#modelEvents', function() {
                var controllerInstance,
                    view,
                    model;

                beforeEach(function() {
                    model = new Backbone.Model();
                    controllerInstance = new Controller({
                        model: model
                    });
                    view = controllerInstance.getView();
                });

                afterEach(function() {
                    controllerInstance.destroy();
                });

                it('should call the function defined in the model events definition', function() {
                    model.set('prop', true);
                    modelEventBindingSpy.should.have.been.calledOnce;
                });
            });

            describe('#collectionEvents', function() {
                var controllerInstance,
                    view,
                    collection;

                beforeEach(function() {
                    collection = new Backbone.Collection();
                    controllerInstance = new Controller({
                        collection: collection
                    });
                    view = controllerInstance.getView();
                });

                afterEach(function() {
                    controllerInstance.destroy();
                });

                it('should call the function defined in the collection events definition', function() {
                    collection.add({prop: true});
                    collectionEventBindingSpy.should.have.been.calledOnce;
                });
            });
        });
    });


    describe('Model and collection in options', function() {
        var Controller;

        beforeEach(function() {
            Controller = ViewController.extend({
                viewClass: Marionette.LayoutView
            });
        });

        it('should bind model and collection to the instance', function() {
            var model = new Backbone.Model(),
                collection = new Backbone.Collection();

            var controller = new Controller({
                model: model,
                collection: collection
            });


            controller.model.should.equal(model);
            controller.collection.should.equal(collection);
        });
    });


    describe('Dynamic view options', function() {
        var Controller;


        beforeEach(function() {
            Controller = ViewController.extend({
                _getDummyValue: function(){
                    return 'dummy';
                },

                viewOptions: function(){
                    var dummyOption = this._getDummyValue();

                    return {
                        dummyOption: dummyOption
                    };
                }
            });
        });

        it('should return the option', function() {
            var model = new Backbone.Model(),
                collection = new Backbone.Collection();

            var controller = new Controller({
                model: model,
                collection: collection
            });


            var options = controller.getViewOptions();

            options.dummyOption.should.equal('dummy');
        });
    })

});
