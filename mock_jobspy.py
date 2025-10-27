#!/usr/bin/env python3
"""
Mock jobspy module for testing purposes
"""

import pandas as pd
from datetime import datetime, timedelta
import random

def scrape_jobs(site_name, search_term, location, results_wanted=20, hours_old=72, 
                country_indeed='USA', job_type=None, is_remote=None):
    """
    Mock function that returns sample job data for testing
    """
    print(f"Mock scrape_jobs called with: site_name={site_name}, search_term={search_term}, location={location}")
    
    # Create sample job data
    sample_jobs = []
    for i in range(min(results_wanted, 10)):  # Limit to 10 for testing
        job = {
            'title': f'{search_term} - Position {i+1}',
            'company': f'Company {i+1}',
            'location': location or 'Remote',
            'job_type': job_type or 'fulltime',
            'date_posted': datetime.now() - timedelta(hours=random.randint(1, hours_old)),
            'interval': f'${random.randint(50000, 150000)} - ${random.randint(150000, 300000)}' if random.choice([True, False]) else None,
            'job_url': f'https://example.com/job/{i+1}',
            'description': f'This is a sample job description for {search_term} position at Company {i+1}.',
            'site': site_name[0] if isinstance(site_name, list) else site_name,
            'is_remote': is_remote if is_remote is not None else random.choice([True, False])
        }
        sample_jobs.append(job)
    
    # Convert to DataFrame
    df = pd.DataFrame(sample_jobs)
    print(f"Mock function returning {len(df)} jobs")
    return df