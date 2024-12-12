# Beach Volleyball Tournament Tracker

A web application designed to track and manage beach volleyball tournament stages and player rankings. The system maintains individual player scores across multiple tournament stages and generates a comprehensive global ranking.

## Features

- Track multiple beach volleyball tournament stages
- Record and manage individual player performances
- Automatic scoring system:
  - Points are awarded to the top 8 players in each tournament stage
  - Players finishing below 8th position receive 0 points
- Global ranking system that aggregates player performances across all tournament stages
- Player profile management
- Tournament stage creation and management

## Prerequisites

- A Supabase account is required for database functionality and authentication
- Node.js and npm installed on your system

## Development

Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Environment Setup

Make sure to configure your Supabase credentials in the environment variables before running the application.
