using Repositories;
using Repositories.Data;
using System;
using System.Collections.Generic;
using System.Web.Http;
using System.Linq;
using System.Net.Http;
using System.Net;
using System.Globalization;

namespace Controllers
{
    public class NutritionController: ApiController
    {
        protected readonly IRepository<FoodGroup> _FoodGroupRepo;
        protected readonly IRepository<Food> _FoodRepo;
        protected readonly IRepository<Weight> _WeightRepo;
        protected readonly IRepository<User> _UserRepo;
        protected readonly IRepository<Profile> _ProfileRepo;
        protected readonly IRepository<History> _HistoryRepo;
        public NutritionController(IRepository<FoodGroup> foodGroupRepo, 
            IRepository<Food> foodRepo,
            IRepository<Weight> weightRepo,
            IRepository<User> userRepo,
            IRepository<Profile> profileRepo,
            IRepository<History> historyRepo)
        {
            if (foodGroupRepo == null)
                throw new ArgumentNullException("foodGroupRepo");
            if (foodRepo == null)
                throw new ArgumentNullException("foodRepo");
            if (weightRepo == null)
                throw new ArgumentNullException("weightRepo");
            if (userRepo == null)
                throw new ArgumentNullException("userRepo");
            if (profileRepo == null)
                throw new ArgumentNullException("profileRepo");
            if (historyRepo == null)
                throw new ArgumentNullException("historyRepo");

            _FoodGroupRepo = foodGroupRepo;
            _FoodRepo = foodRepo;
            _WeightRepo = weightRepo;
            _UserRepo = userRepo;
            _ProfileRepo = profileRepo;
            _HistoryRepo = historyRepo;
        }

        [ActionName("foodgroup")]
        public IList<FoodGroup> GetFoodGroups()
        {
            return _FoodGroupRepo.FindAll();
        }

        [ActionName("foodsbygroup")]
        public IList<Food> GetFoodsByGroup(int? id)
        {
            if (id == null || id == 0)
                return _FoodRepo.FindAll();

            return _FoodRepo.Find(f => f.FdGrp_Cd == id);
        }

        [ActionName("foods")]
        public IList<Food> GetFoods(string value)
        {
            return _FoodRepo.Find(f => f.Long_Desc.StartsWith(value), f => f.Long_Desc, false);
        }

        [ActionName("weights")]
        public IList<Weight> GetWeightsByFood(int foodId)
        {
            return _WeightRepo.Find(w => w.Id == foodId);
        }
        public void GetMeals(int id)
        {

        }    
        public void GetMeals(DateTime startDate = default(DateTime), DateTime endDate = default(DateTime))
        {

        }

        [ActionName("history")]
        public HttpResponseMessage GetHistory(int userId, string date)
        {
            var history = _HistoryRepo.Find(h => h.USER_No == userId && h.Add_Date == date);
            if (history.Count > 0)
            {
                var profiles = _ProfileRepo.Find(p => p.USER_No == userId && p.Add_Date == date);

                //Aggregate user nourishments calories by date
                var historyGrp = (from hsty in history
                                  join profile in profiles on hsty.USER_No equals profile.USER_No
                                  group hsty by hsty.Add_Date into g
                                  select new
                                  {
                                      Meal_Calorie = (int?)g.Sum(h => h.Meal_Calorie) ?? 0,
                                      USER_No = g.FirstOrDefault().USER_No,
                                      Add_Date = g.FirstOrDefault().Add_Date
                                  }).ToList();

                var results = (from hstyGrp in historyGrp
                              join profile in profiles on hstyGrp.USER_No equals profile.USER_No
                              select new
                              {
                                  Unit = "Calories",
                                  Add_Date = hstyGrp.Add_Date,
                                  Meal_Calorie = hstyGrp.Meal_Calorie,
                                  Calc_Calorie = profile.Calc_Calorie,
                                  Expc_Calorie = profile.Expc_Calorie                                  
                              }).ToList();

                return Request.CreateResponse(HttpStatusCode.Accepted, results);
            }

            return Request.CreateResponse(HttpStatusCode.Accepted, 0);
        }

