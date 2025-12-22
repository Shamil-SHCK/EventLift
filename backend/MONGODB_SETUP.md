# Setting up MongoDB Locally on Windows

Since you do not have Docker installed, the best way to run MongoDB is to install the **MongoDB Community Server**.

## Step 1: Download MongoDB
1. Go to the [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2. Select the latest version for Windows.
3. Package: **msi**.
4. Click **Download**.

## Step 2: Install MongoDB
1. Run the downloaded `.msi` file.
2. Follow the installation wizard.
3. **IMPORTANT**: Choose **"Complete"** as the setup type.
4. **CRITICAL**: Ensure the checkbox **"Install MongoDB as a Service"** is CHECKED. This runs MongoDB automatically in the background.
5. (Optional) Uncheck "Install MongoDB Compass" if you prefer to use a different tool or install it later, but it is useful for viewing your data.

## Step 3: Verify Installation
1. Open a **new** terminal or command prompt (PowerShell or CMD) to refresh your environment variables.
2. Type `mongod --version`.
   - If you see verification output, you are good to go!
   - If you still see "command not found", you may need to add the bin folder to your PATH manually:
     - The default path is usually: `C:\Program Files\MongoDB\Server\7.0\bin` (version number may vary).

## Step 4: Create the Database Directory (Manual Run)
If you did NOT install it as a service, you must run it manually:
1. Create a folder for data: `mkdir c:\data\db`
2. Run the database: `mongod --dbpath="c:\data\db"`

## Step 5: Start the Server
Once MongoDB is running (either as a service or manually in a separate terminal window):
1. In this project, ensure your `.env` file in `server/` has:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/sponsorship-platform
   ```
2. Start your backend:
   ```bash
   cd server
   npm run dev
   ```
