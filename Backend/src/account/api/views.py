from random import choice, randint
import string
from threading import Thread
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import generics, status
from common.sendmail import sendMail
from django.contrib.auth.hashers import make_password
from lawn.models import Lawn, UserQuestionOption, SelectedQuestionOption, LawnInfo, LawnImage
from faq.models import Questionnaire, Option
from ..models import User, Profile, InviteUser, SitePassword, PreOrder
from .serializers import (UserSerializer, ProfileSerializer, PreOrderFilters,
                          RestPasswordSerializer, ProfileFilter,
                          ChangePasswordSerializer, UserTypeSerializer,
                          InviteUserSerializer, SitePasswordSerializer, PreOrderSerializer)
from .tasks import user_list


def timer(data):
    """Send main In Background"""
    sendMail(data)


class StandardResultsSetPagination(PageNumberPagination):
    """Pagination setting"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserListAPI(generics.ListCreateAPIView):
    """User Read Create Api"""
    # permission_classes = [permissions.AllowAny, ]
    queryset = User.objects.all().filter(active=True)
    serializer_class = UserSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('email', 'id', 'admin', 'active')
    # pagination_class = StandardResultsSetPagination


class UserListPageAPI(generics.ListCreateAPIView):
    queryset = User.objects.all().filter(active=True)
    serializer_class = UserSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('email', 'id', 'admin', 'active')
    pagination_class = StandardResultsSetPagination


class UserAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Read, update, delete"""
    # permission_classes = [permissions.AllowAny, ]
    serializer_class = UserSerializer
    queryset = User.objects.all().filter(active=True)


# active when user already there
class UserActive(APIView):
    def post(self, request):
        usr = User.objects.get(email=request.data['email'])
        usr.active = "True"   # hard code bad
        usr.save()
        return Response({"status": "User Activated"})


# User Side
class ProfileRC(generics.ListCreateAPIView):
    """Read, create"""
    # permission_classes = [permissions.AllowAny, ]
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    filter_class = ProfileFilter    # class for filtering


class ProfileRUD(generics.RetrieveUpdateAPIView):
    """read , update, delete"""
    # permission_classes = [permissions.AllowAny, ]
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()


class Registration(generics.CreateAPIView):
    """Register user"""
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ResetPassword(generics.ListAPIView):
    """Reset Password """
    serializer_class = RestPasswordSerializer
    # queryset = User.objects.all()

    def get_queryset(self):
        """
        This view should return a list of all the purchases
        for the currently authenticated user.
        """
        # user = self.request.email
        # email=self.kwargs['email']
        user = User.objects.filter(email=self.kwargs['email'])

        if user:
            # password generate
            characters = string.ascii_letters + string.digits
            password = "".join(choice(characters) for x in range(randint(8, 16)))

            User.objects.filter(email=self.kwargs['email']).update(password=make_password(password))
            data = dict()
            data['email'] = self.kwargs['email']
            data['message'] = "Here is your temporary password '" + password + "' . Change your password after login."
            data['subject'] = "Password Change"
            background_thread = Thread(target=timer, args=(data,))
            background_thread.start()
            return user
        else:
            return Response(user, status.HTTP_404_NOT_FOUND)


class ChangePassword(generics.CreateAPIView):
    """Change password:"old:new"""
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        """Change Password"""
        user = User.objects.all().filter(id=request.data['userId'])
        for x in user:
            if x.check_password(request.data['oldPassword']):
                x.set_password(request.data['newPassword'])
                x.save()
                return Response({"Status": "Change Password"}, status.HTTP_202_ACCEPTED)
            else:
                return Response({"Status": "old password does not match"}, status.HTTP_401_UNAUTHORIZED)
        # return Response(request.data)


