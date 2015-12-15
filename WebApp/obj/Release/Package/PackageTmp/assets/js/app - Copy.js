//angular-ui-router
angular.module("app", ["ui.router"])
    .config(function cofig($stateProvider) {
        $stateProvider.state("nutrition.user", {
            url: "",
            controller: "UserCtrl as user",
            templateUrl : "templates/user.html"
        })
        .state("nutrition.profile", {
            url: "/profile",
            controller: "ProfileCtrl as profile",
            templateUrl: "templates/profile.html"
        })
        .state("nutrition.food", {
            url: "/food",
            controller: "FoodCtrl as food",
            templateUrl: "templates/food.html"
        });
        
    })
    .service("user", function User() {
        var name = this;
        name.first = "Default";
        name.last = "Default";
    })
    .controller("UserCtrl", function FristCtrl(user) {
        var user = this;
        user = user;
    })
    .controller("ProfileCtrl", function FristCtrl(user) {
        //var user = this;
        //user = user;
    })
    .controller("ProfileCtrl", function FristCtrl(user) {
        //var user = this;
        //user = user;
    });