# Colab + GitHub Two-Way Sync Guide

## Complete Workflow for Staying in Sync

### Initial Setup (One Time)

#### 1. Generate GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Colab Access"
4. Select scopes: `repo` (all permissions)
5. Click "Generate token"
6. **COPY THE TOKEN** - you won't see it again!

#### 2. In Google Colab - First Cell

```python
# Mount Google Drive (for persistence)
from google.colab import drive
drive.mount('/content/drive')

# Clone repository with authentication
import os
from getpass import getpass

# Store token securely (only first time)
token = getpass('Enter your GitHub token: ')
username = 'Vivek3825'
repo = 'The_Digital_Plate'

# Clone repository
!git clone https://{username}:{token}@github.com/{username}/{repo}.git
%cd {repo}/3D_models/images_to_glb_converter

print("✓ Repository cloned and ready!")
```

### Working Workflow

#### In Colab (After Making Changes):

**Add this cell at the end of your notebook:**

```python
# Save changes back to GitHub
def sync_to_github(commit_message="Updated from Colab"):
    """Push changes from Colab to GitHub"""
    import subprocess
    from datetime import datetime
    
    # Configure git
    !git config --global user.email "your-email@example.com"
    !git config --global user.name "Vivek3825"
    
    # Add timestamp to commit message
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    full_message = f"{commit_message} - {timestamp}"
    
    # Stage, commit, and push
    !git add .
    !git commit -m "{full_message}"
    !git push origin main
    
    print(f"✓ Changes pushed to GitHub: {full_message}")

# Use it like this:
sync_to_github("Completed 3D reconstruction")
```

#### On Your Local Machine (To Get Changes):

```bash
cd /home/bablu/Bablu/Works/Projects/The_Digital_Plate
git pull origin main
echo "✓ Local directory updated with Colab changes!"
```

### Alternative: Automatic Sync with Cell Magic

**Add this to your Colab notebook:**

```python
# Auto-save to GitHub after each important step
def auto_commit(step_name):
    """Automatically commit after each pipeline step"""
    !git add .
    !git commit -m "Colab: Completed {step_name}" --allow-empty
    !git push origin main -q
    print(f"✓ Auto-saved: {step_name}")

# Use after each major step:
extract_features()
auto_commit("Feature Extraction")

match_features()
auto_commit("Feature Matching")

# ... and so on
```

### Best Practice: Hybrid Approach

**For Large Files (3D Models, Images):**
- Store in **Google Drive** (not Git - files too large)
- Only code/notebooks in Git

**For Code Changes:**
- Always push to GitHub from Colab
- Pull on local machine to stay updated

### Quick Reference Commands

#### Colab → GitHub:
```python
!git add .
!git commit -m "Your message"
!git push origin main
```

#### Local Machine → GitHub:
```bash
git add .
git commit -m "Your message"
git push origin main
```

#### GitHub → Colab (refresh):
```python
!git pull origin main
```

#### GitHub → Local Machine:
```bash
git pull origin main
```

### Complete Sync Script for Colab

**Save this as a cell in your notebook:**

```python
def setup_github_sync():
    """One-time setup for GitHub sync"""
    from getpass import getpass
    
    # Get credentials
    email = input("Enter your GitHub email: ")
    token = getpass("Enter your GitHub token: ")
    
    # Configure git
    !git config --global user.email "{email}"
    !git config --global user.name "Vivek3825"
    
    # Update remote URL with token
    !git remote set-url origin https://Vivek3825:{token}@github.com/Vivek3825/The_Digital_Plate.git
    
    print("✓ GitHub sync configured!")

# Run once per Colab session
# setup_github_sync()
```

### Important Notes

1. **Token Security**: Never commit your token to the notebook
2. **Large Files**: Use `.gitignore` for generated models
3. **Colab Sessions**: Expire after ~12 hours - you'll need to re-authenticate
4. **Local Changes**: Always pull before making local changes to avoid conflicts

### Handling Merge Conflicts

If you edit both in Colab and locally:

```bash
# On local machine
git pull origin main
# If conflicts, resolve them
git add .
git commit -m "Resolved conflicts"
git push origin main

# In Colab
!git pull origin main --rebase
```

### .gitignore Setup

**Add this to `.gitignore`:**

```
# Large files - keep in Drive, not Git
3D_models/dish_models/
3D_models/dish_images_original/
*.ply
*.mvs
*.glb
*.obj
*.mtl

# Colab/Python
__pycache__/
*.pyc
.ipynb_checkpoints/

# Workspace files
**/colmap_workspace/
**/openmvs_workspace/
```
