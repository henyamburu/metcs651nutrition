using Castle.Windsor;
using Controllers.CastleWindsor;
using Repositories;
using System;
using System.Web.Http;

namespace WebApp
{
    public class Global : System.Web.HttpApplication
    {
        static WindsorContainer _container = new WindsorContainer();
        protected void Application_Start(object sender, EventArgs e)
        {
            Controllers.BootStrapper.Init(GlobalConfiguration.Configuration);

            //Wire-up dependencies
            _container.Install(new RepositoriesInstaller(),
                new WebApiInstaller());
            GlobalConfiguration.Configuration.DependencyResolver = new DependencyResolver(_container.Kernel);
        }

        protected void Application_End(object sender, EventArgs e)
        {
            _container.Dispose();
        }
    }
}