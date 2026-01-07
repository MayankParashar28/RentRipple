# RentRipple

RentRipple is a full-stack Airbnb clone that allows users to rent out their homes or book unique accommodations around the world. Built with the MERN stack (MongoDB, Express, Node.js) and enhanced with modern features like interactive maps, image uploads, and a comprehensive user dashboard.

##  Features

### Core Functionality
-   **User Authentication**: Secure login and signup using Passport.js.
-   **CRUD Operations**: Users can create, read, update, and delete their own listings.
-   **Reviews**: Users can leave operational reviews and ratings for listings.
-   **Image Uploads**: Cloud storage support via Cloudinary for listing photos.

### Advanced Features
-   **Interactive Map**: Powered by Mapbox GL JS, displaying listing locations with cluster clustering for better visualization.
-   **Dynamic Booking System**:
    -   Real-time cost calculation based on selected dates.
    -   Displays service fee, cleaning fee, and tax breakdown.
-   **User Dashboard**:
    -   **My Trips**: View upcoming and past bookings with status tracking.
    -   **Hosting Dashboard**: Manage your listings and view incoming reservations from other users.
-   **Search & Filtering**: Categorized listings (e.g., Beachfront, Cabins, Trending) for easy discovery.

## 🛠️ Tech Stack

-   **Frontend**: EJS (Embedded JavaScript), Tailwind CSS, Bootstrap (legacy), Javascript (ES6+)
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB (Atlas) with Mongoose ODM
-   **Authentication**: Passport.js (Local Strategy)
-   **Maps & Geocoding**: Mapbox SDK
-   **Storage**: Cloudinary
-   **Deployment**: Vercel (Serverless)

## ⚙️ Usage

### Prerequisites
-   Node.js (v14+)
-   MongoDB Atlas Account
-   Cloudinary Account
-   Mapbox Account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/MayankParashar28/RentRipple.git
    cd RentRipple
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and add:
    ```env
    CLOUD_NAME=your_cloudinary_name
    CLOUD_API_KEY=your_cloudinary_key
    CLOUD_API_SECRET=your_cloudinary_secret
    MAP_TOKEN=your_mapbox_token
    MONGO_URL=your_mongodb_atlas_url
    SECRET=your_session_secret
    ```

4.  **Run Locally**
    ```bash
    node app.js
    ```
    Visit `http://localhost:3000` in your browser.

## 🚀 Deployment (Vercel)

This project is configured for Vercel deployment.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the **Environment Variables** from step 3 in the Vercel Project Settings.
4.  Deploy!

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
