import numpy as np
import ast
from celery import Celery, shared_task
from lawn.models import Lawn, UserQuestionOption, SelectedQuestionOption, LawnInfo, LawnImage
from faq.models import Questionnaire, Option
from ..models import User, Profile
from lawn_engine.models import LawnEngine, DateAndPouches
from lawn_engine.api.lawnengine_function import get_precip, get_weather, get_soil_and_signup, data_saving
from lawn_engine.api.lawn_engine.engine.main import Manager
from lawn_engine.api.lawn_engine.tests.test_main import get_prior_apps
from analytic.models import SoilTest
from weatherops.api.weather_functions import avg_temp_yearly, avg_temp, rainfall, rainfall_yearly, geo_coodinate_api
from django.utils import timezone
import json
from decimal import Decimal
from datetime import datetime


def default(obj):
    if isinstance(obj, Decimal) or isinstance(obj, datetime):
        return str(obj)
    raise TypeError("Object of type '%s' is not JSON serializable" % type(obj).__name__)


app = Celery()


@app.task
def combine_user_list():

    """A celery task to automate user list creation in background"""
    data = User.objects.all().filter(active=True)
    response = []
    for x in data:
        user = dict()
        user['id'] = x.id
        user['email'] = x.email
        user['admin'] = x.admin
        user['created_at'] = x.created_at
        user['updated_at'] = x.updated_at
        user['active'] = x.active
        user['mailchimp_id'] = x.mailchimp_id
        user['lawn_image'] = ""
        user['user_Profile'] = []
        user['user_Lawn'] = []
        user['user_UQO'] = []
        for user_profile in Profile.objects.all().filter(user=x.id):
            profile = dict()
            profile['first_name'] = user_profile.first_name
            profile['last_name'] = user_profile.last_name
            profile['phone'] = user_profile.phone
            profile['address'] = user_profile.address
            user['user_Profile'].append(profile)
        for user_lawn in Lawn.objects.all().filter(user=x.id):
            lawn = dict()
            lawn['id'] = user_lawn.id
            lawn['address'] = user_lawn.address
            lawn['manual_review'] = user_lawn.manual_review
            lawn['is_right_review'] = user_lawn.is_right_review
            lawn['is_wrong_review'] = user_lawn.is_wrong_review
            lawn['tennis_court_size'] = user_lawn.tennis_court_size
            lawn['zestimate'] = user_lawn.zestimate
            lawn['lat'] = user_lawn.lat
            lawn['lng'] = user_lawn.lng
            lawn['street_number'] = user_lawn.street_number
            lawn['route'] = user_lawn.route
            lawn['locality'] = user_lawn.locality
            lawn['administrative_area_level_1'] = user_lawn.administrative_area_level_1
            lawn['country'] = user_lawn.country
            lawn['postal_code'] = user_lawn.postal_code
            lawn['estimated_lawn_size'] = ""
            lawn['lawn_info'] = []
            user['user_Lawn'].append(lawn)
            for lawnimage in LawnImage.objects.all().filter(lawn_id=lawn['id']):
                user['lawn_image'] = str("/media/") + str(lawnimage.image)
            for lawninfo in LawnInfo.objects.all().filter(lawn=user_lawn.id):
                lawn_info = dict()
                lawn_info['grass_zone'] = lawninfo.grass_zone
                lawn_info['observed_grass_type'] = lawninfo.observed_grass_type
                lawn_info['initial_lawn_area'] = lawninfo.initial_lawn_area
                lawn_info['initial_lawn_size'] = lawninfo.initial_lawn_size
                lawn_info['initial_lot_size'] = lawninfo.initial_lot_size
                lawn_info['observed_lawn_size'] = lawninfo.observed_lawn_size
                lawn_info['observed_shade'] = lawninfo.observed_shade
                lawn_info['observed_shaded_lawn'] = lawninfo.observed_shaded_lawn
                lawn_info['observed_visibility'] = lawninfo.observed_visibility
                lawn['lawn_info'].append(lawn_info)
                lawn['estimated_lawn_size'] = lawninfo.initial_lawn_size
            # i=int(plan_PPO.subscription)
        for user_UQO in UserQuestionOption.objects.all().filter(user=x.id):
            UQO = dict()
            UQO['id'] = user_UQO.id
            UQO['lawn'] = user_UQO.lawn.id
            UQO['user'] = user_UQO.user.id
            user['user_UQO'].append(UQO)

            UQO['user_SQO'] = []
            for user_SQO in SelectedQuestionOption.objects.all().filter(user_question_option=user_UQO.id):
                SQO = dict()
                question = Questionnaire.objects.all().filter(id=user_SQO.question.id)
                option = Option.objects.all().filter(id=user_SQO.option.id)
                for que in question:
                    SQO['Question'] = user_SQO.question.id
                    SQO["question_title"] = que.question
                for opt in option:
                    SQO["option_title"] = opt.option
                    SQO['Option'] = user_SQO.option.id
                UQO['user_SQO'].append(SQO)

        response.append(user)

    with open('data.json', 'w') as outfile:
        json.dump(response, outfile, default=default)
    return "done"


