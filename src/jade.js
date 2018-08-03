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

    Route.prototype.checkForParam = function () {
        if (this.path.indexOf(":") > -1) {
            this.setRouteParams();
            return true;
        }
    }

    Route.prototype.setRouteParams = function () {
        console.log();
    }

    Route.prototype.getBasePath = function () {
        return this.path
    }
    return Route;

}());


var ViewEngine = (function () {

    function ViewEngine(scope) {
        this.modelSelector = '[jmodel]'
        this.bindSelector = '[jbind]';
        this.repeaterSelector = '[jfor]';
        this.viewModelSelector = "[jvm]"
        this.ifStatmentsSelector = "[jif]"

        this.inputElements = document.querySelectorAll(this.modelSelector);
        this.boundElements = document.querySelectorAll(this.bindSelector);
        this.repeatElements = document.querySelectorAll(this.repeaterSelector);
        this.viewModelElements = document.querySelectorAll(this.viewModelSelector)
        this.ifStatemetnsElements = document.querySelectorAll(this.ifStatmentsSelector)
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

        for (var el of this.repeatElements) {
            var propName = el.getAttribute('jfor');
            this.setPropUpdateLogic(propName);
        }

        for (var el of this.viewModelElements) {
            var propName = el.getAttribute('jvm');
            this.setPropUpdateLogic(propName);
        }

        for (var el of this.ifStatemetnsElements) {
            var propName = el.getAttribute('jif');
            this.setPropUpdateLogic(propName);

        }

        return this.scope;
    }

    ViewEngine.prototype.setPropUpdateLogic = function (prop) {
        if (!this.scope.hasOwnProperty(prop)) {
            var value;
            var that = this;

            Object.defineProperty(this.scope, prop, {
                // Automatically update bound dom elements when a scope property is set to a new value
                set: function (newValue) {
                    value = newValue;
                    that.setModeValue(newValue, prop);
                    that.setBindValue(newValue, prop);
                    that.setRepeaterValue(newValue, prop);
                    that.setViewModelValue(newValue, prop);
                    that.setIfStatementValue(prop)

                },
                get: function () {
                    return value;
                },
                enumerable: true
            })
        }
    }

    ViewEngine.prototype.setModeValue = function (newValue, prop) {
        // Set input elements to new value
        for (var el of this.inputElements) {
            if (el.getAttribute('jmodel') === prop) {
                if (el.type) {
                    el.value = newValue;
                }
            }
        }
    }

    ViewEngine.prototype.setBindValue = function (newValue, prop) {
        // Set all other bound dom elements to new value
        for (var el of this.boundElements) {
            if (el.getAttribute('jbind') === prop) {
                if (!el.type) {
                    el.innerHTML = newValue;
                }
            }
        }
    }

    ViewEngine.prototype.setRepeaterValue = function (newValue, prop) {
        // Set all object values and repeat html
        for (var el of this.repeatElements) {
            if (el.getAttribute('jfor') === prop) {
                if (Array.isArray(newValue)) {
                    var result = ""
                    for (var i in newValue) {
                        var a = newValue[i];
                        var templateRow = el.innerHTML;

                        for (var j in a) {
                            var current = a[j];
                            var regex = '{' + prop + '.' + j + '}'
                            templateRow = templateRow.replace(regex, current)
                        }
                        result += templateRow
                    }
                    el.innerHTML = result;
                }
            }
        }
    }

    ViewEngine.prototype.setViewModelValue = function (newValue, prop) {
        // Set object values or normal value and repeat html
        for (var el of this.viewModelElements) {
            if (el.getAttribute('jvm') === prop) {
                if (typeof newValue === 'object') {
                    var templateRow = el.innerHTML;
                    for (var i in newValue) {
                        var current = newValue[i];
                        var regex = '{' + prop + '.' + i + '}'
                        templateRow = templateRow.replace(regex, current)
                    }
                    el.innerHTML = templateRow;
                } else {
                    var templateRow = el.innerHTML;
                    var regex = '{' + prop + '}'
                    templateRow = templateRow.replace(regex, newValue)
                    el.innerHTML = templateRow;
                }
            }
        }
    }

    ViewEngine.prototype.setIfStatementValue = function (prop) {
        var that = this;
        for (var el of this.ifStatemetnsElements) {
            if (el.getAttribute('jif').indexOf(prop) > -1) {
                if (prop) {
                    var attribute = el.getAttribute('jif');
                    var props = getScopePropertyFromExpression(attribute);
                    var expression = replaceExpression(props, attribute);
                    console.log(that.scope)
                    var evalCondition = eval(expression);

                    if (evalCondition === true || typeof evalCondition === 'object') {
                        el.style.display = 'block';
                    }
                    else {
                        el.style.display = 'none';
                    }
                }
            }
        }

        function getScopePropertyFromExpression(expression) {
            var properties = [];
            for (var i in that.scope) {
                if (expression.indexOf(i) > -1 && expression != i) {
                    properties.push(i)
                }
            }

            return properties;
        }

        function replaceExpression(properties, expression) {

            for (var i in properties) {
                var currentProp = properties[i];
                expression = expression.replace(currentProp, "that.scope." + currentProp)
            }

            return expression;
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
        this.rootSelector;
    }

    Component.prototype.setTemplate = function () {
        var element = document.getElementsByTagName(this.rootSelector)[0];

        if (this.selector) {
            var template = document.createElement(this.selector);
            template.innerHTML = this.template;
            element.innerHTML = template.innerHTML;
        } else {
            element.innerHTML = this.template;
        }

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
            component.rootSelector = this.selector;
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
            var isRouteHaveParam = r.checkForParam();
            if (isRouteHaveParam) {
                r.path = r.getBasePath();
            }
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