var Jade = (function(){

    function Jade(options){
        this.selector = options.selector;
        this.router = options.router;
        this.currentRoute = null;
        this.components = [];
        this.init();
    }

    Jade.prototype.component = function(name, component){
        this.components.push({
            name : name,
            component : new Component(component)
         })
    }

    Jade.prototype.configComponent= function(){  
        var route = this.getCurrentRoute();

        if(route && this.currentRoute != route.path){

          this.currentRoute = route.path;
          var component = this.getCurrentComponentByName(route.component)
          component.config();
        }
    }

    Jade.prototype.getCurrentRoute = function(){
        var route = this.router.routes.filter(function(r){
            return location.href == r.path
        })[0]

        return route;
    }

    Jade.prototype.getCurrentComponentByName = function(componentName){
        var component =  this.components.filter(function(component){
            return componentName == component.name;
        })[0].component;

        return component;
    }

    Jade.prototype.init = function() {
        
        var that = this;
        setInterval(function(){
            that.configComponent();
        },100) 
    }

    return Jade
    
}())

