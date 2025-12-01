# The_Digital_Plate

## 🚀 Quick Start Guide

### Prerequisites
- Python 3 installed on your system
- Modern web browser (Chrome, Firefox, Edge, or Safari)
- Camera-enabled device for AR features

### Running the Project

**IMPORTANT**: AR features require HTTPS or localhost. Never open files directly with `file://` protocol.

#### Method 1: Using Python HTTP Server (Recommended)
```bash
# Navigate to project directory
cd The_Digital_Plate

# Start local server
python3 -m http.server 8000

# Open in browser
# Visit: http://localhost:8000
```

#### Method 2: Using Node.js (Alternative)
```bash
# Install http-server globally (one time only)
npm install -g http-server

# Start server
http-server -p 8000

# Open in browser
# Visit: http://localhost:8000
```

### Common Issues

❌ **"Cannot read properties of undefined (reading 'getUserMedia')"**
- **Cause**: Page not served over HTTPS or localhost
- **Solution**: Use one of the methods above to run a local server

❌ **"Failed to load 3D model"**
- **Cause**: Model files missing or incorrect path
- **Solution**: Ensure `.glb` files exist in `AR_environment/dish_models/`

❌ **Camera permission denied**
- **Cause**: Browser blocked camera access
- **Solution**: Allow camera permissions in browser settings

---

## Working Flow

### 1. User scan the QR
- link will generate
- User opens the link

### 2. Website will open 
- Ask for camera permission

| Action | Result |
|:-----------------------|:--------------------------------------|
| User gives the permission | Continue with flow |
| User denied the permission | Show pop up with close option and message:- "Camera needed to see 3D dishes" |

- User will see the beautiful hotel homepage
- Homepage contains different options, sections, layouts:-

| Section | Description |
|:---------|:--------------------------------------|
| **Hotel Overview** | Attractively showcased (Hotel images, Positive feedback and rating, Badge, certifications) | 
| **Menu list** | List all dishes with price, user reviews, short description (sort by option) | 
| **Manage orders** | Add to cart, cancel order, edit order, place order | 
| **Offers and todays special** | daily offers, special items and combos | 
| **Help and Feedback** | collect user queries, issues, feedbacks for improment | 
| **Guid**| step by step guid to place order for new users | 

### 3. User will select the dish
- User can clicks:-

| Option | Action |
|:---|:---|
| Order | to add dish into the cart |
| 3D view | to see the actual dish through AR |
| Dish info | To check Ingredients, Spicy level, Origin, Other Names |

### 4. AR environment will open
- Camera feed start for AR
- Guid new user for to find base and perfect environment for user (skip option)
- 3D model will load
- show Ingredients, Spicy level, Origin, Other Names into AR environment by pointing to 3D model

### 5. User can see the 3D visualization of model
- They can test The Dish Digitally
- Can see quality and type of dish
- ingrediants
- Spicy level

### 6. User will place the order
- User can click on the Top-Right corner to add dish into cart
- Click on cart option to Add to cancel order, edit order, place order
- User can see the waiting time

### 7. Hotel counter will receive the order with table number
- Counter receive orders
- They can accept or decline orders with reason
- If order get accept, weater will start serving process
- If order get decline, weater will discuss the issue with customer

### 8. End

---

## Development Status

### Dynamic Features

| Section | Description | Status |
|:---------|:--------------------------------------|:--------:|
| **Home Overview** | Attractively showcased (Hotel images, Positive feedback and rating, Badge, certifications) | Started |
| **Menu list** | List all dishes with price, user reviews, short description (sort by option) | Started |
| **Manage orders** | Add to cart, cancel order, edit order, place order | Started |
| **Offers and todays special** | daily offers, special items and combos | Started |
| **Help and Feedback** | collect user queries, issues, feedbacks for improment | Not Started |
| **Guid**| step by step guid to place order for new users | ❌ Not Started |


## Frontend Dvelopment
```
index.html
script.js
style.css

```

**five section**
```
Home
Menu
Orders
Feedback
AI Assistant

```