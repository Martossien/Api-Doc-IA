# Tool Import Utility

This utility helps import tools in the correct format for the Open WebUI application. It can handle both the standard ToolForm format and the marketplace format, automatically converting as needed.

## Usage

```bash
# Using a token environment variable
export TOKEN="your-jwt-token"
python scripts/import_tool.py path/to/tool.json

# Passing token directly
python scripts/import_tool.py --token "your-jwt-token" path/to/tool.json

# Using custom API URL
python scripts/import_tool.py --api-url "http://your-api-url:8080" --token "your-jwt-token" path/to/tool.json
```

## Features

1. **Automatic Format Detection**: Automatically detects if the JSON file is in marketplace format or ToolForm format
2. **Format Conversion**: Converts marketplace format to ToolForm format when needed
3. **Validation**: Validates required fields before importing
4. **Error Handling**: Provides clear error messages for troubleshooting

## Supported Formats

### ToolForm Format (Direct Import)
```json
{
  "id": "tool_id",
  "name": "Tool Name",
  "content": "class Tools:\n    def method(self):\n        return 'result'",
  "meta": {
    "description": "Tool description",
    "manifest": {
      "version": "1.0"
    }
  }
}
```

### Marketplace Format (Auto-converted)
```json
[
  {
    "id": "unique_id",
    "userId": "user_id",
    "tool": {
      "id": "tool_id",
      "name": "Tool Name",
      "content": "class Tools:\n    def method(self):\n        return 'result'",
      "meta": {
        "description": "Tool description",
        "manifest": {
          "version": "1.0"
        }
      }
    }
  }
]
```

## Requirements

- Python 3.6+
- requests library (`pip install requests`)

## Troubleshooting

### Common Issues

1. **Authentication Error**: Make sure your token is valid and has the correct permissions
2. **Invalid Format**: Ensure your JSON file is properly formatted
3. **Missing Fields**: Verify that required fields (id, name, content) are present

### Error Messages

- `No authentication token provided`: Set the TOKEN environment variable or use --token argument
- `Missing required field`: Check that your JSON file contains id, name, and content fields
- `Failed to import tool`: Check the API response for more details

## Examples

### Basic Import
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
python scripts/import_tool.py my_tool.json
```

### Import with Custom API URL
```bash
python scripts/import_tool.py --api-url "http://192.168.1.100:8080" --token "your-token" my_tool.json
```

## Development

To extend this utility:

1. Add new format converters to the `convert_*_to_toolform` functions
2. Add validation rules to the validation section
3. Extend the command-line arguments as needed

## License

MIT License