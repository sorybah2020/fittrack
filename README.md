
# FitTrack

A web-based fitness tracking application inspired by Apple Fitness, featuring activity rings, workout tracking, and personalized insights.



## Features

- **Activity Rings**: Track daily Move, Exercise, and Stand goals with beautiful visualizations
- **Workout Logging**: Record detailed workout sessions with duration, intensity, and statistics
- **Dashboard Analytics**: Monitor progress and trends with intuitive data visualizations
- **Personalized Experience**: Enjoy custom welcome messages and notifications
- **Video Content**: Access curated workout videos from fitness experts
- **Music Integration**: Generate Spotify playlists matched to workout intensity

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Design**: Tailwind CSS with shadcn components
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Secure session-based authentication

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fittrack.git
   cd fittrack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/fittrack
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared types and schemas
- `/db` - Database models and migrations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Apple Fitness app
- Workout videos courtesy of Chloe Ting
- Music integration powered by Spotify API
=======
# fittrack
FitTrack: A web-based fitness app inspired by Apple Fitness, featuring activity rings, workout tracking, and personalized insights. Built with React, TypeScript, Node.js, and PostgreSQL for a seamless cross-platform experience with elegant visualizations.
>>>>>>> 
