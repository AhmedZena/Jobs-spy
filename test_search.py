#!/usr/bin/env python3

import json
import sys
import os

# Add the netlify functions directory to the path
sys.path.insert(0, '/workspace/netlify/functions')

# Import the handler
from search_jobs import handler

def test_search():
    """Test the search_jobs function with a simple search"""
    
    # Create a test event
    test_event = {
        'httpMethod': 'POST',
        'path': '/search_jobs',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'search_term': 'software engineer',
            'location': 'San Francisco',
            'job_type': '',
            'is_remote': '',
            'results_wanted': 5,
            'hours_old': 72
        })
    }
    
    test_context = {}
    
    print("Testing search_jobs function...")
    print(f"Event: {json.dumps(test_event, indent=2)}")
    print("\n" + "="*50)
    
    try:
        result = handler(test_event, test_context)
        print(f"Status Code: {result['statusCode']}")
        print(f"Headers: {result['headers']}")
        
        # Try to parse the body as JSON
        try:
            body_data = json.loads(result['body'])
            print(f"Body (parsed): {json.dumps(body_data, indent=2)}")
        except json.JSONDecodeError as e:
            print(f"Body (raw): {result['body']}")
            print(f"JSON Parse Error: {e}")
            
    except Exception as e:
        print(f"Error calling handler: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_search()