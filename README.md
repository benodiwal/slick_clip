# slick_clip

## Overview
`slick_clip` is a video management application that provides REST APIs for uploading, trimming, merging, and sharing video files.

## Features
- User Registration and Authentication
- Video Upload
- Video Trimming
- Video Merging
- Video Sharing with Expiry Links

## Technologies Used
- Node.js
- Express.js
- TypeScript
- SQLite (via Prisma ORM)
- Swagger for API Documentation

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Yarn (v1.22 or higher)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/benodiwal/slick_clip.git
    cd slick_clip
    ```
2. Navigate to server directory:

    ```bash
    cd server
    ```

2. Install the dependencies:

    ```bash
    yarn
    ```

3. Set up the database:

    ```bash
    npx prisma migrate dev --name init
    ```

4. Create a `.env` file and add your environment variables:

    ```bash
    cp .env.example .env
    ```

5. Configure `config.yaml` file accordingly:

    ```yaml
    maxSize: 100mb
    minDuration: 5
    maxDuration: 1000
    ```
### Running the Application

1. Start the development server:

    ```bash
    yarn dev
    ```

2. The server will be running on `http://localhost:8000`.

### Linting:

1. To run the linter:

    ```bash
    yarn lint    
    ```
2. To automatically fix linting errors:

    ```bash
    yarn lint:fix
    ```

### Testing:

1. To run the test suite:
    
    ```bash
    yarn test
    ```

### Building for Production

1. Build the application:

    ```bash
    yarn build
    ```

2. Start the production server:

    ```bash
    yarn start
    ```

### API Documentation

The API documentation is available via Swagger UI. Once the server is running, you can access it at:
