"""
Author : Paritosh Yadav
Create Date : Feb/21/2018
Description : View call ap per api request

Abbreviation : RC -->(R)Read(Get)
                    Create(Post)
               RUD --> (R)Read By ID(Get)
                       (U) Update (PUT)
                       (D) Delete (Delete)

"""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from ..models import Lawn, UserQuestionOption, LawnImage
from .serializers import LawnSerializer, UserQuestionOptionSerializer, LawnImageSerializer
from analytic.models import SoilInfo, ClimateInfo, USDA, SoilEstimates, SoilTest, Historical, Actual


class LawnRC(generics.ListCreateAPIView):
    """Read and Create Lawn"""
    queryset = Lawn.objects.all().filter(is_delete=False)
    serializer_class = LawnSerializer
    filter_backends = (DjangoFilterBackend,)  # multi filter
    filter_fields = ('id', 'user', 'address')


class LawnRUD(generics.RetrieveUpdateDestroyAPIView):
    """Read, update and delete"""
    serializer_class = LawnSerializer
    queryset = Lawn.objects.all().filter(is_delete=False)


class UserQuestionOptionRC(generics.ListCreateAPIView):
    """Read and Create"""
    queryset = UserQuestionOption.objects.all().filter(is_delete=False)
    serializer_class = UserQuestionOptionSerializer
    filter_backends = (DjangoFilterBackend,)  # multi filter
    filter_fields = ('id', 'user', 'lawn')


class UserQuestionOptionRUD(generics.RetrieveUpdateDestroyAPIView):
    """"Read update and delete"""
    serializer_class = UserQuestionOptionSerializer
    queryset = UserQuestionOption.objects.all().filter(is_delete=False)


# combine Lawn
class CombineLawnAnalyticById(generics.RetrieveAPIView):
    # queryset = Lawn.objects.all().filter(is_delete=False)
    # serializer_class = Lawn

    def get(self, _request: Request, pk):
        response = []
        try:
            lawn_data = Lawn.objects.get(pk=pk)
            lawn = {}
            lawn["id"] = lawn_data.id
            lawn["address"] = lawn_data.address
            lawn['SoilInfo'] = []
            lawn['ClimateInfo'] = []
            # lawn.append(lawn_data)

            for soil in SoilInfo.objects.all().filter(lawn=lawn_data.id):
                print(soil.id)
                soil_dic = {}
                soil_dic['id'] = soil.id
                soil_dic["soil_USDA"] = []
                soil_dic['SoilTest'] = []
                soil_dic['SoilEstimations'] = []
                for usda in USDA.objects.all().filter(soilinfo=soil.id):
                    usda_Data = {}
                    usda_Data['CEC'] = usda.CEC
                    usda_Data['clay'] = usda.clay
                    usda_Data['OM'] = usda.OM
                    usda_Data['pH'] = usda.pH
                    usda_Data['sand'] = usda.sand
                    usda_Data['silt'] = usda.silt
                    usda_Data['water_capacity'] = usda.water_capacity
                    soil_dic["soil_USDA"].append(usda_Data)

                for soiltest in SoilTest.objects.all().filter(soilinfo=soil.id):
                    soiltest_data = {}
                    soiltest_data['pH'] = soiltest.pH
                    soiltest_data['OM'] = soiltest.OM
                    soiltest_data['CEC'] = soiltest.CEC
                    soiltest_data['Boron'] = soiltest.Boron
                    soiltest_data['Calcium'] = soiltest.Calcium
                    soiltest_data['Copper'] = soiltest.Copper
                    soiltest_data['Iron'] = soiltest.Iron
                    soiltest_data['Magnesium'] = soiltest.Magnesium
                    soiltest_data['Maganese'] = soiltest.Manganese
                    soiltest_data['Nitrogen'] = soiltest.Nitrogen
                    soiltest_data['Phosphorus'] = soiltest.Phosphorus
                    soiltest_data['Potassium'] = soiltest.Potassium
                    soiltest_data['Sodium'] = soiltest.Sodium
                    soiltest_data['Sol_Salts'] = soiltest.Sol_Salts
                    soiltest_data['Sulfur'] = soiltest.Sulfur
                    soiltest_data['Zinc'] = soiltest.Zinc
                    soiltest_data['cec_potassium'] = soiltest.cec_potassium
                    soiltest_data['cec_magnesium'] = soiltest.cec_magnesium
                    soiltest_data['cec_calcium'] = soiltest.cec_calcium
                    soiltest_data['cec_sodium'] = soiltest.cec_sodium
                    soil_dic['SoilTest'].append(soiltest_data)

                for soilEst in SoilEstimates.objects.all().filter(soilinfo=soil.id):
                    soilEst_data = {}
                    soilEst_data['pH'] = soilEst.pH
                    soilEst_data['OM'] = soilEst.OM
                    soilEst_data['CEC'] = soilEst.CEC
                    soilEst_data['Boron'] = soilEst.Boron
                    soilEst_data['Calcium'] = soilEst.Calcium
                    soilEst_data['Copper'] = soilEst.Copper
                    soilEst_data['Iron'] = soilEst.Iron
                    soilEst_data['Magnesium'] = soilEst.Magnesium
                    soilEst_data['Maganese'] = soilEst.Manganese
                    soilEst_data['Nitrogen'] = soilEst.Nitrogen
                    soilEst_data['Phosphorus'] = soilEst.Phosphorus
                    soilEst_data['Potassium'] = soilEst.Potassium
                    soilEst_data['Sodium'] = soilEst.Sodium
                    soilEst_data['Sol_Salts'] = soilEst.Sol_Salts
                    soilEst_data['Sulfur'] = soilEst.Sulfur
                    soilEst_data['Zinc'] = soilEst.Zinc
                    soil_dic['SoilEstimations'].append(soilEst_data)
                lawn['SoilInfo'].append(soil_dic)

            for climate in ClimateInfo.objects.all().filter(lawn=lawn_data.id):
                climate_dic = {}
                climate_dic['id'] = climate.id
                climate_dic['climate_Historical'] = []
                climate_dic['climate_Actual'] = []

                for hist in Historical.objects.all().filter(climate=climate.id):
                    hist_data = {}
                    hist_data['months'] = hist.months
                    hist_data['avg_max'] = hist.avg_max
                    hist_data['avg_min'] = hist.avg_min
                    hist_data['avg_temp'] = hist.avg_temp
                    hist_data['avg_precip'] = hist.avg_precip
                    hist_data['avg_cloud'] = hist.avg_cloud
                    climate_dic['climate_Historical'].append(hist_data)

                for actual in Actual.objects.all().filter(climate=climate.id):
                    actual_data = {}
                    actual_data['months'] = actual.months
                    actual_data['avg_max'] = actual.avg_max
                    actual_data['avg_min'] = actual.avg_min
                    actual_data['avg_temp'] = actual.avg_temp
                    actual_data['avg_precip'] = actual.avg_precip
                    actual_data['avg_cloud'] = actual.avg_cloud
                    climate_dic['climate_Actual'].append(actual_data)
                lawn['ClimateInfo'].append(climate_dic)
            response.append(lawn)
            return Response({"data": response}, status.HTTP_200_OK)
        except Lawn.DoesNotExist:
            return Response({"status": "Id Not Found"}, status.HTTP_404_NOT_FOUND)


