from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group

from unfold.admin import ModelAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from .models import User

admin.site.unregister(Group)


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm
    warn_unsaved_form = True
    list_filter_submit = True
    list_fullwidth = False
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    warn_unsaved_form = True
    list_fullwidth = False
