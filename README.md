# Job Search Automation

An automated job search web application that searches across multiple job platforms including LinkedIn, Indeed, ZipRecruiter, and Google Jobs. Built with JobSpy library and designed for easy deployment on Netlify.

## Features

- **Multi-Platform Search**: Search across LinkedIn, Indeed, ZipRecruiter, Google Jobs simultaneously
- **Smart Deduplication**: Automatically removes duplicate job postings
- **Applied Jobs Tracking**: Mark jobs as "applied" to hide them from future results (stored in browser localStorage)
- **Pagination**: Easy navigation through search results
- **Advanced Filters**: Filter by job type, location, remote work, and posting date
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Search**: Get latest job postings on-demand

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python with JobSpy library
- **Deployment**: Netlify (Static site + Serverless Functions)
- **Storage**: Browser localStorage for applied jobs tracking

## Project Structure

```
Jobs-spy/
├── public/
│   ├── index.html          # Main HTML page
│   ├── styles.css          # Styling
│   └── app.js              # Frontend JavaScript
├── netlify/
│   └── functions/
│       └── search_jobs.py  # Serverless function for job search
├── netlify.toml            # Netlify configuration
├── requirements.txt        # Python dependencies
├── runtime.txt             # Python version
└── README.md               # This file
```

## Local Development

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Jobs-spy
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run locally with Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```

4. Open your browser to `http://localhost:8888`

## Deployment to Netlify

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Create a Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub, GitLab, or email

2. **Connect Your Repository**
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git provider (GitHub)
   - Select this repository

3. **Configure Build Settings**
   - Build command: `pip install -r requirements.txt`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)
   - Your site will be live at `https://your-site-name.netlify.app`

### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy --prod
```

## Usage

1. **Search for Jobs**
   - Enter job title/keywords (required)
   - Optionally specify location, job type, remote preference
   - Set how many results you want per site (5-100)
   - Set how recent the postings should be (in hours)
   - Click "Search Jobs"

2. **View Results**
   - Browse through paginated results
   - Each job shows: title, company, location, type, posting date, source site
   - Click "View Job" to open the job posting in a new tab

3. **Mark as Applied**
   - Click "Applied" button to hide a job from future searches
   - Applied jobs are stored in your browser's localStorage
   - Clear all applied jobs using "Clear Applied List" button

4. **Get Latest Jobs**
   - Simply run a new search to get the most recent postings
   - The system automatically deduplicates results

## Configuration

### Adjusting Search Parameters

Edit `/public/index.html` to modify default values:
- `results_wanted`: Number of results per site (default: 25)
- `hours_old`: How recent the posts should be (default: 72 hours)

### Adding More Job Sites

The JobSpy library supports additional sites. To add them, edit `/netlify/functions/search_jobs.py`:

```python
sites = ['indeed', 'linkedin', 'zip_recruiter', 'google', 'glassdoor']
```

Available sites: `indeed`, `linkedin`, `zip_recruiter`, `google`, `glassdoor`, `bayt`, `bdjobs`, `naukri`

### Customizing the UI

- **Colors/Styles**: Edit `/public/styles.css`
- **Layout**: Edit `/public/index.html`
- **Functionality**: Edit `/public/app.js`

## Supported Job Platforms

- ✅ LinkedIn
- ✅ Indeed
- ✅ ZipRecruiter
- ✅ Google Jobs
- ✅ Glassdoor (optional)
- ✅ Bayt (Middle East)
- ✅ BDJobs (Bangladesh)
- ✅ Naukri (India)

## Limitations

- **Rate Limiting**: LinkedIn may rate-limit after ~10 pages with single IP
- **Scraping Restrictions**: Some sites may block requests; use responsibly
- **Netlify Function Timeout**: Free tier has 10-second timeout for serverless functions
- **Build Time**: Initial deployment may take 2-3 minutes

## Troubleshooting

### Jobs not loading
- Check browser console for errors
- Verify Netlify function logs in dashboard
- Ensure `requirements.txt` dependencies are installed

### Rate limiting issues
- Reduce `results_wanted` parameter
- Increase `hours_old` to get cached results
- Wait a few minutes between searches

### Deployment fails
- Verify Python version is 3.11+ in `runtime.txt`
- Check that all files are committed to Git
- Review Netlify build logs for specific errors

## Privacy & Data

- No user data is sent to external servers (except job sites)
- Applied jobs are stored locally in browser localStorage
- No cookies or tracking
- Search history is not saved

## Contributing

Feel free to submit issues or pull requests to improve the application!

## License

MIT License - feel free to use and modify for your needs

## Credits

- Built with [JobSpy](https://github.com/speedyapply/JobSpy) library
- Deployed on [Netlify](https://netlify.com)

## Support

For issues or questions, please open an issue on GitHub.

---

**Happy Job Hunting!** 🚀
