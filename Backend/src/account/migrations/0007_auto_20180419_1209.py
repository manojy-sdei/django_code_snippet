# Generated by Django 2.0.2 on 2018-04-19 12:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0006_auto_20180419_0944'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inviteuser',
            name='invite_no',
            field=models.CharField(default='p2BIDqU', max_length=50),
        ),
    ]