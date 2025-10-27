exports.handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        console.log('Search jobs function called');
        
        // Parse the request body
        const body = JSON.parse(event.body || '{}');
        console.log('Request body:', body);

        // Validate required fields
        if (!body.search_term) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'search_term is required' })
            };
        }

        // Create mock job data based on search term
        const mockJobs = [
            {
                id: '1',
                title: `${body.search_term} Developer`,
                company: 'Tech Solutions Inc',
                location: body.location || 'Remote',
                job_type: body.job_type || 'Full-time',
                date_posted: new Date().toISOString(),
                salary: '$80,000 - $120,000',
                job_url: 'https://example.com/job/1',
                description: `Exciting opportunity for a ${body.search_term} developer to join our growing team...`,
                site: 'Indeed',
                is_remote: body.is_remote === 'true'
            },
            {
                id: '2',
                title: `Senior ${body.search_term} Engineer`,
                company: 'Innovation Labs',
                location: body.location || 'San Francisco, CA',
                job_type: body.job_type || 'Full-time',
                date_posted: new Date().toISOString(),
                salary: '$120,000 - $160,000',
                job_url: 'https://example.com/job/2',
                description: `We're looking for an experienced ${body.search_term} engineer to lead our development team...`,
                site: 'Indeed',
                is_remote: body.is_remote === 'true'
            },
            {
                id: '3',
                title: `${body.search_term} Specialist`,
                company: 'StartupCo',
                location: body.location || 'New York, NY',
                job_type: body.job_type || 'Full-time',
                date_posted: new Date().toISOString(),
                salary: '$90,000 - $130,000',
                job_url: 'https://example.com/job/3',
                description: `Join our dynamic team as a ${body.search_term} specialist and help shape the future...`,
                site: 'Indeed',
                is_remote: body.is_remote === 'true'
            },
            {
                id: '4',
                title: `Lead ${body.search_term} Developer`,
                company: 'Enterprise Corp',
                location: body.location || 'Austin, TX',
                job_type: body.job_type || 'Full-time',
                date_posted: new Date().toISOString(),
                salary: '$110,000 - $150,000',
                job_url: 'https://example.com/job/4',
                description: `Lead our ${body.search_term} development initiatives and mentor junior developers...`,
                site: 'Indeed',
                is_remote: body.is_remote === 'true'
            },
            {
                id: '5',
                title: `${body.search_term} Consultant`,
                company: 'Consulting Group',
                location: body.location || 'Chicago, IL',
                job_type: body.job_type || 'Contract',
                date_posted: new Date().toISOString(),
                salary: '$100 - $150 per hour',
                job_url: 'https://example.com/job/5',
                description: `Work with various clients as a ${body.search_term} consultant on exciting projects...`,
                site: 'Indeed',
                is_remote: body.is_remote === 'true'
            }
        ];

        const result = {
            jobs: mockJobs,
            total: mockJobs.length,
            search_term: body.search_term,
            location: body.location || '',
            timestamp: new Date().toISOString(),
            message: 'Mock data - Python integration coming soon!'
        };

        console.log('Returning mock data:', result);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Error in search_jobs function:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: error.message,
                message: 'Failed to fetch jobs'
            })
        };
    }
};