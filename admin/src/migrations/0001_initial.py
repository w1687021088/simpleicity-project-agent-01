from tortoise import migrations
from tortoise.migrations import operations as ops
from tortoise import fields

class Migration(migrations.Migration):
    initial = True

    operations = [
        ops.CreateModel(
            name='User',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('created_at', fields.DatetimeField(auto_now=False, auto_now_add=True)),
                ('updated_at', fields.DatetimeField(auto_now=True, auto_now_add=False)),
                ('username', fields.CharField(unique=True, description='用户名', max_length=50)),
                ('password', fields.CharField(description='密码哈希', max_length=255)),
                ('nickname', fields.CharField(null=True, description='昵称', max_length=50)),
                ('email', fields.CharField(null=True, unique=True, description='邮箱', max_length=100)),
                ('phone', fields.CharField(null=True, unique=True, description='手机号', max_length=20)),
                ('is_active', fields.BooleanField(default=True, description='是否启用')),
            ],
            options={'table': 'sys_user', 'app': 'models', 'pk_attr': 'id', 'table_description': '用户表'},
            bases=['BaseModel'],
        ),
    ]
