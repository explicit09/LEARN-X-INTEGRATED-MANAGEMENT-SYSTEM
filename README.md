<p align="center">
  <h1 align="center">LIMS: LEARN-X Integrated Management System 🎓</h1>
</p>

<p align="center">
  <strong>An AI-powered educational management system for modern learning</strong>
</p>

## Overview

**LIMS (LEARN-X Integrated Management System)** is a comprehensive educational technology platform that leverages AI to enhance the learning experience. Built on modern web technologies, LIMS provides real-time assistance, intelligent content management, and seamless integration with educational workflows.

### Key Features

🤖 **AI-Powered Assistance** - Intelligent real-time support for educators and learners

📚 **Content Management** - Organize and manage educational resources efficiently

🔄 **Real-time Collaboration** - Live interaction and knowledge sharing

🔒 **Privacy-First Design** - Your data stays secure and private

⚡ **Fast & Lightweight** - Optimized performance for desktop environments

## Installation

### Prerequisites

- Node.js 20.x.x (required for native dependencies)
- Python 3.8+
- npm or yarn

```bash
# Check your Node.js version
node --version

# If you need Node.js 20.x.x:
# Using nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Quick Start

```bash
# Clone the repository
git clone [your-repo-url]
cd lims

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the application
npm start
```

### Building from Source

```bash
# Build for development
npm run build

# Build for production (all platforms)
npm run build:all

# Platform-specific builds
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT Configuration
JWT_SECRET=your_jwt_secret

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your_openai_key
```

## Architecture

LIMS uses a modern architecture with:

- **Frontend**: Electron + React
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL) + SQLite (local)
- **AI Integration**: OpenAI, Anthropic, Google Gemini
- **Real-time**: WebSockets for live updates

## Development

### Project Structure

```
lims/
├── src/                 # Main application source
│   ├── features/       # Feature modules
│   ├── ui/            # User interface components
│   └── services/      # Core services
├── pickleglass_web/    # Web interface
├── public/            # Static assets
└── .claude/           # Development sessions
```

### Running in Development

```bash
# Start with hot reload
npm run watch:renderer

# Run tests
npm test

# Lint code
npm run lint
```

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GPL-3.0 License - see the LICENSE file for details.

## Acknowledgments

- Built with Electron, React, and Supabase
- AI integrations powered by OpenAI, Anthropic, and Google
- Special thanks to all contributors

---

<p align="center">
  Made with ❤️ by the LEARN-X Team
</p>