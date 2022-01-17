"""
Author : Paritosh Yadav
Create Date : Feb/21/2018
Descriptions : This is Serializer model convert all data into json

"""
from rest_framework import serializers
from ..models import Lawn, UserQuestionOption, SelectedQuestionOption, LawnInfo, LawnImage
from common.sendmail import sendMail
from threading import Thread


class LawnInfoSerializer(serializers.ModelSerializer):
    """related attribute"""
    class Meta:
        model = LawnInfo
        fields = (
            'id',
            'initial_lot_size',
            'initial_lawn_area',
            'initial_lawn_size',
            'observed_lawn_size',
            'observed_shaded_lawn',
            'observed_visibility',
            'observed_shade',
            'grass_zone',
            'observed_grass_type',
        )


def timer(data):
    """Send main In"""
    sendMail(data)


class LawnSerializer(serializers.ModelSerializer):
    """Relational Fields"""
    lawn_Info = LawnInfoSerializer(many=True)

    class Meta:
        """attributes"""
        model = Lawn
        fields = (
            'id',
            'user',
            'address',
            'number_of_floors',
            'basement',
            'yearbuilt',
            'zestimate',
            'estimated_lawn_size',
            'finished_square_footage',
            'manual_review',
            'is_right_review',
            'is_wrong_review',
            'send_mail',
            'tennis_court_size',
            'lat',
            'lng',
            'street_number',
            'route',
            'locality',
            'administrative_area_level_1',
            'country',
            'postal_code',
            'lawn_Info',
        )

    def create(self, validated_data):
        """create lawn and lawn info"""

        lawn_info = validated_data.pop('lawn_Info')
        print(lawn_info)
        lawn = Lawn.objects.create(**validated_data)
        for lawninfo in lawn_info:
            LawnInfo.objects.create(lawn=lawn, **lawninfo)
        if validated_data.get('send_mail') is True:
            data = {}
            emailId = ["support@joinprairie.com"]
            for email in emailId:
                data['email'] = email
                data['subject'] = "Prairie"
                data["message"] = "Hello Admin,\nA user with the email: {email}" \
                                  " has opted for manual review. Below is the message:\n{manual_review}\n\nRegards\n" \
                                  "Joinprairie Team, " \
                    .format(manual_review=validated_data.get('manual_review') + ' ',
                            email=validated_data['user'])
                # thread to process
                background_thread = Thread(target=timer, args=(data,))
                background_thread.start()
        return lawn

    def update(self, instance, validated_data):
        lawn_info = validated_data.pop('lawn_Info')
        instance.user = validated_data.get('user', instance.user)
        instance.address = validated_data.get('address', instance.address)
        instance.number_of_floors = validated_data.get('number_of_floors', instance.number_of_floors)
        instance.basement = validated_data.get('basement', instance.basement)
        instance.yearbuilt = validated_data.get('yearbuilt', instance.yearbuilt)
        instance.zestimate = validated_data.get('zestimate', instance.zestimate)
        instance.estimated_lawn_size = validated_data.get('estimated_lawn_size', instance.estimated_lawn_size)
        instance.finished_square_footage = validated_data.get('finished_square_footage',
                                                              instance.finished_square_footage)
        instance.manual_review = validated_data.get('manual_review', instance.manual_review)
        instance.is_right_review = validated_data.get('is_right_review', instance.is_right_review)
        instance.is_wrong_review = validated_data.get('is_wrong_review', instance.is_wrong_review)
        instance.send_mail = validated_data.get('send_mail', instance.send_mail)
        instance.tennis_court_size = validated_data.get('tennis_court_size', instance.tennis_court_size)
        instance.lat = validated_data.get('lat', instance.lat)
        instance.lng = validated_data.get('lng', instance.lng)
        instance.street_number = validated_data.get('street_number', instance.street_number)
        instance.route = validated_data.get('route', instance.route)
        instance.locality = validated_data.get('locality', instance.locality)
        instance.administrative_area_level_1 = validated_data.get('administrative_area_level_1',
                                                                  instance.administrative_area_level_1)
        instance.country = validated_data.get('country', instance.country)
        instance.postal_code = validated_data.get('postal_code', instance.postal_code)
        if validated_data.get('send_mail') is True:
            data = {}

            emailId = ["support@joinprairie.com"]
            for email in emailId:
                data['email'] = email
                data['subject'] = "Prairie"
                data["message"] = "Hello Admin,\nA user with the email: {email}" \
                                  " has opted for manual review. Below is the message:\n{manual_review}\n\nRegards\n" \
                                  "Joinprairie Team, " \
                                  .format(manual_review=validated_data.get('manual_review') + ' ',
                                          email=validated_data['user'])

                background_thread = Thread(target=timer, args=(data,))
                background_thread.start()

        instance.save()
        if lawn_info:
            lawn = instance.lawn_Info.all()
            lawn.delete()
            for usda_data in lawn_info:
                LawnInfo.objects.create(lawn=instance, **usda_data)
        return instance


class SelectedQuestionOptionSerilaizer(serializers.ModelSerializer):
    """Relational attribute"""
    class Meta:
        """attribute"""
        model = SelectedQuestionOption
        fields = (
            'question',
            'option',
        )


class UserQuestionOptionSerializer(serializers.ModelSerializer):
    """Relational fields"""
    UserQuestionOption_SQO = SelectedQuestionOptionSerilaizer(many=True,)

    class Meta:
        """attributes"""
        model = UserQuestionOption
        fields = (
            'id',
            'user',
            'lawn',
            'UserQuestionOption_SQO',
        )

    def create(self, validated_data):
        """create"""
        useQuestion_SQO = validated_data.pop('UserQuestionOption_SQO')
        userQuestionOption = UserQuestionOption.objects.create(**validated_data)
        for SQO in useQuestion_SQO:
            SelectedQuestionOption.objects.create(user_question_option=userQuestionOption, **SQO)
        return userQuestionOption

    def update(self, instance, validated_data):
        """update data"""
        useQuestion_SQO = validated_data.pop('UserQuestionOption_SQO')
        SQO = instance.UserQuestionOption_SQO.all()
        question_id = []
        for i in SQO:
            if i.question not in question_id:
                question_id.append(i.question)
            else:
                dele = instance.UserQuestionOption_SQO.filter(question=i.question)
                dele.delete()
        instance.user = validated_data.get('user', instance.user)
        instance.save()
        instance.lawn = validated_data.get('lawn', instance.lawn)
        for SQO in useQuestion_SQO:
            if SQO['question'] not in question_id:
                SelectedQuestionOption.objects.create(user_question_option=instance, **SQO)
            else:
                pass
        return instance


class LawnImageSerializer(serializers.ModelSerializer):
    class Meta:
        """attributes"""
        model = LawnImage
        fields = '__all__'
