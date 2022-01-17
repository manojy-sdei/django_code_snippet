import django_filters
from rest_framework import serializers
from ..models import User, Profile, InviteUser, SitePassword, PreOrder


# def timer(data):
#     """Send main In Background"""
#     sendMail(data)


class ProfileSerializer(serializers.ModelSerializer):
    """relatinal attribute"""
    class Meta:
        model = Profile
        fields = (
            'id',
            'user',
            'first_name',
            'last_name',
            'phone',
            'address',
            'user_type',

        )


class ProfileFilter(django_filters.FilterSet):
    """relational Attribute"""
    class Meta:
        model = Profile
        fields = ['id', 'user', 'first_name', 'last_name', 'user_type']


class UserSerializer(serializers.ModelSerializer):
    """Relatinoal attribute"""
    # image = serializers.FileField()
    user_Profile = ProfileSerializer(many=True)

    class Meta:
        """Attributes"""
        model = User
        fields = (
            'id',
            'email',
            'password',
            'admin',
            'active',
            'created_at',
            'updated_at',
            'mailchimp_id',
            'password_created',
            'user_Profile'
        )

    def create(self, validated_data):
        """Create user"""
        user = User(
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.admin = validated_data['admin']
        user.active = True
        user.save()
        # data={}
        # data['email'] = validated_data['email']
        # data['message'] = "You have Register in Prairie Services."
        # data['subject'] = "Prairie Registration"
        # thread to process
        # background_thread = Thread(target=timer, args=(data,))
        # background_thread.start()
        return user

    # def update(self, instance, validated_data):

    #     user = User.objects.all().filter(email=validated_data['email'])
    #     user.active = validated_data['active']
    #     user.save()
    #     # user = User.objects.all().filter(email=validated_data['email'])
    #     # instance.password_created = validated_data['password_created']
    #     # instance.active = validated_data['active']
    #     # instance.admin = validated_data['admin']
    #     # instance.save()
    #     return user


class ChangePasswordSerializer(serializers.ModelSerializer):
    """relational schema"""
    userId = serializers.IntegerField()
    newPassword = serializers.CharField(max_length=200)
    oldPassword = serializers.CharField(max_length=200)

    class Meta:
        """Attributes"""
        model = User
        fields = (
            # 'id',
            # 'password'
            'userId',
            'newPassword',
            'oldPassword',

        )
#     # def create(self, validated_data):
#     #
#     #     user = User.objects.all().filter(id=validated_data['userId'])
#     #     for x in user:

#     #         if x.check_password(validated_data['oldPassword']):
#     #             # x.set_password(validated_data['newPassword'])
#     #             # return({"Status" : "Change Password"}, status.HTTP_202_ACCEPTED)

#     #         else:

#     #             return ({"Status" : "old password does not match"}, status.HTTP_401_UNAUTHORIZED)
#     #     return (validated_data)
#
#
#         # return ({"Status": "old password does not match"}, status.HTTP_401_UNAUTHORIZED)
#     # def update(self, instance, validated_data):
#     #     """Change password"""

#     #     if instance.check_password(validated_data['password'].split(':')[0]):
#     #         instance.set_password(validated_data['password'].split(':')[1])
#     #         instance.save()

#     #         return instance
#     #     else:
#     #         data = {"password": ""}
#     #         # return Response({"password":"Old Password Not Match"}, status.HTTP_404_NOT_FOUND)
#     #         return data


class RestPasswordSerializer(serializers.ModelSerializer):
    """relational schema"""
    class Meta:
        """attributes"""
        model = User
        fields = (
            'email',
            'password',
        )

    # def update(self, instance, validated_data):
    #     """Change password"""

    #
    #     # if instance.check_password(validated_data['password'].split(':')[0]):
    #     #     instance.set_password(validated_data['password'].split(':')[1])
    #     #     instance.save()

    #     #     return instance
    #     # else:
    #     #     data = {"password": "Old Password Not Match"}
    #     #     return data
    #     return instance

# Combine User Serializer

#
# class CombineUserSerializer(serializers.ModelSerializer):
#     """Relational Attribute"""
#     user_Profile = ProfileSerializer(many=True)
#     user_Lawn = LawnSerializer(many=True)
#     user_UQO = UserQuestionOptionSerializer(many=True)
#
#     class Meta:
#         """attribute"""
#         model = User
#         fields = (
#             'id',
#             'email',
#             'admin',
#             'active',
#             'user_Profile',
#             'user_Lawn',
#             'user_UQO',
#
#         )


class UserTypeSerializer(serializers.ModelSerializer):
    """Relational attribute"""
    class Meta:
        """Attributes"""
        model = User
        fields = (
            'id',
            'admin',
            'active',
            'password',
            'password_created',
        )

    def update(self, instance, validated_data):
        # user = User.objects.all().filter(email=validated_data['email'])
        instance.password_created = validated_data['password_created']
        instance.active = validated_data['active']
        instance.admin = validated_data['admin']
        instance.set_password(validated_data['password'])
        instance.save()
        return instance


class InviteUserSerializer(serializers.ModelSerializer):
    """relational field"""

    class Meta:
        """field"""
        model = InviteUser
        fields = (
            'id',
            'name',
            'email',
            'address',
            'invite_no',
            'is_invite',
        )


class SitePasswordSerializer(serializers.ModelSerializer):
    """relational field"""
    class Meta:
        """field"""
        model = SitePassword
        fields = (
            'id',
            'password',
        )


class PreOrderFilters(django_filters.FilterSet):
    """relational Attribute"""
    class Meta:
        model = PreOrder
        fields = ['id', 'user_id']


class PreOrderSerializer(serializers.ModelSerializer):
    """Relational Field"""

    class Meta:
        """fields"""
        model = PreOrder
        fields = (
            'id',
            'created_at',
            'updated_at',
            'user_id',
            'status',
        )

    def create(self, validated_data):
        """Create user"""
        order = PreOrder(
            user_id=validated_data['user_id'],)
        order.status = validated_data['status']
        order.save()
        return order

    def update(self, instance, validated_data):

        instance.status = validated_data['status']
        instance.save()
        return instance