        [ActionName("history")]
        public HttpResponseMessage GetHistory(int userId, string startdate, string enddate)
        {
            DateTime dateTimeStart = Convert.ToDateTime(startdate);
            DateTime dateTimeEnd = Convert.ToDateTime(enddate);

            var history = _HistoryRepo.Find(h => h.USER_No == userId && Convert.ToDateTime(h.Add_Date) >= dateTimeStart &&
                 Convert.ToDateTime(h.Add_Date) <= dateTimeEnd);
            if (history.Count > 0)
            {
                var profiles = _ProfileRepo.Find(p => p.USER_No == userId);

                //Aggregate user nourishments calories by date
                var historyGrp = (from hsty in history
                                  join profile in profiles on hsty.USER_No equals profile.USER_No
                                  where profile.Add_Date == hsty.Add_Date
                                  group hsty by hsty.Add_Date into g
                                  select new
                                  {
                                      Meal_Calorie = (int?)g.Sum(h => h.Meal_Calorie) ?? 0,
                                      USER_No = g.FirstOrDefault().USER_No,
                                      Add_Date = g.FirstOrDefault().Add_Date
                                  }).ToList();

                var results = (from hstyGrp in historyGrp
                               join profile in profiles on hstyGrp.USER_No equals profile.USER_No
                               where profile.Add_Date == hstyGrp.Add_Date
                               select new
                               {
                                   Unit = "Calories",
                                   Add_Date = hstyGrp.Add_Date,
                                   Meal_Calorie = hstyGrp.Meal_Calorie,
                                   Calc_Calorie = profile.Calc_Calorie,
                                   Expc_Calorie = profile.Expc_Calorie
                               }).ToList();

                return Request.CreateResponse(HttpStatusCode.Accepted, results);
            }

            return Request.CreateResponse(HttpStatusCode.BadRequest, "Could not  retrive nourishment/s history");
        }

        [HttpPost, ActionName("savenourishment")]
        public HttpResponseMessage SaveNourishment([FromBody] History history)
        {
            if (history == null)
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Could not retrieve from body");

            if (history.Id > 0)
            {
                var hsty = _HistoryRepo.Find((int)history.Id);
                hsty.Food_Amount = history.Food_Amount;
                hsty.Meal_Calorie = history.Meal_Calorie;
                _HistoryRepo.Save(hsty);
            }
            else
            {
                history = _HistoryRepo.Save(history);
            }            

            return Request.CreateResponse(HttpStatusCode.Accepted, history.Id);
        }

        [HttpPost, ActionName("deletenourishment")]
        public HttpResponseMessage DeleteNourishment([FromBody] History history)
        {
            if (history == null)
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Could not retrieve from body");
            try
            {
                var hsty = _HistoryRepo.Find((int)history.Id);
                _HistoryRepo.Delete(hsty);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, ex);
            }

            return Request.CreateResponse(HttpStatusCode.Accepted);
        }

        [HttpPost, ActionName("saveuser")]
        public HttpResponseMessage SaveOrGetUser([FromBody] User user)
        {
            if (user == null)
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Could not retrieve from body");
            if (string.IsNullOrWhiteSpace(user.FirstName))
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Could not retrieve user's first name");
            if (string.IsNullOrWhiteSpace(user.LastName))
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Could not retrieve user's last name");

            var retrivedUser = _UserRepo.Find(s => s.FirstName == user.FirstName && s.LastName == user.LastName).SingleOrDefault();

            if (retrivedUser == null)
                user = _UserRepo.Save(user);
            else
                user = retrivedUser;

            return Request.CreateResponse(HttpStatusCode.Accepted, user.Id);
        }

        [ActionName("profile")]
        public HttpResponseMessage GetProfile(int userId, string date)
        {

            var retrivedProfile = _ProfileRepo.Find(p => p.USER_No == userId && p.Add_Date == date).SingleOrDefault();

            if (retrivedProfile == null)
                return Request.CreateResponse(HttpStatusCode.Accepted, 0);

            return Request.CreateResponse(HttpStatusCode.Accepted, retrivedProfile);
        }

        [HttpPost, ActionName("saveprofile")]
        public HttpResponseMessage SaveOrGetProfile([FromBody] Profile profile)
        {
            if (profile == null)
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Could not retrieve from body");

            var retrivedProfile = _ProfileRepo.Find(p => p.Id == profile.Id).SingleOrDefault();

            //insert
            if (retrivedProfile == null)
                profile = _ProfileRepo.Save(profile);
            //update
            else
            {
                retrivedProfile.Activity = profile.Activity;
                retrivedProfile.Add_Date = profile.Add_Date;
                retrivedProfile.Age = profile.Age;
                retrivedProfile.BMI = profile.BMI;
                retrivedProfile.BMR = profile.BMR;
                retrivedProfile.Calc_Calorie = profile.Calc_Calorie;
                retrivedProfile.Expc_Calorie = profile.Expc_Calorie;
                retrivedProfile.Gender = profile.Gender;
                retrivedProfile.Height = profile.Height;
                retrivedProfile.HeightUnit = profile.HeightUnit;
                retrivedProfile.Weight = profile.Weight;
                retrivedProfile.WeightUnit = profile.WeightUnit;

                profile = _ProfileRepo.Save(retrivedProfile);
            }

            return Request.CreateResponse(HttpStatusCode.Accepted, profile.Id);
        }
    }
}
