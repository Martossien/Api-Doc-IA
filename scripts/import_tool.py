#!/usr/bin/env python3
"""
Tool Import Utility

This script helps import tools in the correct format for the Open WebUI application.
It can convert marketplace format JSON to the correct ToolForm format and import tools.
"""

import json
import requests
import argparse
import sys
import os

def convert_marketplace_to_toolform(marketplace_data):
    """
    Convert marketplace format JSON to ToolForm format
    
    Args:
        marketplace_data: Marketplace format data (list or dict)
        
    Returns:
        dict: ToolForm format data
    """
    # Handle both list and dict formats
    if isinstance(marketplace_data, list) and len(marketplace_data) > 0:
        tool_data = marketplace_data[0]
    elif isinstance(marketplace_data, dict):
        tool_data = marketplace_data
    else:
        raise ValueError("Invalid marketplace data format")
    
    # Extract tool information
    if 'tool' in tool_data:
        tool = tool_data['tool']
    else:
        tool = tool_data
    
    # Convert to ToolForm format
    toolform = {
        "id": tool.get("id", ""),
        "name": tool.get("name", ""),
        "content": tool.get("content", ""),
        "meta": tool.get("meta", {
            "description": tool.get("description", ""),
            "manifest": tool.get("manifest", {})
        }),
        "access_control": tool.get("access_control", None)
    }
    
    return toolform

def import_tool(api_url, token, tool_file_path):
    """
    Import a tool from a JSON file
    
    Args:
        api_url: Base URL of the API
        token: Authentication token
        tool_file_path: Path to the tool JSON file
        
    Returns:
        bool: True if successful, False otherwise
    """
    # Read the tool file
    try:
        with open(tool_file_path, 'r') as f:
            tool_data = json.load(f)
    except Exception as e:
        print(f"Error reading tool file: {e}")
        return False
    
    # Check if this is marketplace format and convert if needed
    try:
        # Try to detect marketplace format
        if isinstance(tool_data, list) and len(tool_data) > 0:
            if isinstance(tool_data[0], dict) and ('tool' in tool_data[0] or 'id' in tool_data[0]):
                print("Detected marketplace format, converting to ToolForm format...")
                tool_data = convert_marketplace_to_toolform(tool_data)
        elif isinstance(tool_data, dict) and ('tool' in tool_data or 'id' in tool_data):
            if 'tool' in tool_data:
                print("Detected marketplace format, converting to ToolForm format...")
                tool_data = convert_marketplace_to_toolform(tool_data)
    except Exception as e:
        print(f"Error converting tool format: {e}")
        return False
    
    # Validate required fields
    required_fields = ['id', 'name', 'content']
    for field in required_fields:
        if field not in tool_data or not tool_data[field]:
            print(f"Error: Missing required field '{field}' in tool data")
            return False
    
    # Prepare headers
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Send request to create tool
    try:
        response = requests.post(
            f"{api_url}/api/v1/tools/create",
            headers=headers,
            json=tool_data
        )
        
        if response.status_code == 200:
            print(f"✓ Successfully imported tool: {tool_data['name']}")
            return True
        else:
            print(f"✗ Failed to import tool: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error importing tool: {e}")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Tool Import Utility")
    parser.add_argument("tool_file", help="Path to the tool JSON file")
    parser.add_argument("--api-url", default="http://localhost:8080", help="API base URL")
    parser.add_argument("--token", help="Authentication token")
    parser.add_argument("--token-env", default="TOKEN", help="Environment variable containing the token")
    
    args = parser.parse_args()
    
    # Get token from argument or environment variable
    token = args.token or os.environ.get(args.token_env)
    if not token:
        print(f"Error: No authentication token provided. Please use --token or set {args.token_env} environment variable.")
        return False
    
    # Import the tool
    return import_tool(args.api_url, token, args.tool_file)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)