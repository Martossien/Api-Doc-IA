# Contributing Guide - Api-Doc-IA

> Guidelines for contributing to the Api-Doc-IA document processing system

## 🎯 Welcome Contributors!

Thank you for your interest in improving Api-Doc-IA! This guide will help you understand our development process, coding standards, and how to submit quality contributions.

## 📋 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Python 3.11+** installed
- **Node.js 18+** and npm
- **Git** with proper configuration
- **Docker** (optional, for containerized testing)
- **Understanding of Open WebUI architecture** (recommended)

### Development Environment Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub first
   git clone https://github.com/YOUR_USERNAME/Api-Doc-IA.git
   cd Api-Doc-IA
   ```

2. **Set Up Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```

3. **Set Up Frontend**
   ```bash
   cd ..
   npm install
   npm run dev  # Start development server
   ```

4. **Start Development Server**
   ```bash
   export PYTHONPATH="/path/to/Api-Doc-IA/backend:$PYTHONPATH"
   ./start_with_local_code.sh
   ```

## 🎨 Code Standards

### Python Code Style

We follow **PEP 8** with some specific conventions:

```python
# Good: Clear, descriptive function names
async def process_document_with_llm(content: str, prompt: str) -> ProcessingResult:
    """Process document content using LLM with specified prompt."""
    pass

# Good: Type hints for all function parameters and returns
def validate_file_format(file_path: Path, allowed_formats: Set[str]) -> bool:
    """Validate if file format is in allowed list."""
    pass

# Good: Comprehensive docstrings
class DocumentAdapter:
    """
    Adapter for bridging API v2 requests with Open WebUI core functionality.
    
    This class handles parameter mapping, configuration management, and
    orchestrates document processing workflows.
    """
    
    async def process_document_async(
        self, 
        request: Request, 
        file: UploadFile, 
        parameters: ProcessingParameters
    ) -> TaskResponse:
        """
        Process document asynchronously with specified parameters.
        
        Args:
            request: FastAPI request object for configuration access
            file: Uploaded document file
            parameters: Processing configuration parameters
            
        Returns:
            TaskResponse containing task ID and initial status
            
        Raises:
            ValidationError: If file or parameters are invalid
            ProcessingError: If document processing fails
        """
        pass
```

### JavaScript/TypeScript Style

For frontend components:

```typescript
// Good: Component with proper typing
interface ApiV2SettingsProps {
  config: ApiV2Config;
  onConfigChange: (config: ApiV2Config) => void;
}

export const ApiV2Settings: React.FC<ApiV2SettingsProps> = ({ 
  config, 
  onConfigChange 
}) => {
  // Component implementation
};

// Good: Clear function names and documentation
/**
 * Validates API key format and generates visual feedback
 * @param apiKey - The API key to validate
 * @returns Validation result with status and message
 */
const validateApiKey = (apiKey: string): ValidationResult => {
  // Implementation
};
```

### Code Formatting

**Python Formatting:**
```bash
# Install formatting tools
pip install black isort flake8

# Format code
black .
isort .
flake8 .
```

**Frontend Formatting:**
```bash
# Format with Prettier
npm run format

# Lint with ESLint
npm run lint
```

## 🧪 Testing Guidelines

### Testing Strategy

Our testing approach covers multiple levels:

1. **Unit Tests** - Individual function/method testing
2. **Integration Tests** - Component interaction testing
3. **API Tests** - End-to-end API functionality
4. **Format Tests** - Document processing with various file types

### Writing Tests

**Backend Tests (pytest):**

```python
# tests/test_adapter.py
import pytest
from unittest.mock import AsyncMock, MagicMock
from api_v2.adapter import DocumentAdapter

class TestDocumentAdapter:
    """Test suite for DocumentAdapter functionality."""
    
    @pytest.fixture
    def adapter(self):
        """Create DocumentAdapter instance for testing."""
        return DocumentAdapter()
    
    @pytest.mark.asyncio
    async def test_process_document_success(self, adapter):
        """Test successful document processing."""
        # Arrange
        mock_request = MagicMock()
        mock_file = AsyncMock()
        parameters = {"prompt": "Test prompt", "temperature": 0.7}
        
        # Act
        result = await adapter.process_document_async(
            mock_request, mock_file, parameters
        )
        
        # Assert
        assert result.status == "processing"
        assert result.task_id is not None
    
    def test_parameter_mapping(self, adapter):
        """Test parameter mapping to Open WebUI configuration."""
        # Test parameter mapping logic
        api_params = {"pdf_extract_images": True, "chunk_size": 1000}
        mapped = adapter.map_parameters(api_params)
        
        assert mapped["PDF_EXTRACT_IMAGES"] is True
        assert mapped["CHUNK_SIZE"] == 1000
```

