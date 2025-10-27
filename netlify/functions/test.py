import json
import sys

def handler(event, context):
    """
    Simple test endpoint to verify serverless functions are working
    """
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'success',
            'message': 'Serverless function is working!',
            'python_version': sys.version,
            'event': {
                'httpMethod': event.get('httpMethod'),
                'path': event.get('path'),
                'headers': dict(event.get('headers', {}))
            }
        })
    }
