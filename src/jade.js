
var Router = (function () {

    function Router(routes) {
        this.routes = [];
        this.config(routes);
    }

    Router.prototype.config = function (routerConfig) {
        for (var r in routerConfig) {
            this.routes.push(new Route(
                routerConfig[r].url,
                routerConfig[r].component
            ));
        }
    }

    return Router;

}())

var Route = (function () {

    function Route(path, component) {
        this.path = path;
        this.component = component;
    }

    return Route;

}());


var ViewEngine = (function () {

    function ViewEngine(scope) {
        this.inputElements = document.querySelectorAll('[jmodel]');
        this.boundElements = document.querySelectorAll('[jbind]');
        this.scope = scope;
    }

    ViewEngine.prototype.configScope = function () {

        for (var el of this.inputElements) {
            if (el.type === 'text') {
                // Get property name from each input with an attribute of 'mm-model'
                var propName = el.getAttribute('jmodel');

                // Update bound scope property on input change
                el.addEventListener('keyup', e => {
                    this.scope[propName] = el.value;
                });

                // Set property update logic
                this.setPropUpdateLogic(propName);
            }
        }

        return this.scope;
    }

    ViewEngine.prototype.setPropUpdateLogic = function (prop) {
        if (!this.scope.hasOwnProperty(prop)) {
            var value;
            var that = this;

            Object.defineProperty(this.scope, prop, {
                // Automatically update bound dom elements when a scope property is set to a new value
                set: (newValue) => {
                    value = newValue;

                    // Set input elements to new value
                    for (var el of that.inputElements) {
                        if (el.getAttribute('jmodel') === prop) {
                            if (el.type) {
                                el.value = newValue;
                            }
                        }
                    }
                    // Set all other bound dom elements to new value
                    for (var el of that.boundElements) {
                        if (el.getAttribute('jbind') === prop) {
                            if (!el.type) {
                                el.innerHTML = newValue;
                            }
                        }
                    }
                },
                get: () => {
                    return value;
                },
                enumerable: true
            })
        }
    }

    return ViewEngine;

}());

var Component = (function () {

    function Component(options) {
        this.selector = options.selector;
        this.templateUrl = options.templateUrl;
        this.template = options.template;
        this.componentClass = options.componentClass;
        this.services = options.services;
        this.servicesClasses = [];
        this.scope = {}
    }

    Component.prototype.setTemplate = function () {
        var element = document.getElementsByTagName(app.selector)[0];

        if (this.selector) {
            var template = document.createElement(this.selector);
            template.innerHTML = this.template;
            element.innerHTML = template.innerHTML;
        } else {
            element.innerHTML = this.template;
        }

    }

    Component.prototype.setTemplateUrl = function () {

    }

    Component.prototype.injectServices = function (services) {
        this.servicesClasses = services;
    }

    Component.prototype.config = function () {
        if (this.templateUrl) {
            var that = this;
            this.loadTemplateUrl().then(function (template) {
                that.template = template;
                that.setTemplate();
                that.setUpComponent();
            });
        } else {
            this.setTemplate();
            this.setUpComponent();
        }

    }

    Component.prototype.setUpComponent = function () {
        this.scope = {}

        var viewEngine = new ViewEngine(this.scope);
        var scope = viewEngine.configScope();

        var componentArgs = [scope]
        componentArgs = componentArgs.concat(this.servicesClasses)

        this.componentClass.apply(null, componentArgs)
    }

    Component.prototype.loadTemplateUrl = function (e) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', that.templateUrl);

            req.onload = function () {
                if (req.status == 200) {
                    resolve(req.response);
                }
                else {
                    reject(Error(req.statusText));
                }
            };

            req.onerror = function () {
                reject(Error("Network Error"));
            };

            req.send();
        });
    }

    return Component;

}());

var Jade = (function () {

    function Jade(options) {
        this.selector = options.selector;
        this.router = options.router;
        this.currentRoute = null;
        this.components = [];
        this.services = [];
        this.init();
    }

    Jade.prototype.component = function (name, component) {
        this.components.push({
            name: name,
            component: new Component(component)
        });
    }

    Jade.prototype.service = function (name, service) {
        this.services.push({
            name: name,
            service: service.serviceClass
        });
    }

    Jade.prototype.configComponent = function () {
        var route = this.getCurrentRoute();

        if (route && this.currentRoute != route.path) {

            this.currentRoute = route.path;
            var component = this.getCurrentComponentByName(route.component);
            this.injectServices(component);

            component.config();
        }
    }

    Jade.prototype.injectServices = function (component) {

        var services = this.services.filter(function (item) {
            if (component.services != null && component.services.indexOf(item.name) != -1) {
                return item.service
            }
        }).map(s => s = s.service());

        component.injectServices(services);
    }

    Jade.prototype.getCurrentRoute = function () {
        var route = this.router.routes.filter(function (r) {
            return location.href == r.path
        })[0];

        return route;
    }

    Jade.prototype.getCurrentComponentByName = function (componentName) {
        var component = this.components.filter(function (component) {
            return componentName == component.name;
        })[0].component;

        return component;
    }

    Jade.prototype.renderComponent = function () {
        for (var c in this.components) {

            var selector = this.components[c].component.selector;
            var component = document.querySelector(selector);

            if (component) {
                this.components[c].component.injectServices();
                this.components[c].component.config();
            }
        }
    }

    Jade.prototype.init = function () {
        var that = this;
        window.onload = function (e) {
            that.configComponent();
            that.observeRouteChanges();
        }
    }

    Jade.prototype.observeRouteChanges = function () {
        var that = this;
        window.addEventListener("hashchange", function () {
            that.configComponent();
        });
    }

    return Jade

}())