from django.conf.urls import url
from .views import (UserListAPI, UserAPIView,
                    ProfileRC, ProfileRUD,
                    Registration, ChangePassword, ResetPassword,
                    CombineUser, CombineUserList, UserTypeRUD,
                    InviteUserRC, InviteUserRUD, UserDataList, DataBaseFix,
                    SitePasswordRC, SitePasswordRUD, InviteMail, UserActive, UserListPageAPI, PreOrderRC, PreOrderRUD)


urlpatterns = [

    url(r'^site_password/$', SitePasswordRC.as_view()),
    url(r'^site_password/(?P<pk>\d+)/$', SitePasswordRUD.as_view()),

    url(r'^user_active/$', UserActive.as_view()),

    url(r'^user/$', UserListAPI.as_view()),
    url(r'^user_page/$', UserListPageAPI.as_view()),
    url(r'^user/(?P<pk>\d+)/$', UserAPIView.as_view()),

    url(r'^usertype/(?P<pk>\d+)/$', UserTypeRUD.as_view()),  # change type

    url(r'^registration/$', Registration.as_view()),
    url(r'^change_password/$', ChangePassword.as_view()),
    url(r'^reset_password/(?P<email>.+)/$', ResetPassword.as_view()),

    url(r'^profile/$', ProfileRC.as_view()),
    url(r'^profile/(?P<pk>\d+)/$', ProfileRUD.as_view()),
    # Combine User
    url(r'^combine_user/(?P<pk>\d+)/$', CombineUser.as_view()),
    url(r'^combine_user/$', CombineUserList.as_view()),
    url(r'users_data_list/$', UserDataList.as_view()),

    url(r'^invite_user/$', InviteUserRC.as_view()),
    url(r'^invite_user/(?P<pk>\d+)/$', InviteUserRUD.as_view()),

    url(r'^invite_mail/(?P<pk>\d+)/$', InviteMail.as_view()),

    url(r'^preorder/$', PreOrderRC.as_view()),
    url(r'^preorder/(?P<pk>\d+)/$', PreOrderRUD.as_view()),
    url(r'^test/$', DataBaseFix.as_view()),
]
