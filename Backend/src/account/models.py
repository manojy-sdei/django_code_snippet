"""
Author : Paritosh Yadav
Created Date : Feb/13/2018
Description : This is User Model class it is a schema of the user table in the database.
             existence user change to custom user models

Example:

Attributes:
    email,password

"""

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models
from common.models import Timestampable
from common.common_fun import GenerateAlphaNum


class UserManager(BaseUserManager):
    '''User management class manage normal and super user'''
    def create_user(self, email, password=None,):
        """
        Creates and saves a User with the given email and password.
        """
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
        )
        user.set_password(password)
        # print(admin)
        # if admin:
        #     user.admin = True

        user.save(using=self._db)
        return user

    # def create_staffuser(self, email, password):
    #     """
    #     Creates and saves a staff user with the given email and password.
    #     """
    #     user = self.create_user(
    #         email,
    #         password=password,
    #     )
    #     user.staff = True
    #     user.save(using=self._db)
    #     return user

    def create_superuser(self, email, password):
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(
            email,
            password=password,
        )
        user.staff = True
        user.admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, Timestampable):
    """edit user model to custom fields"""
    objects = UserManager()
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    active = models.BooleanField(default=True)
    staff = models.BooleanField(default=False)  # a admin user; non super-user
    admin = models.BooleanField(default=False)  # a superuser
    # notice the absence of a "Password field", that's built in.
    password_created = models.BooleanField(default=False)

    # send mail customer mailchimp id
    mailchimp_id = models.CharField(max_length=150, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Email & Password are required by default.

    def get_full_name(self):
        # The user is identified by their email address
        return self.email

    def get_short_name(self):
        # The user is identified by their email address
        return self.email

    def __str__(self):              # __unicode__ on Python 2
        return self.email

    def has_perm(self, perm, obj=None):
        """"Does the user have a specific permission?"""
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        return self.staff

    @property
    def is_admin(self):
        "Is the user a admin member?"
        return self.admin

    @property
    def is_active(self):
        "Is the user active?"
        return self.active

    # @property
    # def is_password_created(self):
    #     "Is the user active?"
    #     return self.password_created

    def delete(self):
        """soft delete when call delete method in api"""
        self.active = False
        self.save()


class Profile(Timestampable):
    """user profile details"""
    first_name = models.CharField(max_length=50, null=True)
    last_name = models.CharField(max_length=50, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name='user_Profile')
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(blank=True)
    user_type = models.CharField(max_length=256, default="Lead")


class InviteUser(Timestampable):
    """Invite User"""
    # name, email, address, invite_no
    name = models.CharField(max_length=50)
    email = models.EmailField(max_length=150)
    address = models.TextField(null=True)
    invite_no = models.CharField(max_length=50, default=GenerateAlphaNum)
    is_invite = models.BooleanField(default=False)
    is_delete = models.BooleanField(default=False)

    def delete(self, *args, **kwargs):
        """delete method call then automatic"""
        self.is_delete = True
        self.save()


# site Password
class SitePassword(Timestampable):
    password = models.CharField(max_length=250, null=False)
    is_delete = models.BooleanField(default=False)


class PreOrder(Timestampable):
    user_id = models.DecimalField(max_digits=10,
                                  decimal_places=0,
                                  null=False,)
    status = models.CharField(max_length=256,
                              null=True,
                              default="No Pre-order")
