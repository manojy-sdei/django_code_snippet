from django.contrib import admin
from .models import Lawn, UserQuestionOption, LawnAnalytic, SelectedQuestionOption, LawnInfo, LawnImage
# Register your models here.
admin.site.register(Lawn)
admin.site.register(UserQuestionOption)
admin.site.register(LawnAnalytic)
admin.site.register(SelectedQuestionOption)
admin.site.register(LawnInfo)
admin.site.register(LawnImage)
