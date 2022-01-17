"""
Author : Paritosh Yadav
Create Date : Feb/21/2018'
Description : Routing setting of Lawn API

Abbreviation : RC -->(R)Read(Get)
                    Create(Post)
               RUD --> (R)Read By ID(Get)
                       (U) Update (PUT)
                       (D) Delete (Delete)
"""

from django.conf.urls import url
from .views import (LawnRC, LawnRUD, LawnImageClass,
                    UserQuestionOptionRC, UserQuestionOptionRUD,
                    CombineLawnAnalytic, CombineLawnAnalyticById)

urlpatterns = [
    # """routing"""
    url(r'^lawn/$', LawnRC.as_view()),
    url(r'^lawn/(?P<pk>\d+)/$', LawnRUD.as_view()),

    url(r'^user_question_option/$', UserQuestionOptionRC.as_view()),
    url(r'^user_question_option/(?P<pk>\d+)/$', UserQuestionOptionRUD.as_view()),

    url(r'^combine_lawn/$', CombineLawnAnalytic.as_view()),
    url(r'^combine_lawn/(?P<pk>\d+)/$', CombineLawnAnalyticById.as_view()),
    url(r'^lawnimage/$', LawnImageClass.as_view()),
    url(r'^lawnimage/(?P<pk>\d+)/$', LawnImageClass.as_view()),
]
