var Router = (function(){

    function Router(){
        this.routes = [];
    }

    Router.prototype.config = function(routerConfig){
        for( var r in routerConfig){
            this.routes.push(new Route(
                routerConfig[r].url,
                routerConfig[r].component
            ))
        }
    }

    Router.prototype.observeRouteUrl = function(){

    }

    return Router;
    
}())