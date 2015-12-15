using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;

namespace Repositories
{
    public class RepositoriesInstaller: IWindsorInstaller
    {
        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
            container.Register(Component
                .For(typeof(IRepository<>))
                .ImplementedBy(typeof(Repository<>))
                .LifestylePerWebRequest());
        }
    }
}
