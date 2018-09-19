var Router = (function () {
    /**
    * @function
    * @param {Array[object]} routes - Array of objects that have url and component name as string
    */
    function Router(routes) {
        this.routes = [];
        this.currentRoute = null;
        this.params = {};
        this.config(routes)
    }

    Router.prototype.config = function (routerConfig) {
        for (var r in routerConfig) {
            this.routes.push(new Route(
                routerConfig[r].url,
                routerConfig[r].component
            ));
        }
    }

    Router.prototype.setCurrentRoute = function (route) {
        this.currentRoute = route;
    }

    Router.prototype.setParams = function (prefix) {
        var parts = location.href.split('/')
        var query = parts[parts.length - 1]

        if (!Object.keys(this.params)[0]) {
            this.params[prefix] = parseInt(query);
        }
        else {
            var key = Object.keys(this.params)[0];
            this.params[key] = parseInt(query);
        }
    }
    /**
    * @function
    * @param {string} url - redirect to hash url string
    */
    Router.prototype.redirect = function (url) {
        location.hash = url;
    }

    return Router;

}())

var Route = (function () {

    function Route(path, component) {
        this.path = path;
        this.component = component;
    }

    Route.prototype.checkForParam = function () {
        if (this.path.indexOf("?") > -1) {
            return true;
        }
        var lastElement = this.path.split('/');
        // 5 is because standart url have
        var lastElementIndex = 5;
        if (lastElement[lastElementIndex]) {
            return true;
        }
        return false;
    }

    Route.prototype.setBasePath = function (params) {
        var prefix = this.getRoutePrefix();
        var newPath = this.path.replace("?" + prefix, params[prefix]);
        this.path = newPath;
    }

    Route.prototype.getRoutePrefix = function () {
        var prefixChar = "?";
        if (this.path.indexOf("?") < 0) {
            prefixChar = '/'
            if (this.path != location.href) {
                var prefix = location.href.split(prefixChar);
                prefix = prefix[prefix.length - 1];

                return prefix;
            }

        } else {
            var prefix = this.path.split(prefixChar);
            prefix = prefix[prefix.length - 1];
            return prefix;
        }

    }

    return Route;

}());


