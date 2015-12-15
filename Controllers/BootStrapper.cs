using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Controllers.App_Start;

namespace Controllers
{
    public class BootStrapper
    {
        public static void Init(HttpConfiguration config)
        {
            RouteConfig.Register(config);
            WebApiConfig.Register(config);
        }
    }
}
