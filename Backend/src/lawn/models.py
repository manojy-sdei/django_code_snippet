"""
Author : Paritosh Yadav
Created Date : Feb/15/2018
Description : This is Lawn model schema store laws info as well as lawn base question information.

Entity : Lawn, UserQuestionOption

"""

from django.db import models
from prairie_lawn_care.settings import local
from faq.models import Questionnaire, Option
from common.models import Timestampable


class Lawn(Timestampable):
    """attribute of Lawn """
    # user = models.ForeignKey(local.AUTH_USER_MODEL,)
    user = models.ForeignKey(local.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name='user_Lawn')
    address = models.TextField()
    number_of_floors = models.CharField(max_length=150, null=True)
    basement = models.CharField(max_length=150, null=True)
    yearbuilt = models.CharField(max_length=150, null=True)
    zestimate = models.CharField(max_length=150, null=True)
    estimated_lawn_size = models.CharField(max_length=150, null=True)
    finished_square_footage = models.CharField(max_length=150, null=True)
    manual_review = models.CharField(max_length=300, null=True, blank=True)
    is_right_review = models.BooleanField(default=False)
    is_wrong_review = models.BooleanField(default=False)
    send_mail = models.BooleanField(default=False)
    tennis_court_size = models.DecimalField(max_digits=10,
                                            null=True,
                                            decimal_places=2,
                                            default=0)

    lat = models.DecimalField(max_digits=20,
                              null=True,
                              decimal_places=16,
                              default=0)
    lng = models.DecimalField(max_digits=20,
                              null=True,
                              decimal_places=16,
                              default=0)
    street_number = models.CharField(max_length=150, null=True, blank=True)
    route = models.CharField(max_length=150, null=True, blank=True)
    locality = models.CharField(max_length=150, null=True, blank=True)
    administrative_area_level_1 = models.CharField(max_length=150, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=100, null=True, blank=True)
    is_delete = models.BooleanField(default=False)

    def delete(self):
        """soft delete when call delete method in api"""
        self.is_delete = True
        self.save()


class LawnImage(models.Model):
    lawn_id = models.IntegerField(default=0)
    image = models.ImageField(upload_to="lawn_image_upload",
                              null=True, blank=True)


class LawnInfo(Timestampable):
    """Lawn Info Attribute"""
    lawn = models.ForeignKey(Lawn,
                             on_delete=models.CASCADE,
                             related_name='lawn_Info')

    initial_lot_size = models.DecimalField(max_digits=20,
                                           null=True,
                                           decimal_places=2,
                                           default=0)
    initial_lawn_area = models.DecimalField(max_digits=20,
                                            null=True,
                                            decimal_places=2,
                                            default=0)
    initial_lawn_size = models.DecimalField(max_digits=20,
                                            null=True,
                                            decimal_places=2,
                                            default=0)
    observed_lawn_size = models.DecimalField(max_digits=20,
                                             null=True,
                                             decimal_places=2,
                                             default=0)
    observed_shaded_lawn = models.DecimalField(max_digits=20,
                                               null=True,
                                               decimal_places=2,
                                               default=0)
    observed_visibility = models.DecimalField(max_digits=20,
                                              null=True,
                                              decimal_places=2,
                                              default=0)
    observed_shade = models.DecimalField(max_digits=20,
                                         null=True,
                                         decimal_places=2,
                                         default=0)
    grass_zone = models.CharField(max_length=200, null=True)
    observed_grass_type = models.CharField(max_length=100,
                                           null=True,
                                           blank=True)


class UserQuestionOption(Timestampable):
    """attributes of User Question and options base on lawn"""
    # question = models.ForeignKey(Questionnaire,
    #                              on_delete=models.CASCADE,
    #                              related_name='question_UQO')

    user = models.ForeignKey(local.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name='user_UQO')

    lawn = models.ForeignKey(Lawn,
                             on_delete=models.CASCADE,
                             related_name='lawn_UQO')
    is_delete = models.BooleanField(default=False)

    def delete(self):
        """soft delete when call delete method in api"""
        self.is_delete = True
        self.save()


class SelectedQuestionOption(Timestampable):

    user_question_option = models.ForeignKey(UserQuestionOption, null=True, blank=True,
                                             on_delete=models.CASCADE,
                                             related_name='UserQuestionOption_SQO')

    question = models.ForeignKey(Questionnaire, null=True, blank=True,
                                 on_delete=models.CASCADE,
                                 related_name='question_SQO')

    option = models.ForeignKey(Option, null=True, blank=True,
                               on_delete=models.CASCADE,
                               related_name='option_SQO')

#
# class ClimateInfo(Timestampable):
#     name = models.CharField(max_length=20,null=True)
#     is_delete = models.BooleanField(default=False)
#
#     def delete(self, *args, **kwargs):
#         """soft delete when call delete method in api"""
#         self.is_delete = True
#         self.save()
#
#
# class Historical(Timestampable):
#     """attribute"""
#     climate = models.ForeignKey(ClimateInfo,
#                                 on_delete=models.CASCADE,
#                                 related_name="climate_historical")
#     months = models.CharField(max_length=10)
#


class LawnAnalytic(Timestampable):
    pass
