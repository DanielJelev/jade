var Router = (function () {
    /**
    * @function
    * @param {Array[object]} routes - Array of objects that have url and component name as string
    */
    function Router(routes) {
        this.routes = [];
        this.currentRoute = null;
        this.params = {};
        this._config(routes)
    }

    Router.prototype._config = function (routerConfig) {
        for (var r in routerConfig) {
            this.routes.push(new Route(
                routerConfig[r].url,
                routerConfig[r].component
            ));
        }
    }

    Router.prototype._setCurrentRoute = function (route) {
        this.currentRoute = route;
    }

    Router.prototype._setParams = function (prefix) {
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

    Route.prototype._checkForParam = function () {
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

    Route.prototype._setBasePath = function (params) {
        var prefix = this._getRoutePrefix();
        var newPath = this.path.replace("?" + prefix, params[prefix]);
        this.path = newPath;
    }

    Route.prototype._getRoutePrefix = function () {
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

    ViewEngine.prototype._configScope = function () {

        for (var el of this.inputElements) {
            if (el.type === 'text') {
                // Get property name from each input with an attribute of 'mm-model'
                var propName = el.getAttribute('jmodel');

                // Update bound scope property on input change
                el.addEventListener('keyup', function () {
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

        for (var el of this.clickElements) {
            var propName = el.getAttribute('jclick');
            this.setPropUpdateLogic(propName);
        }

        return this.scope;
    }

    ViewEngine.prototype.setPropUpdateLogic = function (prop) {
        if (!this.scope.hasOwnProperty(prop)) {
            var value;
            var _self = this;
            Object.defineProperty(this.scope, prop, {
                // Automatically update bound dom elements when a scope property is set to a new value
                set: function (newValue) {
                    value = newValue;
                    _self.setModeValue(newValue, prop);
                    _self.setBindValue(newValue, prop);
                    _self.setRepeaterValue(newValue, prop);
                    _self.setViewModelValue(newValue, prop);
                    _self.setClickValue(newValue, prop);
                    _self.setIfStatementValue(prop);

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
        var _self = this;
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
            for (var i in _self.scope) {
                if (expression.indexOf(i) > -1 && expression != i) {
                    properties.push(i)
                }
            }

            return properties;
        }

        function replaceExpression(properties, expression) {

            for (var i in properties) {
                var currentProp = properties[i];
                expression = expression.replace(currentProp, "_self.scope." + currentProp)
            }

            return expression;
        }
    }

    return ViewEngine;

}());


var Http = (function () {

    function Http() {

    }
    /**
      * @function
      * @property {string} url - Request URL
      * @property {{Array[object]}} headers - Change headers - example [{ name : "Content-Type", value : "application/json"}]
      */
    Http.prototype.get = function (url, headers) {
        return this._base("GET", url, null, headers);
    }

    /**
  * @function
  * @property {string} url - Request URL
  * @property {string} data - Request data 
  * @property {{Array[object]}} headers - Change headers - example [{ name : "Content-Type", value : "application/json"}]
  */
    Http.prototype.post = function (url, data, headers) {
        return this._base("POST", url, data, headers);
    }

    /**
     * @function
     * @property {string} url - Request URL
     * @property {string} data - Request data 
     * @property {{Array[object]}} headers - Change headers - example [{ name : "Content-Type", value : "application/json"}]
     */
    Http.prototype.put = function (url, data, headers) {
        return this._base("PUT", url, data, headers);
    }

    /**
     * @function
     * @property {string} url - Request URL
     * @property {string} data - Request data 
     * @property {{Array[object]}} headers - Change headers - example [{ name : "Content-Type", value : "application/json"}]
     */
    Http.prototype.delete = function (url, data, headers) {
        return this._base("DELETE", url, data, headers);
    }


    Http.prototype._base = function (method, url, data, headers) {
        var self = this;
        var promise = new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr = self._setHeaders(xhr, headers);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);

                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send(data);
        });

        return promise;
    }

    Http.prototype._setHeaders = function (xhr, headers) {
        if (headers != null) {
            headers.forEach(function (header) {
                xhr.setRequestHeader(header.name, header.value);
            })
        }
        return xhr;
    }

    return Http;

}());


var Cookie = (function(){

    function Cookie(){

    }

    Cookie.prototype.setCookie = function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    Cookie.prototype.getCookie = function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    return Cookie;

}());


var Component = (function () {

    function Component(options) {
        this.selector = options.selector;
        this.templateUrl = options.templateUrl;
        this.template = options.template;
        this.componentClass = options.componentClass;
        this.services = options.services;
        this.providers = options.providers;
        this.servicesClasses = [];
        this.providerClasses = [];
        this.scope = {}
        this.isChildComponent = false;
        this.rootSelector;

    }

    Component.prototype._setTemplate = function () {
        var element = document.getElementsByTagName(this.rootSelector)[0];
        if (this.selector) {
            var template;
            if (element.innerHTML.indexOf(this.selector) > -1) {
                template = document.querySelector(this.selector);
            } else {
                template = document.createElement(this.selector);
            }

            if (this.isChildComponent) {
                template.innerHTML += this.template;
            } else {
                template.innerHTML += this.template;
                element.appendChild(template);
            }

        } else {
            element.innerHTML = this.template;
        }

    }

    Component.prototype._injectServices = function (services) {
        this.servicesClasses = services;
    }

    Component.prototype._injectProviders = function (providers) {
        this.providerClasses = providers;
    }

    Component.prototype._config = function () {
        var _self = this;

        return new Promise(function (resolve, reject) {
            if (_self.templateUrl) {
                _self._loadTemplateUrl().then(function (template) {
                    _self.template = template;
                    _self._setTemplate();
                    resolve(_self);
                });
            } else {
                _self._setTemplate();
                resolve(_self);
            }
        });
    }

    Component.prototype._setUpComponent = function () {
        this.scope = {}

        var viewEngine = new ViewEngine(this.scope);
        var scope = viewEngine._configScope();

        var componentArgs = [scope]
        componentArgs = componentArgs.concat(this.servicesClasses)
        componentArgs = componentArgs.concat(this.providerClasses)

        this.componentClass.apply(null, componentArgs)
    }

    Component.prototype._loadTemplateUrl = function (e) {
        var http = new Http();
        var promise = http.get(this.templateUrl);
        return promise;
    }

    return Component;

}());

var Module = (function () {

    function Module(options) {
        this.router = new Router(options.router);
        this.componentsName = options.components;
        this.initComponents = [];
        this.initServices = [];
        this.components = [];
        this.services = [];
        this.providers = [];
        this.currentComponent = null;
        this.selector = null;
        this.isInitialized = false;
    }

    Module.prototype._injectComponents = function () {
        var _self = this;
        this.initComponents.forEach(function (component) {
            if (_self.componentsName.indexOf(component.name) > -1) {
                _self.components.push(component)
            }
        })
    }

    Module.prototype._injectProviders = function () {
        var _self = this;
        this.initProviders.forEach(function (provider) {
            if (_self.componentsName.indexOf(component.name) > -1) {
                _self.components.push(component)
            }
        })
    }

    Module.prototype._configComponent = function () {
        var _self = this;
        var route = this._getCurrentRoute();
        var isRouteHaveParam = route._checkForParam();
        if (isRouteHaveParam) {
            var prefix = route._getRoutePrefix();
            this.router._setParams(prefix);
            route._setBasePath(this.router.params);
        }

        if (route && this.currentRoute != route.path) {

            this.currentRoute = route.path;
            this.router._setCurrentRoute(route)
            var component = this._getCurrentComponentByName(route.component);
            this._injectServices(component);
            this._injectProviders(component);
            component.rootSelector = this.selector;
            component._config().then(function () {
                _self._setCurrentComponentSelector(component);
                _self._configInnerComponents(component)
                component._setUpComponent();
            });
        }

    }

    Module.prototype._getCurrentRoute = function () {
        var route = this.router.routes.filter(function (r) {
            var locationUrl = location.hash.split("/")[1]
            var path = r.path.split('/#/')[1];
            if (path.indexOf(locationUrl) > -1) {
                return r.path;
            }
        })[0];

        return route;
    }

    Module.prototype._getCurrentComponentByName = function (componentName) {
        var component = this.components.filter(function (component) {
            return componentName == component.name;
        })[0].component;

        return component;
    }

    Module.prototype._injectServices = function (component) {

        var _self = this;
        var services = this.initServices.filter(function (item) {
            if (component.services != null && component.services.indexOf(item.name) != -1) {
                return item.service;
            }
        }).map(s => s = s.service.serviceClass.apply(null, _self.providers));

        component._injectServices(services);
    }

    Module.prototype._injectProviders = function (component) {

        var providers = this.providers.filter(function (item) {
            if (component.providers != null && component.providers.indexOf(item.constructor.name) != -1) {
                return item
            }
        })

        component._injectProviders(providers);
    }

    Module.prototype._setCurrentComponentSelector = function (component) {
        if (component.selector) {
            this.currentComponent = component.selector;
        } else {
            this.currentComponent = this.selector;
        }
    }

    Module.prototype._configInnerComponents = function (component) {
        var _self = this;
        for (var comp in this.components) {
            var component = this.components[comp].component;
            var selectedComponent = document.querySelectorAll(component.selector);
            if (selectedComponent.length > 0 && _self.currentComponent != component.selector) {
                _self._initComponent(component, selectedComponent.length)
            }
        }
    }

    Module.prototype._initComponent = function (component, invokeTimes) {
        if (invokeTimes == 0) {
            return;
        }

        this._injectServices(component);
        component.rootSelector = this.currentComponent;
        component.isChildComponent = true;
        component._config().then(function (comp) {
            comp._setUpComponent(); 
        });

        this._initComponent(component, invokeTimes - 1)

    }

    Module.prototype._config = function (obj) {
        this.initComponents = obj.components;
        this.initServices = obj.services;
        this.selector = obj.selector;
        this.providers = obj.providers;
        if (this.isInitialized === false) {

            this._injectComponents();
        }
        this._getCurrentRoute();
        this._configComponent();
        this.isInitialized = true;
    }

    return Module;

}());

var Service = (function () {

    function Service(options) {
        this.serviceClass = options.serviceClass;
        this.providers = options.providers;
        this.providerClasses = [];
    }

    Service.prototype.setProviders = function (providers) {
        var _self = this;
        this.providerClasses = providers.filter(function (item) {
            if (_self.providers != null && _self.providers.indexOf(item.constructor.name) != -1) {
                return item;
            }
        })

        this.injectProviders();
    }

    Service.prototype.injectProviders = function () {
        this.serviceClass.apply(null, this.providerClasses);
    }



    return Service;
}())

var Jade = (function () {
    /**
    * @property {object} options  - Jade app options
    * @property {string} options.selector  - Element selector 
    * @property {Router} options.router - Router 
    */
    function Jade(options) {
        this.selector = options.selector;
        this.router = null;
        this.currentRoute = null;
        this.modules = [];
        this.components = [];
        this.services = [];
        this.currentComponent = null;
        this.http = {};
        this.providers = []
        this._config();
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
    * @param {string} name - Module name
    * @property {object} options  - Module options
    * @property {Array[string]} options.components - Array of Component dependencies loaded in module. 
    */
    Jade.prototype.module = function (name, module) {
        this.modules.push({
            name: name,
            module: new Module(module)
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
            service: new Service(service)
        });
    }

    Jade.prototype._configModules = function () {

        for (var i in this.modules) {
            var module = this.modules[i].module;
            var isCurrentModul = this._isCurrentModuleRoute(module.router);
            if (isCurrentModul) {
                module._config({
                    selector: this.selector,
                    components: this.components,
                    services: this.services,
                    providers: this.providers
                });
                this._setCurrentRouter(module.router)
                return;
            }
        }
    }

    Jade.prototype._setCurrentRouter = function (router) {
        this.router = router;
    }

    Jade.prototype._config = function () {
        var _self = this;
        window.onload = function (e) {
            _self._configProviders();
            _self._configModules();
            _self._observeRouteChanges();
        }
    }

    Jade.prototype._configProviders = function(){
        this.http = new Http();
        this.cookie = new Cookie();
        this.providers = [this.http, this.cookie]
    }

    Jade.prototype._observeRouteChanges = function () {
        var _self = this;
        window.addEventListener("hashchange", function () {
            _self._resetPageState();
            _self._configModules();
        });
    }

    Jade.prototype._resetPageState = function () {
        var root = document.getElementsByTagName(this.selector)[0];
        root.innerHTML = '';
    }

    Jade.prototype._isCurrentModuleRoute = function (router) {
        for (var i in router.routes) {
            var route = router.routes[i];
            var locationUrl = location.hash.split("/")[1]
            var path = route.path.split('/#/')[1];
            if (path.indexOf(locationUrl) > -1) {
                return true
            }
        }
    }

    return Jade

}())