# Combine User
class CombineUser(generics.RetrieveAPIView):
    """User,UserProfile,Lawn, UserQuestionOption """
    # serializer_class = CombineUserSerializer
    # queryset = User.objects.all().filter(active=True)

    def get(self, _request: Request, pk):
        try:
            data = User.objects.get(pk=pk, active=True)
            response = []
            user = dict()
            user['id'] = data.id
            user['email'] = data.email
            user['admin'] = data.admin
            user['active'] = data.active
            user['mailchimp_id'] = data.mailchimp_id
            user['lawn_image'] = ""
            user['pre_order_status'] = []
            user['user_Profile'] = []
            user['user_Lawn'] = []
            user['user_UQO'] = []

            for order in PreOrder.objects.all().filter(user_id=data.id):
                pre_order_status = dict()
                pre_order_status['status'] = order.status
                pre_order_status['created_at'] = order.created_at
                user['pre_order_status'].append(pre_order_status)
            for user_profile in Profile.objects.all().filter(user=data.id):
                profile = dict()
                profile['first_name'] = user_profile.first_name
                profile['last_name'] = user_profile.last_name
                profile['phone'] = user_profile.phone
                profile['address'] = user_profile.address
                profile['user_type'] = user_profile.user_type
                user['user_Profile'].append(profile)
            for user_lawn in Lawn.objects.all().filter(user=data.id):
                lawn = dict()
                lawn['id'] = user_lawn.id
                lawn['address'] = user_lawn.address
                lawn['manual_review'] = user_lawn.manual_review
                lawn['is_right_review'] = user_lawn.is_right_review
                lawn['is_wrong_review'] = user_lawn.is_wrong_review
                lawn['tennis_court_size'] = user_lawn.tennis_court_size
                lawn['lat'] = user_lawn.lat
                lawn['lng'] = user_lawn.lng
                lawn['street_number'] = user_lawn.street_number
                lawn['route'] = user_lawn.route
                lawn['locality'] = user_lawn.locality
                lawn['administrative_area_level_1'] = user_lawn.administrative_area_level_1
                lawn['country'] = user_lawn.country
                lawn['postal_code'] = user_lawn.postal_code
                lawn['zestimate'] = user_lawn.zestimate
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
                    lawn['estimated_lawn_size'] = lawn_info['initial_lawn_size']
                # i=int(plan_PPO.subscription)
            for user_UQO in UserQuestionOption.objects.all().filter(user=data.id):
                UQO = dict()
                UQO['id'] = user_UQO.id
                UQO['lawn'] = user_UQO.lawn.id
                UQO['user'] = user_UQO.user.id
                user['user_UQO'].append(UQO)

                UQO['user_SQO'] = []
                for user_SQO in SelectedQuestionOption.objects.all().filter(user_question_option=user_UQO.id):
                    SQO = {}
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
            return Response({"data": response}, status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"status": "Id Not Found"}, status.HTTP_404_NOT_FOUND)


class DataBaseFix(APIView):
    """fixing database issue of missing address"""
    def get(self, _request: Request):
        all_saved_emails = []
        emails = []
        data = User.objects.all().filter(active=True)
        for x in data:
            all_saved_emails.append(x.email)
            for user_lawn in Lawn.objects.all().filter(user=x.id):
                if user_lawn.address == "nan":
                    emails.append(x.email)
                elif user_lawn.address == "          US":
                    emails.append(x.email)
        address = []
        for email in emails:
            id = User.objects.filter(email=email)[0].id
            for user_lawn in Lawn.objects.filter(user=id):
                user_lawn.address = ""
                user_lawn.save()
        return Response([emails, address, len(emails)])


class CombineUserList(generics.ListAPIView):
    """User,UserProfile,Lawn, UserQuestionOption """
    # permission_classes = [permissions.IsAuthenticated, ]
    def get(self, _request: Request):

        if self.request.query_params:
            email = self.request.query_params['email']
            data = User.objects.all().filter(email=email)
            if not data:
                return Response({"emailId": "Invalid Email ID"}, status.HTTP_404_NOT_FOUND)
        else:
            data = User.objects.all().filter(active=True)
        response = []
        for x in data:
            user = dict()
            user['id'] = x.id
            user['email'] = x.email
            user['admin'] = x.admin
            user['active'] = x.active
            user['mailchimp_id'] = x.mailchimp_id
            user['lawn_image'] = ""
            user['pre_order_status'] = []
            user['user_Profile'] = []
            user['user_Lawn'] = []
            user['user_UQO'] = []
            for order in PreOrder.objects.all().filter(user_id=x.id):
                pre_order_status = dict()
                pre_order_status['status'] = order.status
                pre_order_status['created_at'] = order.created_at
                user['pre_order_status'].append(pre_order_status)
            for user_profile in Profile.objects.all().filter(user=x.id):
                profile = dict()
                profile['first_name'] = user_profile.first_name
                profile['last_name'] = user_profile.last_name
                profile['phone'] = user_profile.phone
                profile['address'] = user_profile.address
                profile['user_type'] = user_profile.user_type
                user['user_Profile'].append(profile)
            for user_lawn in Lawn.objects.all().filter(user=x.id):
                lawn = dict()
                lawn['id'] = user_lawn.id
                lawn['address'] = user_lawn.address
                lawn['zestimate'] = user_lawn.zestimate
                lawn['manual_review'] = user_lawn.manual_review
                lawn['is_right_review'] = user_lawn.is_right_review
                lawn['is_wrong_review'] = user_lawn.is_wrong_review
                lawn['lat'] = user_lawn.lat
                lawn['lng'] = user_lawn.lng
                lawn['street_number'] = user_lawn.street_number
                lawn['route'] = user_lawn.route
                lawn['locality'] = user_lawn.locality
                lawn['administrative_area_level_1'] = user_lawn.administrative_area_level_1
                lawn['country'] = user_lawn.country
                lawn['postal_code'] = user_lawn.postal_code
                lawn['tennis_court_size'] = user_lawn.tennis_court_size
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
                    SQO = {}
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
        return Response({"data": response}, status.HTTP_200_OK)