class CombineLawnAnalytic(generics.ListAPIView):
    # queryset = Lawn.objects.all().filter(is_delete=False)
    # serializer_class = Lawn

    def get(self, _request: Request):
        response = []
        try:
            lawn_data = Lawn.objects.all()
            # print(lawn_data)
            for var in lawn_data:
                lawn = {}
                lawn["id"] = var.id
                lawn["address"] = var.address
                lawn['SoilInfo'] = []
                lawn['ClimateInfo'] = []
                # lawn.append(lawn)

                for soil in SoilInfo.objects.all().filter(lawn=var.id):
                    print(soil.id)
                    soil_dic = {}
                    soil_dic['id'] = soil.id
                    soil_dic["soil_USDA"] = []
                    soil_dic['SoilTest'] = []
                    soil_dic['SoilEstimations'] = []
                    for usda in USDA.objects.all().filter(soilinfo=soil.id):
                        usda_Data = {}
                        usda_Data['CEC'] = usda.CEC
                        usda_Data['clay'] = usda.clay
                        usda_Data['OM'] = usda.OM
                        usda_Data['pH'] = usda.pH
                        usda_Data['sand'] = usda.sand
                        usda_Data['silt'] = usda.silt
                        usda_Data['water_capacity'] = usda.water_capacity
                        soil_dic["soil_USDA"].append(usda_Data)

                    for soiltest in SoilTest.objects.all().filter(soilinfo=soil.id):
                        soiltest_data = {}
                        soiltest_data['pH'] = soiltest.pH
                        soiltest_data['OM'] = soiltest.OM
                        soiltest_data['CEC'] = soiltest.CEC
                        soiltest_data['Boron'] = soiltest.Boron
                        soiltest_data['Calcium'] = soiltest.Calcium
                        soiltest_data['Copper'] = soiltest.Copper
                        soiltest_data['Iron'] = soiltest.Iron
                        soiltest_data['Magnesium'] = soiltest.Magnesium
                        soiltest_data['Maganese'] = soiltest.Manganese
                        soiltest_data['Nitrogen'] = soiltest.Nitrogen
                        soiltest_data['Phosphorus'] = soiltest.Phosphorus
                        soiltest_data['Potassium'] = soiltest.Potassium
                        soiltest_data['Sodium'] = soiltest.Sodium
                        soiltest_data['Sol_Salts'] = soiltest.Sol_Salts
                        soiltest_data['Sulfur'] = soiltest.Sulfur
                        soiltest_data['Zinc'] = soiltest.Zinc
                        soiltest_data['cec_potassium'] = soiltest.cec_potassium
                        soiltest_data['cec_magnesium'] = soiltest.cec_magnesium
                        soiltest_data['cec_calcium'] = soiltest.cec_calcium
                        soiltest_data['cec_sodium'] = soiltest.cec_sodium
                        soil_dic['SoilTest'].append(soiltest_data)

                    for soilEst in SoilEstimates.objects.all().filter(soilinfo=soil.id):
                        soilEst_data = {}
                        soilEst_data['pH'] = soilEst.pH
                        soilEst_data['OM'] = soilEst.OM
                        soilEst_data['CEC'] = soilEst.CEC
                        soilEst_data['Boron'] = soilEst.Boron
                        soilEst_data['Calcium'] = soilEst.Calcium
                        soilEst_data['Copper'] = soilEst.Copper
                        soilEst_data['Iron'] = soilEst.Iron
                        soilEst_data['Magnesium'] = soilEst.Magnesium
                        soilEst_data['Maganese'] = soilEst.Manganese
                        soilEst_data['Nitrogen'] = soilEst.Nitrogen
                        soilEst_data['Phosphorus'] = soilEst.Phosphorus
                        soilEst_data['Potassium'] = soilEst.Potassium
                        soilEst_data['Sodium'] = soilEst.Sodium
                        soilEst_data['Sol_Salts'] = soilEst.Sol_Salts
                        soilEst_data['Sulfur'] = soilEst.Sulfur
                        soilEst_data['Zinc'] = soilEst.Zinc
                        soil_dic['SoilEstimations'].append(soilEst_data)
                    lawn['SoilInfo'].append(soil_dic)

                for climate in ClimateInfo.objects.all().filter(lawn=var.id):
                    climate_dic = {}
                    climate_dic['id'] = climate.id
                    climate_dic['climate_Historical'] = []
                    climate_dic['climate_Actual'] = []

                    for hist in Historical.objects.all().filter(climate=climate.id):
                        hist_data = {}
                        hist_data['months'] = hist.months
                        hist_data['avg_max'] = hist.avg_max
                        hist_data['avg_min'] = hist.avg_min
                        hist_data['avg_temp'] = hist.avg_temp
                        hist_data['avg_precip'] = hist.avg_precip
                        hist_data['avg_cloud'] = hist.avg_cloud
                        climate_dic['climate_Historical'].append(hist_data)

                    for actual in Actual.objects.all().filter(climate=climate.id):
                        actual_data = {}
                        actual_data['months'] = actual.months
                        actual_data['avg_max'] = actual.avg_max
                        actual_data['avg_min'] = actual.avg_min
                        actual_data['avg_temp'] = actual.avg_temp
                        actual_data['avg_precip'] = actual.avg_precip
                        actual_data['avg_cloud'] = actual.avg_cloud
                        climate_dic['climate_Actual'].append(actual_data)
                    lawn['ClimateInfo'].append(climate_dic)
                response.append(lawn)
            return Response({"data": response}, status.HTTP_200_OK)
        except Lawn.DoesNotExist:
            return Response({"status": "Id Not Found"}, status.HTTP_404_NOT_FOUND)


def lawnimageprocessing(lawn_id, image):
    lawnimage = LawnImage(lawn_id=lawn_id, image=image['image'][0])
    lawnimage.save()


class LawnImageClass(APIView):
    """
    Api to set image for lawn with lawn_id
    uses lawn_id for get and lawn_id and image in post(update as well creations done using post)
    """
    def post(self, request):
        """Post/update image"""
        lawn_id = request.data['lawn_id']
        print(lawn_id)
        image = dict(request.FILES)
        try:
            old_image = LawnImage.objects.filter(lawn_id=lawn_id)
            old_image.delete()
            lawnimageprocessing(lawn_id, image)
            return Response(status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status.HTTP_404_NOT_FOUND)

    def get(self, _request: Request, pk):
        """Get image for <lawn_id>"""
        queryset = LawnImage.objects.filter(lawn_id=pk)
        serializer = LawnImageSerializer(queryset, many=True)
        return Response(serializer.data, status.HTTP_200_OK)