**Frontend Tests (Jest/Vitest):**

```typescript
// tests/ApiV2Settings.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiV2Settings } from '../components/ApiV2Settings';

describe('ApiV2Settings', () => {
  const mockConfig = {
    enabled: true,
    maxConcurrentTasks: 6,
    maxFileSizeMB: 50
  };
  
  const mockOnConfigChange = jest.fn();
  
  it('renders configuration options correctly', () => {
    render(
      <ApiV2Settings 
        config={mockConfig} 
        onConfigChange={mockOnConfigChange} 
      />
    );
    
    expect(screen.getByText('API v2 Configuration')).toBeInTheDocument();
    expect(screen.getByDisplayValue('6')).toBeInTheDocument();
  });
  
  it('calls onConfigChange when settings are modified', () => {
    render(
      <ApiV2Settings 
        config={mockConfig} 
        onConfigChange={mockOnConfigChange} 
      />
    );
    
    const input = screen.getByLabelText('Max Concurrent Tasks');
    fireEvent.change(input, { target: { value: '8' } });
    
    expect(mockOnConfigChange).toHaveBeenCalledWith({
      ...mockConfig,
      maxConcurrentTasks: 8
    });
  });
});
```

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=api_v2

# Frontend tests
npm test

# API integration tests
python test_formats_final.py

# Specific format testing
python test_individual_formats.py document.pdf
```

## 🔧 Development Workflow

### Branch Strategy

We use **GitHub Flow** with feature branches:

```bash
# Create feature branch
git checkout -b feature/add-webhook-notifications

# Make changes and commit
git add .
git commit -m "feat: add webhook notification system for task completion"

# Push and create PR
git push origin feature/add-webhook-notifications
```

### Commit Message Convention

Follow **Conventional Commits** specification:

```bash
# Format: type(scope): description

# Examples:
feat(api): add batch processing endpoint
fix(adapter): resolve parameter mapping issue with chunk_size
docs(readme): update installation instructions
test(formats): add comprehensive DOCX processing tests
refactor(config): simplify parameter validation logic
perf(processing): optimize memory usage during large file processing
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `test`: Test additions/modifications
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### Pull Request Process

1. **Pre-PR Checklist:**
   - [ ] Code follows style guidelines
   - [ ] Tests written and passing
   - [ ] Documentation updated
   - [ ] No breaking changes (or properly documented)
   - [ ] Commit messages follow convention

2. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes and motivation.
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

3. **Review Process:**
   - All PRs require at least one review
   - Address review feedback promptly
   - Keep PRs focused and reasonably sized
   - Update documentation as needed

## 🏗️ Architecture Guidelines

### Adding New Features

When adding features to Api-Doc-IA:

1. **Follow the 95% Reuse Principle**
   ```python
   # Good: Reuse existing Open WebUI components
   from open_webui.models.users import Users
   from open_webui.utils.auth import get_verified_user
   
   # Avoid: Creating custom user management
   ```

2. **Maintain Dynamic Configuration Pattern**
   ```python
   # Good: Parameter mapping with restoration
   def apply_request_parameters(self, request, params):
       original_config = self.backup_config(request.app.state.config)
       # Apply parameters
       return original_config
   
   # Bad: Global configuration changes
   ```

3. **Use Async-First Design**
   ```python
   # Good: Async processing with progress tracking
   async def process_document(self, file, params):
       task = await self.create_task()
       # Background processing
       return task
   
   # Bad: Synchronous blocking operations
   ```

### API Design Guidelines

**Endpoint Design:**
```python
# Good: RESTful, clear purpose
@router.post("/process", response_model=TaskResponse)
@router.get("/status/{task_id}", response_model=TaskStatus)
@router.get("/models", response_model=ModelsResponse)

# Bad: Unclear or non-RESTful endpoints
@router.post("/do_something")
@router.get("/get_status")
```

**Error Handling:**
```python
# Good: Structured error responses
@router.post("/process")
async def process_document(...):
    try:
        # Processing logic
        pass
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Validation failed",
                "error_code": "VALIDATION_ERROR",
                "details": str(e)
            }
        )
```

## 📚 Documentation Guidelines

### Code Documentation

