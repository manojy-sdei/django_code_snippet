# Generated by Django 2.0.2 on 2018-05-08 12:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lawn', '0002_auto_20180508_0419'),
    ]

    operations = [
        migrations.AddField(
            model_name='lawn',
            name='finished_square_footage',
            field=models.CharField(max_length=150, null=True),
        ),
    ]