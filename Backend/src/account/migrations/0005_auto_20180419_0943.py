# Generated by Django 2.0.2 on 2018-04-19 09:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0004_auto_20180419_0926'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inviteuser',
            name='invite_no',
            field=models.CharField(default='9nuQOdG', max_length=50),
        ),
    ]
