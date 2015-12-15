var debug = false;

angular.module("app.nutrition", ["ui.router", "kendo.directives"])
.config(function cofig($stateProvider) {
    $stateProvider.state("account", {
        url:'',
        views: {
            "ui-section-content" :{
                templateUrl : "templates/account.html",
                controller:"AccountCtrl as account"
            }
        }
    })
    $stateProvider.state("profile", {
        url:'/profile',
        views: {
            "" :{
                templateUrl : "templates/navbar-main.html",
                controller:"NavbarCtrl as navbar",
            },
            "ui-section-content" :{
                templateUrl : "templates/profile.html",
                controller:"ProfileCtrl as profile"
            }
        }
    })
    $stateProvider.state("nourish", {
        url:'/nourish',
        views: {
            "" :{
                templateUrl : "templates/navbar-main.html",
                controller:"NavbarCtrl as navbar",
            },
            "ui-section-content" :{
                templateUrl : "templates/nourishment.html",
                controller:"NourishmentCtrl as nourishment"
            }
        }
    })
})
.controller("NavbarCtrl", function(userSvc, profileSvc, $scope, $state) {    
    $scope.user = userSvc.instance();
    $scope.profile = profileSvc.instance($scope.user.id);
    
     $scope.sign = function(){
         //Clear profile date to enable user edit profile
         if(profileSvc.isValidProfile($scope.profile)){
            $scope.profile.date = '';
            profileSvc.saveToStore($scope.profile);
        }
         
        $state.go("profile");
     }
})
.controller("AccountCtrl", function(userSvc, localStoreSvc, $scope, $state) {  
    //Get user 
    $scope.user = userSvc.instance();
    
    //Go to profile state on a valid user
    if(userSvc.isValidUser($scope.user)){
        $state.go("profile");
    }
    
    if(debug){
        console.log("User details as per AccountCtrl");
        console.dir($scope.user);
    }        
    
    //Save or retrive user from db and go to profile state and
    //Save user in local store.
    $scope.sign = function () {

        var promiseSvc = userSvc.saveToDb($scope.user);
        promiseSvc.then(
            function (payload) {
                $scope.user.id = payload.id;
                if(debug){
                    console.log("AccountCtrl.$scope.sign.promiseSvc : payload");
                    console.dir(payload);
                }

                userSvc.saveToStore($scope.user);
                $state.go("profile");
            },
            function (errorPayload) {
                $log.error('failure loading user service', errorPayload);
            }
        );                    
    }    
})
.controller("ProfileCtrl", function(userSvc, profileSvc, localStoreSvc, $scope, $state) {
    //Get user and profile
    $scope.user = userSvc.instance();
    $scope.profile = profileSvc.instance($scope.user.id);
    
    //Go to account state on an invalid user
    if(!userSvc.isValidUser($scope.user)){
        $state.go('account');
    }
        
    //Go to nourish state on a valid profile
    if(profileSvc.isValidProfile($scope.profile)){
        $state.go("nourish");
    } 
    
    $scope.unitWeightUpdate = function(){
        $scope.profile = profileSvc.unitWeightUpdate($scope.profile);
    }
    
    $scope.unitHeightUpdate = function(){
        $scope.profile = profileSvc.unitHeightUpdate($scope.profile);
    }
    
    //Calculate user calories and BMI then store in db
    //Store user profile in session and head to nourishment state
    $scope.calculate = function ()
    {        
        $scope.profile.bmr = profileSvc.calcBmr($scope.profile);
        $scope.profile.bmi = profileSvc.calcBmi($scope.profile);
        $scope.profile.calories = profileSvc.calcCalories($scope.profile);
        $scope.profile.expccalories = profileSvc.calcExpcCalories($scope.profile);
        $scope.profile.date = profileSvc.calcDate();
        
        if(debug){
            console.log("Calculated profile essentials details as per ProfileCtrl.calculate()");
            console.log($scope.profile);
        }

        var promiseSvc = profileSvc.saveToDb($scope.profile, $scope.user);
        promiseSvc.then(
            function (payload) {
                $scope.profile.id = payload.id;
                if (debug) {
                    console.log("ProfileCtrl.$scope.calculate.promiseSvc : payload");
                    console.dir(payload);
                }

                profileSvc.saveToStore($scope.profile);
                $state.go("nourish");
            },
            function (errorPayload) {
                $log.error('failure loading profile service', errorPayload);
            }
        );
    }

    $scope.signout = function () {
        userSvc.clearStore();
        profileSvc.clearStore();
        $state.go('account');
    }
})
.controller("NourishmentCtrl", function (userSvc, nutritionSvc, profileSvc, sessionStoreSvc, mealTimeSvc, $scope, $state, $log) {
    //Get user and meal times
    $scope.user = userSvc.instance();
    $scope.mealTimes = mealTimeSvc.getMealTimes();


    var profile = profileSvc.instance($scope.user.id);
    //Go to profile state on a valid profile
    //if (!profileSvc.isValidProfile(profile)) {
    //    $state.go("profile");
    //}

    chartGraph();
   
    //$scope.selectChart7daysGraph = chart7daysGraph();

    $('input[type="radio"]').change(function () {
        var value = $(this).val();
        if (value == '7daychart') {
            chart7daysGraph();
        }
        else {
            chartGraph();
        }
    });

    //resize chart on screen size change.
    $(window).resize(function () {
        var value = $('input[type="radio"]:checked').val();
        if (value == '7daychart') {
            chart7daysGraph();
        }
        else {
            chartGraph();
        }
    });

    function chartGraph() {
        nutritionSvc.getCurrentHistory($scope.user.id, profileSvc.calcDate())
            .then(
                function (payload) {
                    if (debug) {
                        console.log("NourishmentCtrl.ChartGraph : payload");
                        console.dir(payload);
                    }

                    $scope.showGraph = false;

                    if (payload.length > 0) {
                        createChart(payload[0]);
                        $scope.showGraph = true;
                    }

                },
                function (errorPayload) {
                    $log.error('failure loading nutrition service', errorPayload);
                });
    }
    function createChart(history) {
        $("#chart").kendoChart({
            title: {
                text: "Today's Calories"
            },
            legend: {
                position: "bottom"
            },
            series: [{
                name: "Meal Calories", data: [history.Meal_Calorie]
            }, {
                name: "Profile Calories", data: [history.Calc_Calorie]
            }, {
                name: "BMR Calories", data: [history.Expc_Calorie]
            }
            ],
            categoryAxis: {
                categories: [history.Add_Date]
            },
            valueAxis: [{
                name: "Calories",
                labels: {
                    format: "{0} Cals"
                }
            }]
        })
    }

    function chart7daysGraph() {
        nutritionSvc.getRangeHistory($scope.user.id,  profileSvc.calc7lastDate(), profileSvc.calcDate())
            .then(
                function (payload) {
                    if (debug) {
                        console.log("NourishmentCtrl.chart7daysGraph : payload");
                        console.dir(payload);
                    }
                    if (payload.length > 0) {
                        createScatterLine(payload);
                    }
                },
                function (errorPayload) {
                    $log.error('failure loading nutrition service', errorPayload);
                });
    }
    function createScatterLine(historys)
    {
        var historyData = []
        angular.forEach(historys, function (history, key) {
            var find = '-';
            var regx = new RegExp(find, 'g');
            var historyDate = new Date(history.Add_Date.replace(regx, '/'));
            historyData.push({
                "date": historyDate,
                "calories": history.Meal_Calorie,
                "name": 'Meal Calories'
            });
            historyData.push({
                "date": historyDate,
                "calories": history.Calc_Calorie,
                "name": 'Profile Calories'
            })
            historyData.push({
                "date": historyDate,
                "calories": history.Expc_Calorie,
                "name": 'BMR Calories'
            })
        });

        $("#chart").kendoChart({
            title: {
                text: "Last 7 day Calories"
            },
            legend: {
                position: "right"
            },
            seriesDefaults: {
                type: "scatterLine",
                style: "smooth"
            },
            dataSource: {
                data: historyData,
                group: {
                    field: "name"
                },
                sort: {
                    field: "date",
                    dir: "asc"
                }
            },
            series: [{
                xField: "date",
                yField: "calories"
            }],
            yAxis: {
                labels: {
                    format: "{0} Cals",
                    skip: 1
                }
            },
            tooltip: {
                visible: true,
                template: "#= '<b>' + value.x + ' / ' + dataItem.name + ': ' + value.y + '</b>' #"
            }
        })
    }

    
        
    if (!sessionStoreSvc.isStored('foodGroup')) {
        var promiseFoodGrpsSvc = nutritionSvc.getFoodGroups();
        promiseFoodGrpsSvc.then(
            function (payload) {
                $scope.foodgroups = payload;
                sessionStoreSvc.saveItem('foodGroup', payload);
                if (debug) {
                    console.log("NourishmentCtrl.$scope.foodgroups.promiseFoodGrpsSvc : payload");
                    console.dir(payload);
                }
            },
            function (errorPayload) {
                $log.error('failure loading nutrition service', errorPayload);
            }
        );
    }
    else {
        $scope.foodgroups = sessionStoreSvc.getItem('foodGroup');
    }

    if (!sessionStoreSvc.isStored('foods')) {
        var promiseFoodsSvc = nutritionSvc.getFoodsByGroup(0);
        promiseFoodsSvc.then(
            function (payload) {
                $scope.foods = payload;
                sessionStoreSvc.saveItem('foods', payload);
                if (debug) {
                    console.log("NourishmentCtrl.$scope.foods.promiseFoodsSvc : payload");
                    console.dir(payload);
                }
            },
            function (errorPayload) {
                $log.error('failure loading nutrition service', errorPayload);
            }
        );
    }
    else {
        $scope.foods = sessionStoreSvc.getItem('foods');
    }

    $scope.acOptions = {
        dataTextField: "desc",
        dataValueField: "id",
        select: function (e) {
            var dataItem = this.dataItem(e.item.index());
            $scope.food = dataItem;
            var promiseSvc = nutritionSvc.getWeights(dataItem.id);           
            promiseSvc.then(
                function (payload) {
                    if (debug) {
                        console.log("NourishmentCtrl.$scope.acOptions.select : payload");
                        console.dir(payload);
                    }
                    $scope.weights = payload;
                    $scope.foodweight = $scope.weights[0];//Init select on the first item on array

                    $scope.foodamounts = nutritionSvc.getAmounts($scope.foodweight);
                    $scope.foodamount = $scope.foodamounts[0];//Init select on the first item on array
                },
                function (errorPayload) {
                    $log.error('failure loading nutrition service', errorPayload);
                }); 
        },
        change: function (e) {
            if (debug) { console.log('NourishmentCtrl.$scope.acOptions.change'); }
            //e.sender.value(dataItem.id);
        }
    }

    $scope.updateAmounts = function (foodweight) {
        $scope.foodamounts = nutritionSvc.getAmounts(foodweight);
        $scope.foodamount = $scope.foodamounts[0];//Init select on the first item on array
    }

    //Obtain calories for each meal time
    function calculateCalories() {        
        $scope.breakfastCals = nutritionSvc.getBreakfastCals($scope.nourishments);
        $scope.lunchCals = nutritionSvc.getLunchCals($scope.nourishments);
        $scope.dinnerCals = nutritionSvc.getDinnerCals($scope.nourishments);
        $scope.snackCals = nutritionSvc.getSnackCals($scope.nourishments);

        chartGraph();
    }

    
    $scope.nourishments = [];
    $scope.addToGrid = function () {        
        var date = profileSvc.calcDate();
        angular.forEach($scope.mealTimes, function (value, key) {
            if (value.selected) {
                var nourishment = {
                    id: 0,
                    user: $scope.user,
                    showAmount: false,
                    glyphiconState: 'glyphicon-edit',
                    editOrSaveState: 'Edit',
                    editOrSaveCssState: 'btn-info',
                    mealTime: value,
                    amount: $scope.foodamount,
                    weight: $scope.foodweight,
                    food: $scope.food[0],
                    add_date: date
                };
                nourishment.cals = nutritionSvc.getNourishmentCalsWithoutUnits(nourishment);
                $scope.nourishments.push(nourishment);
            }
        });

        if (debug) {
            console.log("NourishmentCtrl.$scope.addToGrid : nourishments");
            console.dir($scope.nourishments);
        }

        //Save to db...
        if ($scope.nourishments.length > 0) {
            nutritionSvc.saveNourishToDb($scope.nourishments).then(function (data) {
                angular.forEach(data, function (value, key) {
                    $scope.nourishments[key].id = value.data;
                });

                if (debug) {
                    console.log("NourishmentCtrl.$scope.addToGrid after Db save : nourishments");
                    console.dir($scope.nourishments);
                }

                //Load graph
                calculateCalories();
            });
        }
            
        //$scope.clearFoodDetail();
    }

    $scope.editBreakfastGripRow = function (nourishment) {
        editGripRow(nourishment);
    }
    $scope.editLunchGripRow = function (nourishment) {
        editGripRow(nourishment);
    }
    $scope.editDinnerGripRow = function (nourishment) {
        editGripRow(nourishment);
    }
    $scope.editSnackGripRow = function (nourishment) {
        editGripRow(nourishment);
    }

    function editGripRow(nourishment) {
        if(nourishment.editOrSaveState == 'Edit'){
            nourishment.showAmount = true;
            nourishment.editOrSaveState = 'Save';
        }
        else {
            nourishment.cals = nutritionSvc.getNourishmentCalsWithoutUnits(nourishment);
            nutritionSvc.saveNourishToDb(nourishment).then(function (data) {
                if (debug) {
                    console.log("NourishmentCtrl.$scope.editGripRow : nourishment");
                    console.dir(data);
                }
            });

            nourishment.showAmount = false;
            nourishment.editOrSaveState = 'Edit';            
        }

        calculateCalories();

        
    }

    $scope.deleteGripRow = function (nourishment) {
        nutritionSvc.deleteNourishInDb(nourishment).then(function (data) {
            if (debug) {
                console.log("NourishmentCtrl.$scope.deleteGripRow after Db save : data");
                console.dir(data);
            }

            var nourishment_obj = JSON.stringify(nourishment);
            angular.forEach($scope.nourishments, function (value, key) {
                var value_obj = JSON.stringify(value);
                if (value_obj === nourishment_obj) {
                    $scope.nourishments.splice(key, 1);
                }
            });

            calculateCalories();
        });
    }

    $scope.cancelGripRowEdit = function (nourishment) {
        nourishment.showAmount = false;
        nourishment.amount.value = nourishment.amount.previousValue;
    }

    $scope.clearFoodDetail = function () {
        if (angular.isDefined($scope.foodGroup)) { $scope.foodGroup = ''; }
        if (angular.isDefined($scope.food)) { $scope.food = ''; }
        if (angular.isDefined($scope.foodamounts)) { $scope.foodamounts = []; }
        if (angular.isDefined($scope.foodweight)) { $scope.foodweight = []; }
        if (angular.isDefined($scope.mealTimes)) { $scope.mealTimes = mealTimeSvc.getMealTimes(); }
    }

    $scope.getNourishmentCals = function (nourishments) { return nutritionSvc.getNourishmentCals(nourishments);}
})
.factory('numFilter', function(){
    return function(input){
        
        if(debug){
            console.log('numFilter ~~Number : ' + ~~Number(input));
        }
        
        if(!angular.isNumber(~~Number(input))){
            return 0;
        }
        
        return parseFloat(input);
    }
})
.factory('intFilter', function () {
    return function (input) {
        if (angular.isNumber(~~Number(input))) {
            return input % 1 === 0;
        }
        return false;
    }
})
.service('localStoreSvc', function(){
    return{
        getItem : function(name){
            if(!window.localStorage)
                throw "This browser does NOT support local storage.";
            
            return JSON.parse(window.localStorage.getItem(name));
        },
        saveItem: function(name, item){
            if(!window.localStorage)
                throw "This browser does NOT support local storage.";
            
            window.localStorage.setItem(name, JSON.stringify(item));
        },
        clearItem: function (name) {
            localStorage.removeItem(name);
        },
        isStored: function(name){
            if(window.localStorage.getItem(name))
			     return true;
		    else
			     return false;
        }
    }    
})
.service('sessionStoreSvc', function () {
    return {
        getItem: function (name) {
            if (!window.sessionStorage)
                throw "This browser does NOT support session storage.";

            return JSON.parse(window.sessionStorage.getItem(name));
        },
        saveItem: function (name, item) {
            if (!window.sessionStorage)
                throw "This browser does NOT support session storage.";

            window.sessionStorage.setItem(name, JSON.stringify(item));
        },
        isStored: function (name) {
            if (window.sessionStorage.getItem(name))
                return true;
            else
                return false;
        }
    }
})
.service("userSvc", function User(localStoreSvc, $http, $q) {
    var user = this;
    
    if(localStoreSvc.isStored('account')){
        if(debug){console.log("Retriving user details from store as per userSvc");}
        var storedUser = localStoreSvc.getItem('account');
        
        user.id = storedUser.id;
        user.firstName = storedUser.firstName;
        user.lastName = storedUser.lastName;
    }
    else{
        user.id = 0;
        user.firstName = "";
        user.lastName = "";
    }
    
    return{
        isValidUser : function(account){           
            var isValid = true;
            
            if(account.id == 0){
                isValid = false;
            }

            if(debug){
                console.log("Validated user details");
                console.dir(account);
                console.log("userSvc.isValidUser() :" + isValid);
            }           
        
            return isValid;
        },
        clear : function(){
            user.firstName = '';
            user.lastName = '';
        },
        instance : function()
        {
            return user;
        },
        saveToStore : function(newUser){
            localStoreSvc.saveItem('account', newUser);
        },
        clearStore: function () {
            localStoreSvc.clearItem('account');
        },
        saveToDb: function (user) {
            var deferred = $q.defer();
            $http.post('/api/Nutrition/saveuser', "{ FirstName : '" + user.firstName + "', LastName : '" + user.lastName + "' }")
                .success(function (data) {
                    deferred.resolve({
                        id: data
                    });
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });
            return deferred.promise;
        }
    }
})
.service("profileSvc", function Profile(userSvc, numFilter, localStoreSvc, $http, $q, $state, $log) {
    var profile = this;
    
    //Retrive profile from session storage.
    if(localStoreSvc.isStored('profile')){
        if(debug){console.log("Retriving profile details from store as per profileSvc");}
        var storedProfile = localStoreSvc.getItem('profile');
        
        profile.id = storedProfile.id;
        profile.sex = storedProfile.sex;
        profile.height = storedProfile.height;
        profile.heightUnit = storedProfile.heightUnit;
        profile.weight = storedProfile.weight;
        profile.weightUnit = storedProfile.weightUnit;
        profile.age = storedProfile.age;
        profile.activity = storedProfile.activity;
        profile.date = storedProfile.date; 
        profile.calories = storedProfile.calories;
        profile.expccalories = storedProfile.expccalories;
        profile.bmr = storedProfile.bmr;
        profile.bmi = storedProfile.bmi;
    }
    else{ 

        profile.id = 0;
        profile.sex = 'female';
        profile.height = '';
        profile.heightUnit = 'inches';
        profile.weight = '';
        profile.weightUnit = 'pounds';
        profile.age = '';
        profile.activity = '1.2';
        profile.date = '';
        profile.calories = 0;
        profile.expccalories = 0;
        profile.bmr = 0;
        profile.bmi = 0;
    }
    
    return {
        unitHeightUpdate : function(oldProfile){
            if(oldProfile.weightUnit == 'pounds'){ 
                oldProfile.heightUnit = 'inches'; 
                return oldProfile;
            }
            else if(oldProfile.weightUnit == 'kilograms'){ 
                oldProfile.heightUnit = 'centimeters'
                return oldProfile;
            }
        },
        unitWeightUpdate : function(oldProfile){
            if(oldProfile.heightUnit == 'inches'){ 
                oldProfile.weightUnit = 'pounds'; 
                return oldProfile;
            }
            else if (oldProfile.heightUnit == 'centimeters'){ 
                oldProfile.weightUnit = 'kilograms'
                return oldProfile;
            }
        },
        saveToStore : function(newProfile){
            localStoreSvc.saveItem('profile', newProfile);
        },
        clearStore: function () {
            localStoreSvc.clearItem('profile');
        },
        instance: function (userId) {
            if (profile.id == 0 && userId > 0) {
                var date = this.calcDate();
                this.getProfile(userId, date)
                    .then(function (payload) {
                        if (debug) {
                            console.log("profileSvc.instance : payload");
                            console.dir(payload);
                        }
                        if (payload.Id > 0) {
                            profile.id = payload.Id;
                            profile.sex = payload.Gender;
                            profile.height = payload.Height;
                            profile.heightUnit = payload.HeightUnit;
                            profile.weight = payload.Weight;
                            profile.weightUnit = payload.WeightUnit;
                            profile.age = payload.Age;
                            profile.activity = payload.Activity;
                            profile.date = payload.Add_Date;
                            profile.calories = payload.Calc_Calorie;
                            profile.expccalories = payload.Expc_Calorie;
                            profile.bmr = payload.BMR;
                            profile.bmi = payload.BMI;

                            localStoreSvc.saveItem('profile', profile);

                            $state.go("nourish");
                        }

                    },
                    function (errorPayload) {
                        $log.error('failure loading nutrition service', errorPayload);
                    });
            }
            return profile;
        },
        isValidProfile : function(profile){ 
            var isValid = true;
            var calDate = this.calcDate()
            if (profile.date !== calDate) {
                isValid = false;
            }
            
            if(debug){
                console.log("Validated profile details");
                console.dir(profile);
                console.log("profileSvc.isValidProfile() :" + isValid);
            }      
            
            return isValid;
        },
        calcDate : function(){
            var d = new Date();
            return d.getMonth() + 1 + '-' + d.getDate() + '-' + d.getFullYear();            
        },
        calc7lastDate : function(){
            var dateOffset = (24*60*60*1000) * 7; //7 days
            var d = new Date();
            d.setTime(d.getTime() - dateOffset);
            return d.getMonth() + 1 + '-' + d.getDate() + '-' + d.getFullYear();            
        },
        calcCalories : function (profile){
            return Math.round(this.calcBmr(profile) * numFilter(profile.activity));
        },
        calcExpcCalories: function (profile) {
            var calories = this.calcBmr(profile);
            return Math.round(calories);
        },
        calcBmi: function (profile) {
            var bmi = 0;
            var height = numFilter(profile.height);
            var weight = numFilter(profile.weight);
            switch (profile.heightUnit) {
                case 'inches':
                    bmi = (weight / (height * height)) * 703;
                    if (debug) { console.log('Calculated english BMI : ' + bmi); }
                    break;
                case 'centimeters':
                    height = (height / 100);// convert to meters
                    bmi = (weight / (height * height));
                    if (debug) { console.log('Calculated metric BMI : ' + bmi); }
                    break;
                default:
                    throw 'Height unit unknown';
            }

            return bmi.toFixed(2);
        },
        calcBmr : function (profile){
            var bmr = 0;
            switch(profile.sex){
                case 'female':
                    bmr = 655 + calcFemaleBmrWeight() + calcFemaleBmrHeight() - (4.7 * numFilter(profile.age));
                    break;
                case 'male':
                    bmr = 66 + calcMaleBmrWeight() + calcMaleBmrHeight()- (6.8 * numFilter(profile.age));
                    break;
                default:
                    throw 'User sex unknown';                   
            }
            return bmr.toFixed(2);
            
            function calcFemaleBmrHeight()
            {
                var height = 0;

                switch(profile.heightUnit){
                    case 'inches':
                        height = 4.7 * numFilter(profile.height);
                        if(debug){console.log('Calculated female BMR height : ' + height + ' inches')}
                        break;
                    case 'centimeters':
                        height = 1.8 * numFilter(profile.height);
                        if(debug){console.log('Calculated female BMR height : ' + height + ' centimeters')}
                        break;
                    default:
                        throw 'Female height unit unknown';                
                }

                return height;
            }
            
            function calcMaleBmrHeight()
            {
                var height = 0;

                switch(profile.heightUnit){
                    case 'inches':
                        height = 12.7 * numFilter(profile.height);
                        if(debug){console.log('Calculated male BMR height : ' + height + ' inches')}
                        break;
                    case 'centimeters':
                        height = 5 * numFilter(profile.height);
                        if(debug){console.log('Calculated male BMR height : ' + height + ' centimeters')}
                        break;
                    default:
                        throw 'Male height unit unknown';                
                }

                return height;
            }
            
            function calcFemaleBmrWeight()
            {
                var weight = 0;

                switch(profile.weightUnit){
                    case 'pounds':
                        weight = 4.35 * numFilter(profile.weight);
                        if(debug){console.log('Calculated female BMR weight : ' + weight + ' pounds')}
                        break;
                    case 'kilograms':
                        weight = 9.6 * numFilter(profile.weight);
                        if(debug){console.log('Calculated female BMR weight : ' + weight + ' kilograms')}
                        break;
                    default:
                        throw 'Female weight units unknown';                
                }

                return weight;
            }

            function calcMaleBmrWeight()
            {
                var weight = 0;

                switch(profile.weightUnit){
                    case 'pounds':
                        weight = 6.23 * numFilter(profile.weight);
                        if(debug){console.log('Calculated male BMR weight : ' + weight + ' pounds')}
                        break;
                    case 'kilograms':
                        weight = 13.7 * numFilter(profile.weight);
                        if(debug){console.log('Calculated male BMR weight : ' + weight + ' kilograms')}
                        break;
                    default:
                        throw 'Male height units unknown';                
                }

                return weight;
            }        
        },
        saveToDb: function (profile, user) {
            var deferred = $q.defer();
            $http.post('/api/Nutrition/saveprofile',
                "{ Id : " + profile.id +
                ",USER_No : " + user.id +
                ", Gender : '" + profile.sex +
                "', Height : " + profile.height +
                ", HeightUnit : '" + profile.heightUnit +
                "', Weight : " + profile.weight +
                ", WeightUnit : '" + profile.weightUnit +
                "', Age : " + profile.age +
                ", Calc_Calorie : " + profile.calories +
                ", Expc_Calorie : " + profile.expccalories +
                ", BMR : " + profile.bmr +
                ", BMI : " + profile.bmi +
                ", Activity : " + profile.activity +
                ", Add_Date : '" + profile.date + "' }")
                .success(function (data) {
                    deferred.resolve({
                        id: data
                    });
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });
            return deferred.promise;
        },
        getProfile: function (userId, date) {
            var deferred = $q.defer();
            $http.get('/api/Nutrition/profile?userId=' + userId + '&date=' + date)
                .success(function (data) {
                    deferred.resolve(data);
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });
            return deferred.promise;
        }
    }
    
})
.service('nutritionSvc', function (intFilter, $http, $q, $location, $log) {
    function getCals(mealTime, nourishments) {
        var cals = 0;
        angular.forEach(nourishments, function (nourishment, key) {
            if (nourishment.mealTime.name == mealTime) {
                cals += (nourishment.amount.value * nourishment.food.p_factor) +
                    (nourishment.amount.value * nourishment.food.n_factor) +
                    (nourishment.amount.value * nourishment.food.f_factor);
            }
        });

        if (cals > 0) {
            cals = +cals.toFixed(2) + ' Calories';//The plus sign drops any "extra" zeros at the end
        }
        else {
            cals = '';
        }

        return cals
    }
    function getFoodCals(nourishment) {
        var cals = 0;
        cals += (nourishment.amount.value * nourishment.food.p_factor) +
            (nourishment.amount.value * nourishment.food.n_factor) +
            (nourishment.amount.value * nourishment.food.f_factor);

        if (cals > 0) {
            cals = +cals.toFixed(2) + ' Cals';
        }
        else {
            cals = '';
        }

        return cals
    }
    return {
        getNourishmentCals: function (nourishment) { return getFoodCals(nourishment); },
        getNourishmentCalsWithoutUnits: function (nourishment) { return getFoodCals(nourishment).replace(' Cals', ''); },
        getBreakfastCals: function (nourishments) { return getCals('Breakfast', nourishments); },
        getLunchCals: function (nourishments) { return getCals('Lunch', nourishments); },
        getDinnerCals: function (nourishments) { return getCals('Dinner', nourishments); },
        getSnackCals: function (nourishments) { return getCals('Snack', nourishments); },
        getAmounts: function (foodweight) {
            var foodamounts = [];
            if (foodweight == undefined || foodweight.amount == 0) {
                foodamounts.push({ 'desc': 'No Food amount', 'value': 0, 'previousValue': 0 });
                return foodamounts
            }

            if (!intFilter(foodweight.amount)) {
                for (index = 8; index > 0; index--) {
                    var frac = new Fraction(foodweight.amount, index);
                    var value = frac.numerator / frac.denominator;
                    value = +value.toFixed(2);
                    foodamounts.push({ 'desc': frac.toString(), 'value': value, 'previousValue': value });
                }
                if (debug) {
                    console.log("nutritionSvc.getAmounts : foodamounts");
                    console.dir(foodamounts);
                }
            }
            else {
                for (index = 1; index < 9; index++) {
                    var value = +foodweight.amount.toFixed(2);
                    foodamounts.push({ 'desc': (index * value), 'value': (index * value), 'previousValue': (index * value) });
                }
                if (debug) {
                    console.log("nutritionSvc.getAmounts : foodamounts");
                    console.dir(foodamounts);
                }
            }

            return foodamounts;
        },
        getWeights: function(id){
            var deferred = $q.defer();
            $http.get('/api/Nutrition/weights?foodId=' + id)
                .success(function (data) {
                    var weights = [];
                    if (data.length == 0) {
                        weights.push({ seq: 0, amount: 0, desc: 'No Weight amount', weight: 0 });
                    }
                    else {
                        $(data).each(function () {
                            weights.push({ seq: this.Seq, amount: this.Amount, desc: this.Msre_Desc, weight: this.Gm_Wgt });
                        });
                    }
                    
                    
                    deferred.resolve(weights);
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });
            return deferred.promise;
        },
        getFoodGroups: function(){
            var deferred = $q.defer();
            $http.get('/api/Nutrition/foodgroup')
                .success(function (data) {
                    var foodGroups = [];
                    $(data).each(function(){
                        foodGroups.push({ id: this.Id, desc : this.FdGrp_Desc });
                    });
                    deferred.resolve(foodGroups);
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });
            return deferred.promise;
        },
        getCurrentHistory: function(userId, date){
            var deferred = $q.defer();
            $http.get('/api/Nutrition/history?userId=' + userId + '&date=' + date)
                .success(function (data) {
                    deferred.resolve(data);
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });
            return deferred.promise;
        },
        getRangeHistory: function (userId, startdate, enddate) {
            var deferred = $q.defer();
            $http.get('/api/Nutrition/history?userId=' + userId + '&startdate=' + startdate + '&enddate=' + enddate)
                .success(function (data) {
                    deferred.resolve(data);
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });
            return deferred.promise;
        },
        getFoodsByGroup: function (id) {
            var deferred = $q.defer();
            $http.get('/api/Nutrition/foodsbygroup?id=' + id)
                .success(function (data) {
                    var foods = [];
                    $(data).each(function () {
                        foods.push({ id: this.Id, desc: this.Long_Desc, n_factor : this.N_Factor, p_factor : this.Pro_Factor, f_factor : this.Fat_Factor });
                    });
                    deferred.resolve(foods);
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });
            return deferred.promise;
        },
        saveNourishToDb: function (nourishments) {
            var deferreds = [];
            if (nourishments.length == undefined) {
                deferreds.push(
                $http.post('/api/Nutrition/savenourishment',
                    "{ Id : " + nourishments.id +
                    ",USER_No : " + nourishments.user.id +
                    ", NDB_No : " + nourishments.food.id +
                    ", Seq : " + nourishments.weight.seq +
                    ", Food_Amount : " + nourishments.amount.value +
                    ", Meal_Calorie : " + nourishments.cals +
                    ", Meal_Time : '" + nourishments.mealTime.name +
                    "', Add_Date : '" + nourishments.add_date + "' }")
                );
            }
            else {
                angular.forEach(nourishments, function (nourishment, key) {
                    deferreds.push(
                    $http.post('/api/Nutrition/savenourishment',
                        "{ Id : " + nourishment.id +
                        ",USER_No : " + nourishment.user.id +
                        ", NDB_No : " + nourishment.food.id +
                        ", Seq : " + nourishment.weight.seq +
                        ", Food_Amount : " + nourishment.amount.value +
                        ", Meal_Calorie : " + nourishment.cals +
                        ", Meal_Time : '" + nourishment.mealTime.name +
                        "', Add_Date : '" + nourishment.add_date + "' }")
                    );
                });
            }
            //http://plnkr.co/edit/KYeTWUyxJR4mlU77svw9?p=preview
            return $q.all(deferreds);
        },
        deleteNourishInDb: function (nourishment) {
            var deferreds = [];
            deferreds.push(
                $http.post('/api/Nutrition/deletenourishment',
                      "{ Id : " + nourishment.id +
                    ",USER_No : " + nourishment.user.id +
                    ", NDB_No : " + nourishment.food.id +
                    ", Seq : " + nourishment.weight.seq +
                    ", Food_Amount : " + nourishment.amount.value +
                    ", Meal_Calorie : " + nourishment.cals +
                    ", Meal_Time : '" + nourishment.mealTime.name +
                    "', Add_Date : '" + nourishment.add_date + "' }")
            );
            return $q.all(deferreds);
        },
    }
})
.service('mealTimeSvc', function () {
    return {
        getMealTimes: function () {
            var mealTimes = [];
            var date = new Date();
            var hour = date.getHours();
            if (hour >= 6 && hour <= 9) {
                mealTimes.push({ name: 'Breakfast', selected: true });
                mealTimes.push({ name: 'Lunch', selected: false });
                mealTimes.push({ name: 'Dinner', selected: false });
                mealTimes.push({ name: 'Snack', selected: false });
            }
            else if (hour >= 12 && hour <= 13) {
                mealTimes.push({ name: 'Breakfast', selected: false });
                mealTimes.push({ name: 'Lunch', selected: true });
                mealTimes.push({ name: 'Dinner', selected: false });
                mealTimes.push({ name: 'Snack', selected: false });
            }
            else if (hour >= 17 && hour <= 20) {
                mealTimes.push({ name: 'Breakfast', selected: false });
                mealTimes.push({ name: 'Lunch', selected: false });
                mealTimes.push({ name: 'Dinner', selected: true });
                mealTimes.push({ name: 'Snack', selected: false });
            }
            else {
                mealTimes.push({ name: 'Breakfast', selected: false });
                mealTimes.push({ name: 'Lunch', selected: false });
                mealTimes.push({ name: 'Dinner', selected: false });
                mealTimes.push({ name: 'Snack', selected: true });
            }

            return mealTimes;
        }
    }
})
.factory('$exceptionHandler', function () {
    return function (exception, cause) {
        exception.message += ' (caused by "' + cause + '")';
        throw exception;
    };
});