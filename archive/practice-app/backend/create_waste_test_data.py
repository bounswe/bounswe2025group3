#!/usr/bin/env python

import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.waste.models import WasteCategory, SubCategory
from django.db.utils import IntegrityError

def create_waste_test_data():
    # Create categories
    categories = [
        {'name': 'Recyclable', 'description': 'Materials that can be recycled'},
        {'name': 'Organic', 'description': 'Food and green waste'}, 
        {'name': 'Electronic', 'description': 'Electronic waste and devices'},
        {'name': 'Glass', 'description': 'Glass containers and items'},
        {'name': 'Cooking Oil', 'description': 'Used cooking oil'},
        {'name': 'Clothing', 'description': 'Used clothing and textiles'}, 
        {'name': 'Other', 'description': 'Other types of waste'}
    ]
    
    # Create subcategories with units and scores
    subcategories = [
        # Recyclable subcategories
        {'name': 'Plastic Bottles', 'category_name': 'Recyclable', 'description': 'PET and HDPE bottles', 
         'score_per_unit': 2.0, 'unit': 'pcs'},
        {'name': 'Paper', 'category_name': 'Recyclable', 'description': 'Newspapers, books, magazines', 
         'score_per_unit': 1.5, 'unit': 'kg'},
        {'name': 'Cardboard', 'category_name': 'Recyclable', 'description': 'Cardboard boxes and packaging', 
         'score_per_unit': 1.8, 'unit': 'kg'},
        {'name': 'Metal Cans', 'category_name': 'Recyclable', 'description': 'Aluminum and tin cans', 
         'score_per_unit': 3.0, 'unit': 'pcs'},
         
        # Organic subcategories
        {'name': 'Food Scraps', 'category_name': 'Organic', 'description': 'Fruit and vegetable scraps', 
         'score_per_unit': 1.0, 'unit': 'kg'},
        {'name': 'Garden Waste', 'category_name': 'Organic', 'description': 'Leaves, grass, plant trimmings', 
         'score_per_unit': 0.8, 'unit': 'kg'},
        {'name': 'Coffee Grounds', 'category_name': 'Organic', 'description': 'Used coffee grounds', 
         'score_per_unit': 2.0, 'unit': 'kg'},
         
        # Electronic subcategories
        {'name': 'Batteries', 'category_name': 'Electronic', 'description': 'All types of batteries', 
         'score_per_unit': 5.0, 'unit': 'pcs'},
        {'name': 'Small Appliances', 'category_name': 'Electronic', 'description': 'Small electronic devices', 
         'score_per_unit': 10.0, 'unit': 'pcs'},
        {'name': 'Mobile Phones', 'category_name': 'Electronic', 'description': 'Cell phones and accessories', 
         'score_per_unit': 15.0, 'unit': 'pcs'},
        
        # Glass subcategories
        {'name': 'Glass Bottles', 'category_name': 'Glass', 'description': 'Glass bottles and jars', 
         'score_per_unit': 2.5, 'unit': 'pcs'},
        {'name': 'Broken Glass', 'category_name': 'Glass', 'description': 'Broken glass items', 
         'score_per_unit': 1.0, 'unit': 'kg'},
        
        # Cooking Oil subcategories
        {'name': 'Used Cooking Oil', 'category_name': 'Cooking Oil', 'description': 'Used cooking oil for recycling', 
         'score_per_unit': 4.0, 'unit': 'l'},
        
        # Clothing subcategories
        {'name': 'Used Clothing', 'category_name': 'Clothing', 'description': 'Donated clothing items', 
         'score_per_unit': 3.0, 'unit': 'kg'},
        {'name': 'Shoes', 'category_name': 'Clothing', 'description': 'Used footwear', 
         'score_per_unit': 5.0, 'unit': 'pcs'},
        
        # Other
        {'name': 'Hazardous Waste', 'category_name': 'Other', 'description': 'Paints, chemicals, etc.', 
         'score_per_unit': 8.0, 'unit': 'kg'},
        {'name': 'Bulky Items', 'category_name': 'Other', 'description': 'Furniture, large items', 
         'score_per_unit': 15.0, 'unit': 'pcs'}
    ]
    
    # Create categories
    created_categories = 0
    for cat_data in categories:
        try:
            category, created = WasteCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description'], 'is_active': True}
            )
            if created:
                created_categories += 1
                print(f"Created category: {category.name}")
        except Exception as e:
            print(f"Error creating category {cat_data['name']}: {e}")
    
    # Create subcategories
    created_subcategories = 0
    for subcat_data in subcategories:
        try:
            # Get the parent category
            category = WasteCategory.objects.get(name=subcat_data['category_name'])
            
            # Create the subcategory
            subcategory, created = SubCategory.objects.get_or_create(
                name=subcat_data['name'],
                category=category,
                defaults={
                    'description': subcat_data['description'],
                    'score_per_unit': subcat_data['score_per_unit'],
                    'unit': subcat_data['unit'],
                    'is_active': True
                }
            )
            
            if created:
                created_subcategories += 1
                print(f"Created subcategory: {subcategory.name} under {category.name}")
        except Exception as e:
            print(f"Error creating subcategory {subcat_data['name']}: {e}")
    
    print(f"\nCreated {created_categories} categories and {created_subcategories} subcategories")

if __name__ == "__main__":
    print("Creating waste test data...")
    create_waste_test_data()
    print("Done!")
