"""Management command to export the OpenAPI schema.

This command generates the OpenAPI 3.0 schema for the EcoChallenge API
and saves it to a file. The schema can be used with external API documentation
tools or shared with frontend developers.

Usage:
    python manage.py export_schema --format yaml|json --output schema.yaml|schema.json
"""

import json
import yaml
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from drf_spectacular.generators import SchemaGenerator
from drf_spectacular.settings import spectacular_settings
from drf_spectacular.validation import validate_schema


class Command(BaseCommand):
    help = 'Export the OpenAPI schema to a file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--format',
            choices=['json', 'yaml'],
            default='yaml',
            help='Output format (default: yaml)'
        )
        parser.add_argument(
            '--output',
            default='schema.yaml',
            help='Output file path (default: schema.yaml)'
        )
        parser.add_argument(
            '--validate',
            action='store_true',
            help='Validate the schema before export'
        )

    def handle(self, *args, **options):
        # Generate the schema
        generator = SchemaGenerator(
            patterns=None,  # Use all URLs
            api_version=spectacular_settings.VERSION,
        )
        schema = generator.get_schema(request=None, public=True)
        
        # Validate if requested
        if options['validate']:
            self.stdout.write('Validating schema...')
            try:
                validate_schema(schema)
                self.stdout.write(self.style.SUCCESS('Schema validation successful!'))
            except Exception as e:
                raise CommandError(f'Schema validation failed: {str(e)}')
        
        # Determine output format and file path
        output_format = options['format']
        output_path = Path(options['output'])
        
        # Ensure the directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write the schema to file
        self.stdout.write(f'Writing {output_format} schema to {output_path}...')
        
        with open(output_path, 'w') as f:
            if output_format == 'json':
                json.dump(schema, f, indent=2)
            else:  # yaml
                yaml.dump(schema, f, sort_keys=False)
        
        self.stdout.write(self.style.SUCCESS(f'Schema exported successfully to {output_path}'))
        
        # Display helpful next steps
        self.stdout.write('\nNext steps:')
        self.stdout.write('  - Share this schema with frontend developers')
        self.stdout.write('  - Import it into Postman or other API tools')
        self.stdout.write('  - Access the interactive documentation at:')
        self.stdout.write('    - Swagger UI: http://127.0.0.1:8000/api/docs/')
