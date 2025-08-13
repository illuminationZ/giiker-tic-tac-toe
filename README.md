# Tic-Tac-Toe Online 🎮

A revolutionary online multiplayer Tic-Tac-Toe game inspired by an innovative Tic-Tac-Toe Bolt, featuring the **Infinite Mode** where strategy truly matters!

![Game Preview](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=GiiKER+Tic-Tac-Toe+Online)

## 🌟 Features

### 🎯 Game Modes
- **Infinite Tic-Tac-Toe**: Each player can only have 3 pieces on the board. When you place a 4th piece, your oldest piece disappears!
- **Real-time Multiplayer**: Play with friends or random opponents online
- **Private Games**: Create private rooms with game codes

### 👥 Social Features
- **User Registration & Authentication**: Secure account system
- **Friends System**: Add friends, see who's online, and invite them to games
- **Game History**: Track all your past games and statistics
- **Player Statistics**: Win/loss ratios, streaks, and performance metrics

### 💻 Technical Features
- **Real-time Communication**: Powered by Socket.IO for instant gameplay
- **Responsive Design**: Play on desktop, tablet, or mobile
- **Dark/Light Theme**: Toggle between themes for comfortable gaming
- **Offline-first Database**: SQLite for development, easily scalable to PostgreSQL

### 🚀 What Makes This Special?

Unlike traditional Tic-Tac-Toe, where games often end in draws, **Infinite Mode** introduces strategic depth:

- **Limited Pieces**: Only 3 pieces per player on the board at any time
- **Dynamic Board**: Oldest pieces disappear when you place your 4th piece
- **Strategic Planning**: Think ahead about which pieces to sacrifice
- **No More Draws**: Games are more dynamic and engaging

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.IO for real-time features
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js with credential-based auth
- **UI/UX**: Custom components, Lucide icons, responsive design
- **State Management**: React Context + Zustand for game state

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm 8+

### 1. Clone the Repository
```bash
git clone <repository-url>
cd giiker-tic-tac-toe
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this"
```

### 4. Set Up Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Start Development Servers

**Option A: Start both servers together (recommended)**
```bash
npm run dev:all
```

**Option B: Start servers separately**
```bash
# Terminal 1: Next.js development server
npm run dev

# Terminal 2: Socket.IO server
npm run dev:socket
```

Visit [http://localhost:3000](http://localhost:3000) to see the application!

**Note**: The Socket.IO server runs on port 3001 for real-time game features.

## 🎮 How to Play

### Getting Started
1. **Sign Up**: Create an account with email and username
2. **Sign In**: Log into your account
3. **Choose Game Mode**:
   - **Quick Match**: Join a public game
   - **Private Game**: Create a private room`
   - **Join by Code**: Enter a 6-digit game code

### Game Rules (Infinite Mode)
1. **Objective**: Get 3 of your pieces in a row (horizontal, vertical, or diagonal)
2. **Piece Limit**: Each player can have maximum 3 pieces on the board
3. **Automatic Removal**: When you place your 4th piece, your oldest piece disappears
4. **Turn-based**: Players alternate turns
5. **Winning**: First player to get 3 in a row wins
6. **Strategy**: Plan ahead - which piece will disappear next?

### Controls
- **Click** on empty cells to place your piece
- **Hover** to see ghost preview of your next move
- **Real-time** updates show opponent moves instantly

## 🏗 Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── games/         # Game management APIs
│   │   └── socket/        # Socket.IO server
│   ├── auth/              # Authentication pages
│   ├── game/              # Game pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── game/             # Game-specific components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── game-logic.ts     # Game state management
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions
    ├── next-auth.d.ts    # NextAuth type extensions
    └── socket.ts         # Socket.IO event types
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:studio       # Open Prisma Studio (database GUI)
```

## 🎨 Customization

### Themes
The app supports both light and dark themes. Users can toggle between themes using the theme switcher in the settings.

### Game Modes
Currently supports Infinite Mode. Classic mode can be easily added by modifying the game logic.

### Styling
Uses Tailwind CSS with custom game-specific color palette:
- **Primary**: Blue tones for UI elements
- **Game Colors**: Red for X, Blue for O, Green for wins
- **Board**: Dark theme with subtle shadows and animations

## 🚀 Deployment

### Environment Variables for Production
```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="secure-random-secret"
```

### Recommended Platforms
- **Vercel**: Seamless Next.js deployment with automatic HTTPS
- **Railway**: Easy database and app hosting
- **Digital Ocean**: Full control with droplets
- **Heroku**: Simple deployment with add-ons

### Database Migration
For production, switch to PostgreSQL:
1. Update `DATABASE_URL` in environment variables
2. Change provider in `prisma/schema.prisma` from `sqlite` to `postgresql`
3. Run `npm run db:push` to create tables

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Reset database
rm prisma/dev.db
npm run db:push
```

**Socket.IO Connection Problems**
- Check if port 3000 is available
- Verify NEXTAUTH_URL in environment variables
- Clear browser cache and cookies

**Build Errors**
```bash
# Clean and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Development Tips
- Use `npm run db:studio` to visually inspect your database
- Check browser console for client-side errors
- Monitor server console for API and Socket.IO logs
- Use React DevTools for component debugging

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for complex functions

## 📈 Roadmap

- [ ] **Tournament System**: Organize tournaments with brackets
- [ ] **AI Opponent**: Play against computer with different difficulty levels
- [ ] **Spectator Mode**: Watch ongoing games
- [ ] **Chat System**: In-game messaging
- [ ] **Mobile App**: React Native version
- [ ] **Game Replays**: Save and replay interesting games
- [ ] **Achievements**: Unlock achievements for various milestones
- [ ] **Rating System**: ELO-based player rankings

## 🙏 Acknowledgments

This is a personal, experimental project and does not have a license.


- For inspiring this project with an innovative Tic-Tac-Toe Bolt game
- **Next.js Team**: For the amazing React framework
- **Socket.IO**: For real-time communication capabilities
- **Tailwind CSS**: For the utility-first CSS framework
- **Prisma**: For the excellent database toolkit

This project is not officially supported and was created as a vibe coding exercise.

**Note:** This is an independent, experimental project *inspired by* the GiiKER Tic-Tac-Toe Bolt, and it was not created by GiiKER. This project is not affiliated with or endorsed by GiiKER.


---

**Made with ❤️ and ⚡ by the IlluminationZ**

Start playing now and experience the revolution in Tic-Tac-Toe! 🎮✨
