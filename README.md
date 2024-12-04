# Progresso - Interactive Learning Platform

A learning platform designed for students to learn programming through video courses and project submissions. Built with React and Firebase, focusing on simplicity and essential progress tracking.

## Core Features

- **Google Authentication**: Secure sign-in using Google accounts
- **Video Courses**: Watch programming tutorials with progress tracking
- **Project Submissions**: Submit projects via GitHub links
- **Progress Tracking**: Track completed videos and projects
- **Quiz Links**: Access external quiz platforms
- **Admin Dashboard**: Manage courses and review project submissions

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Firebase (Authentication, Firestore)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Video Player**: React Player

## Progress Tracking System

### For Students
- Track completed videos (marked when 90% watched)
- Submit and track project submissions
- View personal progress on dashboard

### For Admins
- Review project submissions
- Track student progress
- Manage course content

## Project Structure
```
progresso/
├── src/
│ ├── components/ # Core UI components
│ │ ├── CourseCard.js # Course display
│ │ ├── Header.js # Navigation header
│ │ ├── ProgressCard.js # Progress display
│ │ ├── VideoPlayer.js # Video playback
│ │ └── ProjectSubmission.js # Project submission
│ ├── contexts/
│ │ └── AuthContext.js # Authentication state
│ ├── hooks/
│ │ └── useFirebase.js # Firebase operations
│ ├── pages/ # Main pages
│ │ ├── Dashboard.js # User dashboard
│ │ ├── CoursePage.js # Course view
│ │ └── AdminDashboard.js # Admin panel
│ └── services/
│ └── firebase.js # Firebase config
└── firestore.rules # Security rules
```