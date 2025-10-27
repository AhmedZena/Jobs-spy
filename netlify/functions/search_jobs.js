const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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
        console.log('Starting job search...');
        
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

        // Try to use the Python script if available, otherwise fall back to mock data
        try {
            const pythonScript = path.join(__dirname, 'search_jobs.py');
            
            // Check if Python script exists
            if (fs.existsSync(pythonScript)) {
                console.log('Attempting to use Python script...');
                
                // Create a temporary input file
                const inputFile = path.join(__dirname, 'temp_input.json');
                fs.writeFileSync(inputFile, JSON.stringify(body));
                
                // Execute Python script
                const result = await new Promise((resolve, reject) => {
                    exec(`python3 ${pythonScript} ${inputFile}`, (error, stdout, stderr) => {
                        // Clean up temp file
                        if (fs.existsSync(inputFile)) {
                            fs.unlinkSync(inputFile);
                        }
                        
                        if (error) {
                            console.error('Python script error:', error);
                            console.error('Python stderr:', stderr);
                            reject(error);
                        } else {
                            try {
                                const data = JSON.parse(stdout);
                                resolve(data);
                            } catch (parseError) {
                                console.error('Failed to parse Python output:', parseError);
                                console.error('Python stdout:', stdout);
                                reject(parseError);
                            }
                        }
                    });
                });
                
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify(result)
                };
            }
        } catch (pythonError) {
            console.log('Python script failed, using mock data:', pythonError.message);
        }

        // Fallback to mock data
        const mockJobs = [
            {
                id: '1',
                title: `${body.search_term} Developer`,
                company: 'Tech Corp',
                location: body.location || 'Remote',
                job_type: body.job_type || 'Full-time',
                date_posted: new Date().toISOString(),
                salary: 'Not specified',
                job_url: 'https://example.com/job/1',
                description: `Great opportunity for a ${body.search_term} developer...`,
                site: 'Indeed',
                is_remote: body.is_remote === 'true'
            },
            {
                id: '2',
                title: `Senior ${body.search_term} Engineer`,
                company: 'Startup Inc',
                location: body.location || 'San Francisco, CA',
                job_type: body.job_type || 'Full-time',
                date_posted: new Date().toISOString(),
                salary: '$120,000 - $150,000',
                job_url: 'https://example.com/job/2',
                description: `Looking for an experienced ${body.search_term} engineer...`,
                site: 'Indeed',
                is_remote: body.is_remote === 'true'
            },
            {
                id: '3',
                title: `${body.search_term} Specialist`,
                company: 'Innovation Labs',
                location: body.location || 'New York, NY',
                job_type: body.job_type || 'Full-time',
                date_posted: new Date().toISOString(),
                salary: '$100,000 - $130,000',
                job_url: 'https://example.com/job/3',
                description: `Join our team as a ${body.search_term} specialist...`,
                site: 'Indeed',
                is_remote: body.is_remote === 'true'
            }
        ];

        const result = {
            jobs: mockJobs,
            total: mockJobs.length,
            search_term: body.search_term,
            location: body.location || '',
            timestamp: new Date().toISOString()
        };

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