def user_list():
    with open('data.json') as f:
        data = json.load(f)
    return data


@app.task
def do_lawn_engine_computation(lawn_id):
    """
    A copy for lawn_engine's task, (This is done because of celery import error)
    :param lawn_id:
    :return: async result
    """

    start_date = timezone.now()
    try:
        first_run_flag = LawnEngine.objects.filter(lawn_id=lawn_id)[0].run_type
    except Exception as e:
        print(e)
        first_run_flag = False
    if first_run_flag is False:
        try:
            user_input = ['pet', 'new_lawn']  # change later
            soil_and_signup = get_soil_and_signup(lawn_id)
            lat = str(soil_and_signup[3])
            lng = str(soil_and_signup[4])
            signup_date = soil_and_signup[1]
            lawn_size = soil_and_signup[2]
            precip_dict = get_precip(lat, lng)
            temperature = get_weather(lat, lng)
            temp = temperature[0]
            date_list = temperature[1]
            temp_array = []
            precip = []
            for key, value in temp.items():
                temp_array.append(value)
            for key, value in precip_dict.items():
                precip.append(value)
            temp_array = np.array(temp_array)
            man = Manager(int(lawn_size), signup_date, temp_array, user_input, precip)
            prior_pouches = get_prior_apps(man)
            gp_list = man.gp_array.tolist()
            gp_dict = dict(zip(date_list, gp_list))
            app_dictionary = prior_pouches
            first_run_flag = True
            data_saving(start_date, lawn_id, man.stress_zone, man.grass_type, gp_dict, app_dictionary, first_run_flag)
            return "Done"
        except Exception as e:
            print("error", e)
            return e

    elif first_run_flag is True:
        try:
            user_input = ['pet', 'new_lawn']  # change later
            soil_and_signup = get_soil_and_signup(lawn_id)
            lat = str(soil_and_signup[3])
            lng = str(soil_and_signup[4])
            soil = soil_and_signup[0]
            signup_date = soil_and_signup[1]
            lawn_size = soil_and_signup[2]
            precip_dict = get_precip(lat, lng)
            temperature = get_weather(lat, lng)
            temp = temperature[0]
            date_list = temperature[1]
            temp_array = []
            precip = []
            for key, value in temp.items():
                temp_array.append(value)
            for key, value in precip_dict.items():
                precip.append(value)
            soil_data_dict = soil['SoilTest'][0]
            lawn_eng_id = LawnEngine.objects.filter(lawn_id=lawn_id)[0].id
            prior_pouches = []
            date_and_pouches = DateAndPouches.objects.filter(lawn_engine_id=lawn_eng_id)
            pouch_dict = {}
            for i in date_and_pouches:
                prior_pouches.append(ast.literal_eval(i.pouches))
                pouch_dict[i.date] = i.pouches
            first_run_flag = True
            temp_array = np.array(temp_array)
            man = Manager(int(lawn_size), signup_date, temp_array, user_input, precip, soil_data_dict,
                          prior_pouches)
            gp_list = man.gp_array.tolist()
            gp_dict = dict(zip(date_list, gp_list))
            data_saving(start_date, lawn_id, man.stress_zone, man.grass_type, gp_dict, pouch_dict, first_run_flag)
            return "done"

        except Exception as e:
            print("error", e)
            return e


