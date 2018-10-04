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



# Creating modules
**After we created our Jade app, lets create our first module.**
```javascript
// Creating new Module
var baseUrl = "http://localhost:4200/"
var appRoutes = [
    {
        url: baseUrl + "#/",
        component : "IndexComponent"
    },
    {
        url : baseUrl + "#/home",
        component : "HomeComponent"
    }
];

app.module("MainModule", {
    components : [
    "IndexComponent",
    "HomeComponent"],
    router : appRoutes
})
```

> **This is how we create module. It will load all components which are presented in our component propery. Also we need to present routes which will be resolved by module and load component which are identically  to the route.**

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
# Visualisation
# -- jfor
> **We can easly render collections using jfor html helper**
```javascript
function UserComponent(scope) {
    scope.users = [{
        firstName : "John",
        lastName : "Mannuel"
    },
    {
        firstName  : "Peter",
        lastName : 'Peterson'
    },
    {
        firstName  : "Abby",
        lastName : "Simpson"
    }];
};
```
```html
<div jfor="users">
    <div>{users.firstName}</div>
    <div>{users.lastName}</div>
    <a href="{user.id}"> {user.name} Details</a>
    <hr>
</div>
```

# -- jvm
> **jvm html helper is using for representing of view model - j view model**
```html
<div jvm="user">
    {user.name}
    {user.id}
    <a href="{user.id}"> {user.name} Details</a>
</div>
```
> **We can also use the anotation for attributes like href="{user.id} will be replaced with id from the user object"**
> **You can easly use it for single object or...**
```html
<div jvm="title">{title}</div>
```
# -- jclick 
> **jclick html helper allow us to bind function which will be invoked from component and trigger the behaviour of it when you click on element wher it is binded.** 
```javascript
function UserComponent(scope) {
  scope.redirectTo = function(){
        app.router.redirect("#/home");
    }
};
```
```html
<button type="button" jclick="redirectTo">Click to redirect</button> 
```

> **You can use it for single property like scope.title = "Page Title"**.
# -- jif
> **jif html helperer allow us to build logical operations over html elements like standart if staitment-**
```html
<div jif="users.length == 0">
   <h1> No users to display </h1>
</div>

<div jif="users.length > 0">
   <h1> Users list </h1>
   <p>{users.firstName}</p>
   <p>{users.lastName}</p>
</div>
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
 > We can easly invoke whole component in our html everywhere by calling the selector of the component. This will load whole component class, services and providers functionality required for this component.
```html
 <users><users/>
  ```

# Creating a new injectable service

```javascript
app.service("UserService",{
    serviceClass : UserService,
    providers : ["Http", "Cookie"]
});
function UserService (Http, Cookie){
    function getUserData(){
        return Http.get("app/user.json");
    };
    return {
        getUserData : getUserData,
    };
};
```
> **Creating of service require serviceClass function which is our main function. In this case we need to review all public functions which we want to invoke in out component in return object**.

> **We have providers which are comming out of the box for you and can be injected in services and components.**.

# Providers
-
# Http
> **Http provider can be injected in components and services. Helping us to make API requests. Every Http request returning promise as a result**.
```javascript
Http.get(url, headerOptions);
Http.post(url, data, headerOptions);
Http.put(url, data, headerOptions);
Http.delete(url, data, headerOptions);
```
> **Parameters
URL - request url as string
data - POST data which will be sended to API.
headerOptions - Array of Objects wich help to configure request headers parametes**.
```javascript
var headerOptions = [{name : "Content-Type", value : "application/json"}];
Http.post(url, data, headerOptions);
```
# Cookie
> **Cookie provider can be injected in components and services. Helping us to store and get data from browser cookies**.
```javascript
Cookie.setCookie(name, value, exdays) // Set new cookie with name , value and expiration days / time
Cookie.getCookie(name); // Get cookie by name
```

# Working with route with query params 
```javascript

var baseUrl = "http:\\localhost:4200"
var appRoutes = [ {
        url : baseUrl + "#/details/?id",
        component : "DetailsComponent"
    }
];
app.module("MainModule", {
    components : [
    "DetailsComponent"],
    router : appRoutes
})
```
> **Everything after "?" char is query and will be replaced with url value
Example http://localhost:4200/#/details/1**

# How to access and work with url params?
```javascript
app.component("DetailsComponent",{...
})
function DetailsComponent(scope, UserService){
    var id = app.router.params["id"];
    scope.user = UserService.getById(id);
}
```

# Redirect to url
> **In the example we will trigger redirection to the Home page**.
```javascript
app.component("DetailsComponent",{...
})
function DetailsComponent(scope, UserService){
  app.router.redirect("#/home")
}
```
# In development 

- Implement support of more modules
- Implement more html helpers


### Development

Want to contribute? Great! 
You can check my github https://github.com/DanielJelev/jade or...
Contact me on danieljelev93@gmail.com for more info.


License
----

MIT


**Free Software, Hell Yeah!**

