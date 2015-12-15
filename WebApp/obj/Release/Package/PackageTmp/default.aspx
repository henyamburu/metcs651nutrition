<!DOCTYPE html>
<html ng-app="app.nutrition">
<head runat="server">
    <meta charset="utf-8">
    <title>Nutrition: Tracker</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="assets/kendoui.2015.3.1111/styles/kendo.common.min.css" media="screen">
    <link rel="stylesheet" href="assets/kendoui.2015.3.1111/styles/kendo.default.min.css" media="screen">
    <link rel="stylesheet" href="assets/css/bootstrap.css" media="screen">
    <link rel="stylesheet" href="assets/css/bootswatch.min.css">
    <link rel="stylesheet" href="assets/css/styles.css" media="screen">
    <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>    
    <script src="http://cdn.kendostatic.com/2014.3.1411/js/angular.min.js"></script>
    <script src="http://cdn.kendostatic.com/2014.3.1411/js/kendo.all.min.js"></script>    
    <script src="assets/js/angular/angular-ui-router.0.2.15.min.js" type="text/javascript"></script>
    <script src="assets/js/bootstrap/3.3.5/bootstrap.min.js"></script>
    <script src="assets/js/bootstrap/validator.0.9.0/validator.min.js"></script>
    <script src="assets/js/bootswatch.js"></script>
    <script src="assets/js/fraction.js"></script>
    <script src="assets/js/script.js"></script>
    <script src="assets/js/app.js"></script>
    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->
</head>
  <body>
    <div class="navbar navbar-default navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <a href="/" class="navbar-brand">Nutrition</a>
          <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
        </div>  
        <ui-view></ui-view>
      </div>
    </div
    <div class="container">
    <div class="col-lg-10 col-lg-offset-1">
      <div class="bs-docs-section" style="margin-top:0">
          <ui-view name="ui-section-content"></ui-view>
      </div>
    </div>  
    </div>    
  </body>
</html>

