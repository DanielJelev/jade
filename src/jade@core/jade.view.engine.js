var TemplateEngine = (function(){

    function TemplateEngine(scope){
        this.inputElements = document.querySelectorAll('[jmodel]');
        this.boundElements = document.querySelectorAll('[jbind]');
        this.scope = scope;
    }

    TemplateEngine.prototype.config = function(){

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
    }
      
    TemplateEngine.prototype.setPropUpdateLogic= function(prop) {
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

    return TemplateEngine;
}());