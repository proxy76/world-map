# Custom migration to handle itinerary structure changes
import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_post_is_private'),
    ]

    operations = [
        # First, rename activity title to name
        migrations.RenameField(
            model_name='itineraryactivity',
            old_name='title',
            new_name='name',
        ),
        # Remove description from activity
        migrations.RemoveField(
            model_name='itineraryactivity',
            name='description',
        ),
        # Add date field to ItineraryDay (we'll populate it later)
        migrations.AddField(
            model_name='itineraryday',
            name='date',
            field=models.DateField(null=True),
        ),
        # Remove the old unique constraint that references day_number
        migrations.AlterUniqueTogether(
            name='itineraryday',
            unique_together=set(),
        ),
        # Remove the old day_number field
        migrations.RemoveField(
            model_name='itineraryday',
            name='day_number',
        ),
        # Add the new unique constraint with date
        migrations.AlterUniqueTogether(
            name='itineraryday',
            unique_together={('itinerary', 'date')},
        ),
        # Update model options for ordering
        migrations.AlterModelOptions(
            name='itineraryday',
            options={'ordering': ['date']},
        ),
    ]
