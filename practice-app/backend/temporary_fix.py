import os

def fix_installed_apps():
    settings_path = 'config/settings.py'
    
    with open(settings_path, 'r') as file:
        content = file.read()
    
    # Replace the problematic app name
    if "'apps.challenges'," in content:
        content = content.replace("'apps.challenges',", "'apps.challanges',")
    
    with open(settings_path, 'w') as file:
        file.write(content)
    
    print("Fixed the app name in settings.py")

if __name__ == '__main__':
    fix_installed_apps()