class UserDataList(generics.ListAPIView):
    """User,UserProfile,Lawn, UserQuestionOption using task in background"""

    def get(self, _request: Request):
        result = user_list()
        return Response({"data": result}, status.HTTP_200_OK)


class UserTypeRUD(generics.RetrieveUpdateAPIView):
    """Read, update, delete"""
    # permission_classes = [permissions.AllowAny, ]
    serializer_class = UserTypeSerializer
    queryset = User.objects.all().filter(active=True)


class InviteUserRC(generics.ListCreateAPIView):
    """Create Read list"""
    queryset = InviteUser.objects.all().filter(is_delete=False)
    serializer_class = InviteUserSerializer
    filter_backends = (DjangoFilterBackend,)  # multi filter
    filter_fields = ('name', 'id', 'email', 'invite_no')


class InviteUserRUD(generics.RetrieveUpdateDestroyAPIView):
    """Delete update Read """
    serializer_class = InviteUserSerializer
    queryset = InviteUser.objects.all().filter(is_delete=False)


# site password
class SitePasswordRC(generics.ListCreateAPIView):
    """Create and list"""
    queryset = SitePassword.objects.all()
    serializer_class = SitePasswordSerializer
    filter_backends = (DjangoFilterBackend,)  # multi filter
    filter_fields = ('password',)


class SitePasswordRUD(generics.RetrieveUpdateDestroyAPIView):
    """Update delete read"""
    serializer_class = SitePasswordSerializer
    queryset = SitePassword.objects.all()


class InviteMail(generics.RetrieveAPIView):
    serializer_class = InviteUserSerializer

    def get(self, _request: Request, pk):
        try:
            invite = InviteUser.objects.get(pk=pk)
            # response['id']=invite.id
            # response['email']=invite.email
            # response['invite_no']=invite.invite_no
            invite.is_invite = True
            invite.save()
            data = dict()
            data['email'] = invite.email
            data['message'] = "Your Invitation Code = " + str(invite.invite_no)
            data['subject'] = "Prairie Invitation"
            # serialized_obj = serializers.serialize('json', [invite, ])
            # thread to process
            background_thread = Thread(target=timer, args=(data,))
            background_thread.start()

            return Response({"data": "Mail Send"}, status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"status": "Id Not Found"}, status.HTTP_404_NOT_FOUND)


class PreOrderRC(generics.ListCreateAPIView):
    """Read, create"""
    # permission_classes = [permissions.AllowAny, ]
    queryset = PreOrder.objects.all()
    serializer_class = PreOrderSerializer
    filter_class = PreOrderFilters


class PreOrderRUD(generics.RetrieveUpdateAPIView):
    """Read and update"""
    # permission_classes = [permissions.AllowAny, ]
    queryset = PreOrder.objects.all()
    serializer_class = PreOrderSerializer

    def get(self, _request: Request, pk):
        queryset = PreOrder.objects.filter(id=pk)
        serializer = PreOrderSerializer(queryset, many=True)
        if serializer.data:
            return Response(serializer.data, status.HTTP_200_OK)
        else:
            return Response([], status.HTTP_200_OK)
