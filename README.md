# jadejs



##### Jadejs is a light front-end framework build over vanilla JavaScript using component pattern. Jadejs is build over ECS5 features.

# Installation
```sh
npm install jadejs
```
# Import in index.html
```html
<script src="node_modules\jadejs\src\jade.js"></script>
```
# Documentation
-
- 
-
# Creating of a new Jade app is simple.
```javascript
var app = app || {};
(function(){
    app = new Jade({
        selector : "my-app"
    });
}(app));
```
> Create root element of our app in index.html
```html
<my-app><my-app/>
```
**Now we have our Jade app...**

# Creating component
**After we created our Jade app, lets create our first component.**
```javascript
// Creating new Component
app.component("HomeComponent", {
    selector: "home-component",
    template:'<h1 jmodel="pageHeader"></h1>',
    services: ["HomeService"],
    componentClass: HomeComponent,
});

//Main logic component function
function HomeComponent(scope, HomeService) {
    var pageHeader = HomeService.getPageHeader();
    scope.pageHeader = pageHeader;
};
```
# Load templateUrl and template
```javascript
template:'<h1 jmodel="pageHeader"></h1>'
```
> **You can render HTML directly in the component using template OR...**
```javascript
templateUrl:'app/components/home.component.html'
```
>**You can use templateUrl to load static html file and render it.**

# What is scope object?
> **scope object is the communication between component and tempalte/view html. You can easly assign values to this object and display it on page. Scope object is two way binding object which observe the state of the assigned objects on it and update the values in models.**
```javascript
function HomeComponent(scope, HomeService) {
    var pageHeader = HomeService.getPageHeader();
    scope.pageHeader = pageHeader;
};
```
# What is jmodel and jbind and how to use it?
>  **jmodel** creating properies which we use to store information via html and use it in our component.
 ```html
 <input type="text" jmodel="pageHeader"/>
  ```
 > **jbind** is representation notation for displaying objects and properties on our page. **Everything typed in jmodel="pageHeader" will be automatically updated in jbind model**
 ```html
<h1 jbind="pageHeader"></h1>'
 ```
 
# Invocation of component by selector
 > We can easly invoke whole component in our html everywhere by calling the selector of the component.
```html
 <home-component><home-component/>
  ```

# Creating a new injectable service

```javascript
app.service("HomeService", {
    serviceClass : HomeService
});
function HomeService(){
    function getPageTitle(){
        var title = "Home Page Title";
        return title;
    };
    return {
        getPageTitle : getPageTitle
    };
};
```
> **Creating of service require serviceClass function which is our main function. In this case we need to review all public functions which we want to invoke in out component in return object**.
# Easy to manage routings
```javascript
var app = app || {};
(function(){
    var baseUrl = "http:\\localhost:4200"
    var appRoutes = [{
            url : baseUrl + "#home",
            component : "HomeComponent"
        }
    ];
    var router = new Router(appRoutes);
    app = new Jade({
        selector : "my-app",
        router : router
    });
    
}(app));
```

# In development 

- Implement support of more modules
- Implement more html helpers


### Development

Want to contribute? Great! Contact me on danieljelev93@gmail.com for more info.


License
----

MIT


**Free Software, Hell Yeah!**

