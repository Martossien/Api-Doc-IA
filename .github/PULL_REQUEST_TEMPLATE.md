# Pull Request

## 📋 Description

Brief description of the changes in this PR.

**Related Issue:** Fixes #(issue_number)

## 🔄 Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🧪 Test improvement
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement
- [ ] 🔧 Chore (maintenance, dependencies, build)

## 🧪 Testing

**How has this been tested?**

- [ ] Unit tests pass
- [ ] Integration tests pass  
- [ ] Manual testing completed
- [ ] API format tests completed (if applicable)

**Test Configuration:**
- Python version: 
- Api-Doc-IA version:
- Test files used:

**Test Results:**
```
# Paste relevant test output here
```

## 📋 Checklist

**Code Quality:**
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

**Documentation:**
- [ ] Updated README.md (if needed)
- [ ] Updated API_DOCUMENTATION.md (if API changes)
- [ ] Updated CHANGELOG.md
- [ ] Added docstrings to new functions/classes
- [ ] Updated configuration documentation (if config changes)

**Backward Compatibility:**
- [ ] This change is backward compatible
- [ ] Migration guide provided (if breaking change)
- [ ] Deprecation warnings added (if applicable)

## 🔧 Implementation Details

**Architecture:**
Describe any architectural decisions or changes:

**Performance Impact:**
Describe any performance implications:

**Security Considerations:**
Describe any security implications:

## 📊 Changes Made

**Files Modified:**
- `path/to/file1.py` - Description of changes
- `path/to/file2.py` - Description of changes

**New Files Added:**
- `path/to/new_file.py` - Purpose and functionality

**Files Removed:**
- `path/to/old_file.py` - Reason for removal

## 🔍 API Changes (if applicable)

**New Endpoints:**
```
POST /api/v2/new-endpoint - Description
```

**Modified Endpoints:**
```
PUT /api/v2/existing-endpoint - Changes made
```

**Deprecated Endpoints:**
```
DELETE /api/v2/old-endpoint - Deprecation timeline
```

**Parameter Changes:**
- Added: `new_parameter` - Description
- Modified: `existing_parameter` - How it changed
- Removed: `old_parameter` - Migration path

## 📸 Screenshots (if applicable)

**Before:**
[Screenshot of old behavior]

**After:**
[Screenshot of new behavior]

## 🧪 Testing Instructions

**For Reviewers:**

1. **Setup:**
   ```bash
   git checkout feature-branch
   # Setup instructions
   ```

2. **Test Scenarios:**
   - Test case 1: Description
   - Test case 2: Description
   - Test case 3: Description

3. **Expected Results:**
   - What should happen in each test case

**API Testing:**
```bash
# Example API calls to test
curl -X POST "http://localhost:8080/api/v2/process" \
  -H "Authorization: Bearer sk-test-key" \
  -F "file=@test.pdf" \
  -F "prompt=Test prompt"
```

## 📈 Performance Testing (if applicable)

**Benchmarks:**
- Before: X requests/second, Y MB memory
- After: X requests/second, Y MB memory

**Load Testing:**
- Concurrent tasks: X
- File sizes tested: Y MB
- Processing times: Z seconds

## 🔐 Security Review (if applicable)

**Security Checklist:**
- [ ] No sensitive data exposed in logs
- [ ] Input validation added/updated
- [ ] Authentication/authorization unchanged or improved
- [ ] No new attack vectors introduced
- [ ] Security tests added

## 🎯 Deployment Notes

**Configuration Changes:**
- New environment variables required
- Database migrations needed
- Service restart required

**Rollback Plan:**
- How to revert if issues arise

## 💬 Additional Context

**Related Work:**
- Links to related PRs or issues
- Dependencies on other changes

**Future Work:**
- Follow-up tasks or improvements planned
- Known limitations that will be addressed later

**Questions for Reviewers:**
- Specific areas where you'd like focused review
- Alternative approaches considered

---

## 👥 Review Checklist (for maintainers)

**Code Review:**
- [ ] Code follows project conventions
- [ ] Logic is sound and efficient
- [ ] Error handling is appropriate
- [ ] Tests are comprehensive
- [ ] Documentation is clear and complete

**Integration Review:**
- [ ] Changes work with existing features
- [ ] No regression in functionality
- [ ] Performance impact is acceptable
- [ ] Security implications reviewed

**Release Readiness:**
- [ ] CHANGELOG.md updated
- [ ] Version bumped (if needed)
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)

---

**Thank you for contributing to Api-Doc-IA!** 🚀