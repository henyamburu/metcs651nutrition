using Repositories.Data;
using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Repositories
{
    public class Repository<T>: IRepository<T> where T : class, IEntity
    {
        protected DbClassesDataContext _DataContext;

        private Table<T> GetTable
        {
            get { return _DataContext.GetTable<T>(); }
        }
        public Repository()
        {
            _DataContext = new DbClassesDataContext();
        }
        public T Find(int id)
        {
            return GetTable.Cast<T>().SingleOrDefault(e => e.Id == id);
        }
        public IList<T> Find(Expression<Func<T, bool>> exp)
        {
            return GetTable.Cast<T>().Where(exp).ToList();
        }
        public IList<T> Find(Expression<Func<T, bool>> exp, Expression<Func<T, IComparable>> order, bool desc)
        {
            if (desc)
                return GetTable.Cast<T>().Where(exp).OrderByDescending(order).ToList();
            else
                return GetTable.Cast<T>().Where(exp).OrderBy(order).ToList();
        }
        public IList<T> FindAll()
        {
            return GetTable.Cast<T>().ToList();
        }
        public T Save(T entity)
        {
            try
            {
                if (entity.Id == 0)
                    _DataContext.GetTable<T>().InsertOnSubmit((T)entity);

                _DataContext.SubmitChanges();
            }
            catch(Exception ex)
            {
                throw ex;
            }

            return entity;
        }

        public void Delete(T entity)
        {
            try
            {
                GetTable.DeleteOnSubmit((T)entity);
                _DataContext.SubmitChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public T CreateInstance()
        {
            return Activator.CreateInstance<T>();
        }
    }
}
