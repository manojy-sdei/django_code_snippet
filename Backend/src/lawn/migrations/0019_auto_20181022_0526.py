# Generated by Django 2.0.2 on 2018-10-22 05:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lawn', '0018_auto_20181005_1147'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lawnimage',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='lawn_image_upload'),
        ),
    ]
