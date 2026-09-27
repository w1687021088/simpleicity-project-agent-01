from tortoise import migrations
from tortoise.migrations import operations as ops
from tortoise import fields

class Migration(migrations.Migration):
    dependencies = [('models', '0001_initial')]

    initial = False

    operations = [
        ops.AddField(
            model_name='User',
            name='user_id',
            field=fields.BigIntField(unique=True, description='用户公开唯一标识（雪花ID）'),
        ),
    ]
