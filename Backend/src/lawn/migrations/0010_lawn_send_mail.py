# Generated by Django 2.0.2 on 2018-09-20 07:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lawn', '0009_auto_20180919_1135'),
    ]

    operations = [
        migrations.AddField(
            model_name='lawn',
            name='send_mail',
            field=models.BooleanField(default=False),
        ),
    ]
