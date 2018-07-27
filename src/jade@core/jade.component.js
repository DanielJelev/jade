
var Component = (function(){

    function Component(options){
        this.selector = options.selector;
        this.templateUrl = options.templateUrl;
        this.template = options.template;
        this.componentClass = options.componentClass;
        this.reader = new FileReader();
        this.scope = {}
    }

    Component.prototype.setTemplate = function(){
        var element = document.getElementsByTagName(app.selector)[0];

        if(this.selector){
          var template = document.createElement(this.selector);
          template.innerHTML = this.template;
          element.innerHTML = template.innerHTML;
        }else{
            element.innerHTML = this.template;
        }
       
    }

    Component.prototype.setTemplateUrl = function() {
        var element = document.getElementsByTagName(this.selector);
        var file = new File(this.templateUrl);
        var html = this.reader.readAsText(file)
        element.innerHtml = html;
    }

    Component.prototype.config = function(){
        this.setTemplate();
        this.componentClass(this.scope);

        var templateEngine = new TemplateEngine(this.scope);
        templateEngine.config();
    }

    return Component;
    
}());

