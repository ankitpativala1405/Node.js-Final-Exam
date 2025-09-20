# MongoDB Atlas Setup Guide

## Current Issue: Authentication Failed

Your MongoDB Atlas connection is failing with "bad auth : authentication failed". Here's how to fix it:

## Step 1: Check Your MongoDB Atlas Dashboard

1. **Go to [MongoDB Atlas](https://cloud.mongodb.com/)**
2. **Sign in to your account**
3. **Select your cluster** (Cluster0)

## Step 2: Create/Verify Database User

1. **Click on "Database Access" in the left sidebar**
2. **Check if user "nodepractice" exists:**
   - If it exists, click "Edit" and reset the password
   - If it doesn't exist, click "Add New Database User"

3. **For new user or password reset:**
   - Username: `nodepractice`
   - Password: `nodepractice` (or create a new secure password)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User" or "Update User"

## Step 3: Check Network Access

1. **Click on "Network Access" in the left sidebar**
2. **Add your IP address:**
   - Click "Add IP Address"
   - Choose "Add Current IP Address" or "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

## Step 4: Get the Correct Connection String

1. **Click on "Connect" button on your cluster**
2. **Choose "Connect your application"**
3. **Select "Node.js" as driver**
4. **Copy the connection string**
5. **Replace `<password>` with your actual password**

## Step 5: Update Your Configuration

Once you have the correct connection string, update your `config.env` file:

```env
MONGODB_URI=mongodb+srv://nodepractice:YOUR_ACTUAL_PASSWORD@cluster0.sk2g4jt.mongodb.net/blog_project?retryWrites=true&w=majority&appName=Cluster0
```

## Step 6: Test the Connection

Run the test script:
```bash
node test-mongodb.js
```

## Alternative: Use Local MongoDB

If you prefer to use local MongoDB instead of Atlas:

1. **Install MongoDB locally**
2. **Start MongoDB service**
3. **Update config.env:**
```env
MONGODB_URI=mongodb://localhost:27017/blog_project
```

## Common Issues and Solutions

### Issue 1: "User not found"
- **Solution:** Create the user in Database Access

### Issue 2: "Authentication failed"
- **Solution:** Check username and password are correct

### Issue 3: "IP not whitelisted"
- **Solution:** Add your IP to Network Access

### Issue 4: "Connection timeout"
- **Solution:** Check internet connection and try again

## Quick Fix Commands

After updating your MongoDB Atlas settings:

```bash
# Copy updated config to .env
copy config.env .env

# Test connection
node test-mongodb.js

# If test passes, start the application
npm start
```

## Need Help?

If you're still having issues:

1. **Double-check your MongoDB Atlas credentials**
2. **Make sure your IP is whitelisted**
3. **Try creating a new database user with a simple password**
4. **Check MongoDB Atlas status page for any outages**

The application will work perfectly once the MongoDB connection is established!
