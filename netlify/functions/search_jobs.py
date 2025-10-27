import json
import hashlib
import traceback
from datetime import datetime

# Try importing dependencies with error handling
try:
    from jobspy import scrape_jobs
    import pandas as pd
    print("Successfully imported jobspy and pandas", file=sys.stderr)
except Exception as import_error:
    print(f"IMPORT ERROR: {str(import_error)}", file=sys.stderr)
    print(traceback.format_exc(), file=sys.stderr)


def handler(event, context):
    """
    Netlify serverless function to search jobs across multiple platforms
    """
    print(f"Function invoked: {event.get('httpMethod')} {event.get('path')}")

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
        print("Starting job search handler...")
        # Parse request body
        if event.get('httpMethod') != 'POST':
            return {
                'statusCode': 405,
                'headers': {
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }

        print("Parsing request body...")
        body = json.loads(event.get('body', '{}'))
        search_term = body.get('search_term', '')
        location = body.get('location', '')
        job_type = body.get('job_type', None)
        is_remote_raw = body.get('is_remote', None)
        # Convert is_remote to boolean (JobSpy requires boolean, not None)
        if is_remote_raw == 'true':
            is_remote = True
        elif is_remote_raw == 'false':
            is_remote = False
        else:
            is_remote = False  # Default to False when not specified
        results_wanted = min(int(body.get('results_wanted', 20)), 20)  # Limit to 20 to avoid timeout
        hours_old = int(body.get('hours_old', 72))

        print(f"Search params: term={search_term}, location={location}, results={results_wanted}")

        if not search_term:
            print("ERROR: No search term provided")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'search_term is required'})
            }

        # Start with just Indeed to avoid timeout (most reliable according to docs)
        sites = ['indeed']

        print(f"Searching {sites} for '{search_term}' in '{location}'...")
        print(f"Results wanted: {results_wanted}, Hours old: {hours_old}")

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

        print(f"JobSpy returned: {type(jobs_df)}")

        if jobs_df is None or jobs_df.empty:
            print("No jobs found, returning empty result")
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

        print(f"Found {len(jobs_df)} jobs, processing...")

        # Deduplicate jobs based on title and company
        jobs_df['job_hash'] = jobs_df.apply(
            lambda row: hashlib.md5(
                f"{row.get('title', '')}{row.get('company', '')}{row.get('location', '')}".lower().encode()
            ).hexdigest(),
            axis=1
        )

        # Remove duplicates
        jobs_df = jobs_df.drop_duplicates(subset=['job_hash'], keep='first')
        print(f"After deduplication: {len(jobs_df)} unique jobs")

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

        print(f"Returning {len(jobs_list)} jobs to client")

        result = {
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

        print("Successfully created response")
        return result

    except Exception as e:
        error_details = {
            'error': str(e),
            'type': type(e).__name__,
            'message': 'Failed to fetch jobs'
        }

        print(f"ERROR CAUGHT: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print(traceback.format_exc())

        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(error_details)
        }
