# MixMatch Backend

MixMatch is your all-in-one DJ planning and booking app, designed for event organizers and DJs to connect effortlessly. Whether you're planning a wedding, club night, festival, or private party, MixMatch helps you find the perfect DJ, manage schedules, and handle bookings with ease.

## 🚀 Technology Stack

- NestJS - A progressive Node.js framework
- TypeScript - For type safety and better developer experience
- ESLint - Code quality and style consistency
- Prettier - Code formatting

## 📁 Project Structure

The project follows this architecture:

```
src/
├── app/                    # Core application files
│   ├── features/           # Feature modules
│   └── lib/                # Shared library code
├── common/                 # Common utilities and shared resources
│   ├── dtos/               # Data Transfer Objects
│   ├── exception/          # Custom exceptions
│   ├── interceptors/       # Request/response interceptors
│   └── middlewares/        # HTTP middlewares
├── main.ts                 # Application entry point
└── test/                   # Test files
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- NestJS CLI (`npm i -g @nestjs/cli`)

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/MixMatch-Inc/MixMatch-Backend.git
cd MixMatch-Backend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run start:dev
```

The server will be running at `http://localhost:3000`

## 📦 Available Scripts

- `npm run start` - Start the application in standard mode
- `npm run start:dev` - Start the application in development mode with hot-reload
- `npm run start:debug` - Start the application in debug mode
- `npm run build` - Build the application
- `npm run format` - Format code using Prettier
- `npm run lint` - Lint the codebase
- `npm run test` - Run unit tests
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:cov` - Run unit tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
