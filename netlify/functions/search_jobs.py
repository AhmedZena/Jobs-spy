import json
import hashlib
from datetime import datetime
from jobspy import scrape_jobs
import pandas as pd


def handler(event, context):
    """
    Netlify serverless function to search jobs across multiple platforms
    """
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': ''
        }

    try:
        # Parse request body
        if event.get('httpMethod') != 'POST':
            return {
                'statusCode': 405,
                'headers': {
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }

        body = json.loads(event.get('body', '{}'))
        search_term = body.get('search_term', '')
        location = body.get('location', '')
        job_type = body.get('job_type', None)
        is_remote = body.get('is_remote', None)
        results_wanted = int(body.get('results_wanted', 50))
        hours_old = int(body.get('hours_old', 72))

        if not search_term:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'search_term is required'})
            }

        # Define sites to search
        sites = ['indeed', 'linkedin', 'zip_recruiter', 'google']

        # Scrape jobs from multiple sites
        print(f"Searching for '{search_term}' in '{location}'...")
        jobs_df = scrape_jobs(
            site_name=sites,
            search_term=search_term,
            location=location,
            results_wanted=results_wanted,
            hours_old=hours_old,
            country_indeed='USA',
            job_type=job_type,
            is_remote=is_remote
        )

        if jobs_df is None or jobs_df.empty:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'jobs': [],
                    'total': 0,
                    'message': 'No jobs found'
                })
            }

        # Deduplicate jobs based on title and company
        jobs_df['job_hash'] = jobs_df.apply(
            lambda row: hashlib.md5(
                f"{row.get('title', '')}{row.get('company', '')}{row.get('location', '')}".lower().encode()
            ).hexdigest(),
            axis=1
        )

        # Remove duplicates
        jobs_df = jobs_df.drop_duplicates(subset=['job_hash'], keep='first')

        # Convert to JSON-serializable format
        jobs_list = []
        for idx, row in jobs_df.iterrows():
            job = {
                'id': row.get('job_hash', str(idx)),
                'title': row.get('title', 'N/A'),
                'company': row.get('company', 'N/A'),
                'location': row.get('location', 'N/A'),
                'job_type': row.get('job_type', 'N/A'),
                'date_posted': str(row.get('date_posted', 'N/A')),
                'salary': row.get('interval', 'N/A') if pd.notna(row.get('interval')) else 'N/A',
                'job_url': row.get('job_url', '#'),
                'description': row.get('description', 'N/A')[:500] if pd.notna(row.get('description')) else 'N/A',
                'site': row.get('site', 'N/A'),
                'is_remote': row.get('is_remote', False)
            }
            jobs_list.append(job)

        # Sort by date posted (newest first)
        jobs_list.sort(key=lambda x: x['date_posted'], reverse=True)

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'jobs': jobs_list,
                'total': len(jobs_list),
                'search_term': search_term,
                'location': location,
                'timestamp': datetime.now().isoformat()
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to fetch jobs'
            })
        }
