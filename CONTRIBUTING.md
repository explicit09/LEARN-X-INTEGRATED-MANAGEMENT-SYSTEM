# Contributing to LIMS

Thank you for your interest in contributing to LIMS (LEARN-X Integrated Management System)! We're excited to have you join our community of developers working to improve educational technology.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Setup](#development-setup)
5. [Pull Request Process](#pull-request-process)
6. [Style Guidelines](#style-guidelines)
7. [Reporting Issues](#reporting-issues)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

## Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lims.git
   cd lims
   ```
3. **Set up the development environment** (see Development Setup below)
4. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Types of Contributions

- **Bug fixes**: Help us squash bugs and improve stability
- **Feature development**: Add new functionality to LIMS
- **Documentation**: Improve our docs, add examples, or fix typos
- **Testing**: Write tests or improve test coverage
- **Performance**: Optimize code for better performance
- **UI/UX improvements**: Enhance the user interface and experience

### Finding Issues to Work On

- Look for issues labeled `good first issue` for beginner-friendly tasks
- Check issues labeled `help wanted` for areas where we need assistance
- Feel free to propose new features by opening an issue first

## Development Setup

### Prerequisites

- Node.js 20.x.x (required)
- Python 3.8+
- Git
- (Windows only) Build Tools for Visual Studio

### Setup Steps

```bash
# Check your Node.js version
node --version

# If you need Node.js 20.x.x:
# Using nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run the development server:
   ```bash
   npm start
   ```

### Project Structure

```
lims/
├── src/                 # Main application source
│   ├── features/       # Feature modules
│   ├── ui/            # User interface components
│   └── services/      # Core services
├── pickleglass_web/    # Web interface
├── public/            # Static assets
└── tests/             # Test files
```

## Pull Request Process

1. **Ensure your code follows our style guidelines**
2. **Write or update tests** for your changes
3. **Update documentation** if needed
4. **Ensure all tests pass**:
   ```bash
   npm test
   npm run lint
   ```
5. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "feat: add new feature X"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request** from your fork to our main branch

### PR Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested your changes
- **Issues**: Reference any related issues (e.g., "Fixes #123")

## Style Guidelines

### Code Style

- Use ESLint configuration provided in the project
- Follow existing code patterns and conventions
- Write clear, self-documenting code
- Add comments for complex logic

### Commit Messages

We follow conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

Example: `feat: add student progress tracking dashboard`

### JavaScript/TypeScript

- Use ES6+ features
- Prefer async/await over callbacks
- Use meaningful variable and function names
- Keep functions small and focused

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to reproduce**: How to trigger the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: OS, Node version, etc.
6. **Screenshots/logs**: If applicable

### Feature Requests

For feature requests, please describe:

1. **Use case**: Why this feature would be useful
2. **Proposed solution**: How you envision it working
3. **Alternatives**: Other approaches you've considered

## Building for Production

```bash
# Ensure you can make a full production build before pushing
npm run build:all

# Platform-specific builds
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Linting

Always run the linter before committing:

```bash
npm run lint
```

Fix any errors before creating your pull request.

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Open a new issue with your question
3. Join our community discussions

Thank you for contributing to LIMS! Together, we're building better educational technology.

---

Made with ❤️ by the LEARN-X Team