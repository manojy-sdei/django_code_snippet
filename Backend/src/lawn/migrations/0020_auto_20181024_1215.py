# Generated by Django 2.0.2 on 2018-10-24 12:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lawn', '0019_auto_20181022_0526'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lawninfo',
            name='observed_grass_type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