var ViewEngine = (function () {

    function ViewEngine(scope) {
        this.modelSelector = '[jmodel]'
        this.bindSelector = '[jbind]';
        this.repeaterSelector = '[jfor]';
        this.viewModelSelector = "[jvm]";
        this.ifStatmentsSelector = "[jif]";
        this.clickSelector = "[jclick]";

        this.inputElements = document.querySelectorAll(this.modelSelector);
        this.boundElements = document.querySelectorAll(this.bindSelector);
        this.repeatElements = document.querySelectorAll(this.repeaterSelector);
        this.viewModelElements = document.querySelectorAll(this.viewModelSelector)
        this.ifStatemetnsElements = document.querySelectorAll(this.ifStatmentsSelector)
        this.clickElements = document.querySelectorAll(this.clickSelector)
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
                    console.log(el.value)
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

        for (var el of this.clickElements) {
            var propName = el.getAttribute('jclick');

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
                    that.setClickValue(newValue, prop);
                    that.setIfStatementValue(prop);

                },
                get: function () {
                    return value;
                },
                enumerable: true
            })
        }
    }

    ViewEngine.prototype.setClickValue = function (newValue, prop) {

        // Set input elements to new value
        for (var el of this.clickElements) {

            if (el.attributes['jclick'].nodeValue === prop) {
                if (typeof newValue === "function") {  
                    el.addEventListener("click", newValue);
                }
            }
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
                            var property = { name: prop, prefix: j };
                            templateRow = this.setRepeaterAttributesValues(templateRow, current, property)
                        }
                        result += templateRow
                    }
                    el.innerHTML = result;
                }
            }
        }
    }

    ViewEngine.prototype.setRepeaterAttributesValues = function (templateRow, value, property) {
        var regex = '{' + property.name + '.' + property.prefix + '}'
        templateRow = templateRow.replace(regex, value)

        return templateRow;
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
                        for (var att in el.attributes) {
                            if (el.attributes[att].nodeValue) {
                                el.attributes[att].nodeValue = el.attributes[att].nodeValue.replace(regex, current)
                            }
                        }
                    }
                    el.innerHTML = templateRow;
                } else {
                    var templateRow = el.innerHTML;
                    var regex = '{' + prop + '}'
                    templateRow = templateRow.replace(regex, newValue)
                    el.innerHTML = templateRow;
                    for (var att in el.attributes) {
                        if (el.attributes[att].nodeValue) {
                            el.attributes[att].nodeValue = el.attributes[att].nodeValue.replace(regex, newValue)
                        }
                    }
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
        this.isChildComponent = false;
        this.rootSelector;

    }

    Component.prototype.setTemplate = function () {
        var element = document.getElementsByTagName(this.rootSelector)[0];
        if (this.selector) {
            var template;
            if(element.innerHTML.indexOf(this.selector) > -1){
                template = document.querySelector(this.selector);
            }else{
                template = document.createElement(this.selector);
            }

            if(this.isChildComponent){
                template.innerHTML += this.template;
            }else{
                template.innerHTML += this.template;
                element.appendChild(template);
            }
           
        } else {
            element.innerHTML = this.template;
        }

    }

    Component.prototype.injectServices = function (services) {
        this.servicesClasses = services;
    }

    Component.prototype.config = function () {
        var that = this;

        return new Promise(function (resolve, reject) {
            if (that.templateUrl) {
                that.loadTemplateUrl().then(function (template) {
                    that.template = template;
                    that.setTemplate();
                    that.setUpComponent();
                    resolve();
                });
            } else {
                that.setTemplate();
                that.setUpComponent();
                resolve();
            }
        });


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
    /**
    * @property {object} options  - Jade app options
    * @property {string} options.selector  - Element selector 
    * @property {Router} options.router - Router 
    */
    function Jade(options) {
        this.selector = options.selector;
        this.router = options.router;
        this.currentRoute = null;
        this.components = [];
        this.services = [];
        this.currentComponent = null;
        this.init();
    }

    /**
     * @function
     * @param {string} name - Component name
     * @property {object} options  - Component options
     * @property {string} options.selector  - Element selector for component
     * @property {string} options.templateUrl - Local path to .html file
     * @property {string} options.template - Render html directly from component
     * @property {function} options.componentClass - Component class function which is the main executeble function of the component
     * @property {Array[string]} options.services - Array of Service dependencies called by name of the service. 
     */
    Jade.prototype.component = function (name, component) {
        this.components.push({
            name: name,
            component: new Component(component)
        });
    }

    /**
 * @function
 * @param {string} name - Service name
 * @param {object} options - Service name
 * @property {function} service.serviceClass - Service class function which is the main executeble function of the service
 */
    Jade.prototype.service = function (name, service) {
        this.services.push({
            name: name,
            service: service.serviceClass
        });
    }

    Jade.prototype.configComponent = function () {
        var that = this;
        var route = this.getCurrentRoute();
        var isRouteHaveParam = route.checkForParam();
        if (isRouteHaveParam) {
            var prefix = route.getRoutePrefix();
            this.router.setParams(prefix);
            route.setBasePath(this.router.params);
        }

        if (route && this.currentRoute != route.path) {

            this.currentRoute = route.path;
            this.router.setCurrentRoute(route)
            var component = this.getCurrentComponentByName(route.component);
            this.injectServices(component);
            component.rootSelector = this.selector;
            component.config().then(function () {
                that.setCurrentComponentSelector(component);
                that.configInnerComponents(component)
            });
        }
    }

    Jade.prototype.setCurrentComponentSelector = function(component){
        if(component.selector){
            this.currentComponent = component.selector;
        }else{
            this.currentComponent = this.selector;
        }
    }

    Jade.prototype.configInnerComponents = function (component) {
        var that = this;
        for (var comp in this.components) {
            var component = this.components[comp].component;
            var selectedComponent = document.querySelectorAll(component.selector);
            if (selectedComponent.length > 0 && that.currentComponent != component.selector) {
                this.injectServices(component);
                component.rootSelector = that.currentComponent;
                component.isChildComponent = true;
                component.config().then(function () {

                });
            }
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

            var locationUrl = location.hash.split("/")[1]
            var path = r.path.split('/#/')[1];
            if (path.indexOf(locationUrl) > -1) {
                return r.path;
            }
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
            that.resetPageState();
            that.configComponent();
            
        });
    }

    Jade.prototype.resetPageState = function(){
        var root = document.getElementsByTagName(this.selector)[0];
        root.innerHTML = '';
    }

    return Jade

}())