**Docstring Standards:**
```python
def validate_processing_parameters(params: Dict[str, Any]) -> ProcessingParameters:
    """
    Validate and normalize processing parameters.
    
    This function ensures all parameters are within acceptable ranges and
    converts string values to appropriate types for processing.
    
    Args:
        params: Raw parameter dictionary from API request
        
    Returns:
        ProcessingParameters: Validated and normalized parameters
        
    Raises:
        ValidationError: If any parameter is invalid or out of range
        
    Example:
        >>> params = {"temperature": "0.7", "max_tokens": "2000"}
        >>> validated = validate_processing_parameters(params)
        >>> validated.temperature
        0.7
    """
```

**Inline Comments:**
```python
# Backup configuration before applying request-specific parameters
# This ensures we can restore the original state after processing
original_config = self.backup_configuration(request.app.state.config)

# Apply parameter mappings using our configuration system
for api_param, config_key in self.config_mappings.items():
    if api_param in local_params:
        setattr(request.app.state.config, config_key, local_params[api_param])
```

### README and Documentation

- Keep documentation current with code changes
- Include working examples and use cases
- Document breaking changes clearly
- Provide migration guides when needed

## 🐛 Bug Reports

### Issue Template

When reporting bugs, include:

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Upload document type X
2. Use parameters Y
3. Observe error Z

**Expected Behavior**
What should have happened

**Actual Behavior**
What actually happened

**Environment**
- OS: 
- Python version:
- Api-Doc-IA version:
- Browser (if frontend issue):

**Additional Context**
- Log snippets
- Screenshots
- Configuration details
```

## 🚀 Feature Requests

### Enhancement Template

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
What other approaches were considered?

**Additional Context**
- Implementation ideas
- Related issues
- Examples from other projects
```

## 🏷️ Release Process

### Versioning Strategy

We follow **Semantic Versioning (SemVer)**:

- **MAJOR.MINOR.PATCH** (e.g., 2.1.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Pre-Release:**
   - [ ] All tests passing
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated
   - [ ] Version numbers updated

2. **Release:**
   - [ ] Create release branch
   - [ ] Tag release version
   - [ ] Build and test artifacts
   - [ ] Publish release notes

3. **Post-Release:**
   - [ ] Monitor for issues
   - [ ] Update documentation site
   - [ ] Announce in community channels

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Focus on technical merit
- Maintain professionalism

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community chat
- **Pull Requests**: Code review and collaboration

### Recognition

Contributors are recognized in:
- CHANGELOG.md for significant contributions
- README.md contributors section
- Release notes for major features

## 📋 Development Tasks

### Good First Issues

Looking to contribute? Start with these areas:

**Documentation:**
- Improve API examples
- Add troubleshooting guides
- Create video tutorials
- Translate documentation

**Testing:**
- Add test cases for edge cases
- Improve test coverage
- Create performance benchmarks
- Add browser compatibility tests

**Features:**
- Implement webhook notifications
- Add batch processing endpoints
- Create monitoring dashboards
- Develop SDK libraries

**Bug Fixes:**
- Improve error handling
- Fix edge cases in file processing
- Optimize memory usage
- Enhance validation logic

### Development Tools

**Recommended IDE Setup:**
```bash
# VS Code extensions
ext install ms-python.python
ext install ms-python.black-formatter
ext install bradlc.vscode-tailwindcss
ext install esbenp.prettier-vscode
```

**Debugging:**
```python
# Enable debug logging
export LOG_LEVEL="DEBUG"
export API_V2_DEBUG=true

# Use debugger
import pdb; pdb.set_trace()
```

## 📞 Getting Help

### Support Channels

1. **Documentation**: Check existing docs first
2. **GitHub Issues**: Search existing issues
3. **GitHub Discussions**: Ask questions
4. **Code Review**: Request help in PR comments

### Mentorship

New contributors can:
- Tag maintainers in issues for guidance
- Request code review feedback
- Ask questions in GitHub Discussions
- Join community development calls

---

**Thank you for contributing to Api-Doc-IA!** Your contributions help make document processing more accessible and powerful for everyone. 🚀

## 📋 Contributor Checklist

Before submitting your first contribution:

- [ ] Read and understand this contributing guide
- [ ] Set up development environment
- [ ] Run existing tests successfully
- [ ] Choose an issue to work on
- [ ] Follow the pull request process
- [ ] Celebrate your contribution! 🎉

**Welcome to the Api-Doc-IA community!** 🎯