@app.task()
def periodic_soil_data_run():
    """periodic task to keep track of lawn id's with lawn engine processed"""
    for soil_test in SoilTest.objects.all():
        lawn_id = soil_test.soilinfo.lawn.id
        data_processed_using_task = LawnEngine.objects.filter(lawn_id=lawn_id)[0].task_status
        print(data_processed_using_task)
        if data_processed_using_task is False:
            start_date = timezone.now()
            try:
                first_run_flag = LawnEngine.objects.filter(lawn_id=lawn_id)[0].run_type
            except Exception as e:
                print(e)
                first_run_flag = False
            if first_run_flag is True:
                try:
                    user_input = ['pet', 'new_lawn']  # change later
                    soil_and_signup = get_soil_and_signup(lawn_id)
                    lat = str(soil_and_signup[3])
                    lng = str(soil_and_signup[4])
                    soil = soil_and_signup[0]
                    signup_date = soil_and_signup[1]
                    lawn_size = soil_and_signup[2]
                    precip_dict = get_precip(lat, lng)
                    temperature = get_weather(lat, lng)
                    temp = temperature[0]
                    date_list = temperature[1]
                    temp_array = []
                    precip = []
                    for key, value in temp.items():
                        temp_array.append(value)
                    for key, value in precip_dict.items():
                        precip.append(value)
                    soil_data_dict = soil['SoilTest'][0]
                    lawn_eng_id = LawnEngine.objects.filter(lawn_id=lawn_id)[0].id
                    prior_pouches = []
                    date_and_pouches = DateAndPouches.objects.filter(lawn_engine_id=lawn_eng_id)
                    pouch_dict = {}
                    for pouch in date_and_pouches:
                        prior_pouches.append(ast.literal_eval(pouch.pouches))
                        pouch_dict[pouch.date] = pouch.pouches
                    first_run_flag = True
                    temp_array = np.array(temp_array)
                    man = Manager(int(lawn_size), signup_date, temp_array, user_input, precip, soil_data_dict,
                                  prior_pouches)
                    gp_list = man.gp_array.tolist()
                    gp_dict = dict(zip(date_list, gp_list))
                    data_saving(start_date, lawn_id, man.stress_zone, man.grass_type, gp_dict, pouch_dict,
                                first_run_flag)
                    for lawn_engine in LawnEngine.objects.filter(lawn_id=lawn_id):
                        lawn_engine.task_status = True
                        lawn_engine.save()
                    print("done")
                except Exception as e:
                    print("error", e)


@shared_task()
def background_lawn_engine_csv_processing(lawn):
    """A task from lawn engine module for processing multiple user data from csv"""

    lat = lawn['lat']
    lng = lawn['lng']
    precip_dict = get_precip(str(lat), str(lng))
    temperature = get_weather(str(lat), str(lng))
    temp = temperature[0]
    date_list = temperature[1]
    temp_array = []
    precip = []
    for key, value in temp.items():
        temp_array.append(value)
    for key, value in precip_dict.items():
        precip.append(value)
    temp_array = np.array(temp_array)
    lawn_size = int(lawn['lawn_size'])
    if lawn_size > 10000:
        lawn_size = 10000
        max_lawn_size = True
    else:
        max_lawn_size = False
    man = Manager(lawn_size, lawn['signup_date'], temp_array, lawn['user_input'], precip)
    prior_pouches = get_prior_apps(man)
    app_dictionary = prior_pouches
    prior_pouches = []
    for i, j in app_dictionary.items():
        prior_pouches.append(j)

    if lawn['soil_data']:
        man = Manager(lawn_size, lawn['signup_date'], temp_array, lawn['user_input'], precip,
                      lawn['soil_data'], prior_pouches)
    run_flag = True
    gp_list = man.gp_array.tolist()
    gp_dict = dict(zip(date_list, gp_list))
    data_saving(lawn['start_date'], int(lawn['lawn_id']), man.stress_zone, man.grass_type, gp_dict,
                app_dictionary, run_flag, max_lawn_size)


@shared_task()
def do_weather_update(user_id, address):
    print(user_id)
    geodata = geo_coodinate_api(address)
    lat = str(geodata['lat'])
    lng = str(geodata['lng'])
    avg_temp_yearly(user_id, lat, lng)
    avg_temp(user_id, lat, lng)
    rainfall(user_id, lat, lng)
    rainfall_yearly(user_id, lat, lng)


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    """Making the task periodic in order to generate user list after a specific time interval"""
    sender.add_periodic_task(10000, combine_user_list.s())


@app.on_after_configure.connect
def setup_lawn_engine_periodic_tasks(sender, **kwargs):
    """Making the task periodic in order to generate user list after a specific time interval"""
    sender.add_periodic_task(10000, periodic_soil_data_run.s())
