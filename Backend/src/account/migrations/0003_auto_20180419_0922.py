# Generated by Django 2.0.2 on 2018-04-19 09:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0002_auto_20180419_0852'),
    ]

    operations = [
        migrations.AddField(
            model_name='inviteuser',
            name='is_invite',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='inviteuser',
            name='invite_no',
            field=models.CharField(default='dsMykUh', max_length=50),
        ),
    ]