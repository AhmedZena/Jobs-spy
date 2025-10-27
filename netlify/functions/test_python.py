import json

def handler(event, context):
    """
    Simple test function to verify Python functions work on Netlify
    """
    print("Python test function called")
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Python function is working!',
            'timestamp': '2024-01-01T00:00:00Z',
            'python_version': '3.11'
        })
    }