using Controllers.Constriants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Http;
using System.Web.Routing;

namespace Controllers.App_Start
{
    public class RouteConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
                name: "NutritionFoodGroup",
                routeTemplate: "api/{controller}/{action}"
            );
            config.Routes.MapHttpRoute(                
                name: "NutritionWeightsByFood",
                routeTemplate: "api/{controller}/{action}/{foodId}",
                defaults: new { foodId = System.Web.Http.RouteParameter.Optional },
                constraints: new RegExConstraint(@"\d+")
            );
            config.Routes.MapHttpRoute(
               name: "NutritionSaveOrGetUser",
               routeTemplate: "api/{controller}/{action}/{user}"
           );
           config.Routes.MapHttpRoute(
               name: "NutritionSaveNourishment",
               routeTemplate: "api/{controller}/{action}/{history}"
           );
           config.Routes.MapHttpRoute(
                name: "NutritionOrProfile",
                routeTemplate: "api/{controller}/{action}/{userId}/{date}",
                defaults: new { userId = System.Web.Http.RouteParameter.Optional, date = System.Web.Http.RouteParameter.Optional }
            );
            config.Routes.MapHttpRoute(
                name: "NutritionHistoryRange",
                routeTemplate: "api/{controller}/{action}/{userId}/{startdate}/{enddate}",
                defaults: new {
                    userId = System.Web.Http.RouteParameter.Optional,
                    startdate = System.Web.Http.RouteParameter.Optional,
                    enddate = System.Web.Http.RouteParameter.Optional
                }
            );
            //config.Routes.MapHttpRoute(
            //    name: "MediaCenterTopicAndTypeApi",
            //    routeTemplate: "api/{controller}/{topicId}/{typeId}/{pageNum}/{action}",
            //    defaults: new { 
            //        topicId = System.Web.Http.RouteParameter.Optional, 
            //        typeId = System.Web.Http.RouteParameter.Optional,
            //        pageNum = System.Web.Http.RouteParameter.Optional
            //    },
            //    constraints: new RegExConstraint(@"\d+")
            //);
            //config.Routes.MapHttpRoute(
            //    name: "MediaCenterTopicAndTypeApi",
            //    routeTemplate: "api/{controller}/{topicId}/{typeId}/{action}",
            //    defaults: new { topicId = System.Web.Http.RouteParameter.Optional, typeId = System.Web.Http.RouteParameter.Optional },
            //    constraints: new RegExConstraint(@"\d+")
            //);

            //config.Routes.MapHttpRoute(
            //    name: "MediaCenterTopicOrTypeApi",
            //    routeTemplate: "api/{controller}/{id}/{action}",
            //    defaults: new { id = System.Web.Http.RouteParameter.Optional },
            //    constraints: new RegExConstraint(@"\d+")
            //);

            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{action}"
            //);

            //config.Routes.MapHttpRoute(
            //    name: "AllGames",
            //    routeTemplate: "api/Game/{playerId}",
            //    defaults: new
            //    {
            //        controller = "Game",
            //        action = "GetAllGames",
            //        playerId = RouteParameter.Optional
            //    }
            //);

            //config.Routes.MapHttpRoute(
            //    name: "MediaCenterTopicApi",
            //    routeTemplate: "api/{controller}/{topicId}",
            //    defaults: new { topicId = System.Web.Http.RouteParameter.Optional },
            //    constraints: new OptionalRegExConstraint (@"\d+")
            //);
        }

        //public static void Register()
        //{
        //    RouteTable.Routes.MapHttpRoute(
        //        name: "DefaultApi",
        //        routeTemplate: "api/{controller}/{id}/{action}",
        //        defaults: new { id = System.Web.Http.RouteParameter.Optional }
        //    );
        //}
    }
}

