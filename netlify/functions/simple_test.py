import json

def handler(event, context):
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Hello from Python!',
            'method': event.get('httpMethod'),
            'path': event.get('path'),
            'status': 'success'
        })
    }