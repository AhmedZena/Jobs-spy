// Debug Console
class DebugConsole {
    constructor() {
        this.debugContent = document.getElementById('debugContent');
        this.setupListeners();
        this.log('Debug console initialized', 'info');
    }

    setupListeners() {
        document.getElementById('clearConsoleBtn').addEventListener('click', () => this.clear());
        document.getElementById('toggleConsoleBtn').addEventListener('click', () => this.toggle());
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `debug-log ${type}`;
        logEntry.innerHTML = `<span class="debug-timestamp">[${timestamp}]</span>${this.escapeHtml(message)}`;
        this.debugContent.appendChild(logEntry);
        this.debugContent.scrollTop = this.debugContent.scrollHeight;

        // Also log to browser console
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    error(message, error) {
        const errorMsg = error ? `${message}: ${error.message || error}` : message;
        this.log(errorMsg, 'error');
        console.error(message, error);
    }

    clear() {
        this.debugContent.innerHTML = '';
        this.log('Console cleared', 'info');
    }

    toggle() {
        const content = this.debugContent;
        const btn = document.getElementById('toggleConsoleBtn');
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            btn.textContent = '−';
        } else {
            content.classList.add('collapsed');
            btn.textContent = '+';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Job Search Application
class JobSearchApp {
    constructor() {
        this.allJobs = [];
        this.filteredJobs = [];
        this.currentPage = 1;
        this.jobsPerPage = 10;
        this.appliedJobs = this.loadAppliedJobs();
        this.debug = new DebugConsole();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('searchForm').addEventListener('submit', (e) => this.handleSearch(e));
        document.getElementById('prevBtn').addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.changePage(1));
        document.getElementById('clearAppliedBtn').addEventListener('click', () => this.clearAppliedJobs());
    }

    loadAppliedJobs() {
        const stored = localStorage.getItem('appliedJobs');
        return stored ? JSON.parse(stored) : [];
    }

    saveAppliedJobs() {
        localStorage.setItem('appliedJobs', JSON.stringify(this.appliedJobs));
    }

    markAsApplied(jobId) {
        if (!this.appliedJobs.includes(jobId)) {
            this.appliedJobs.push(jobId);
            this.saveAppliedJobs();
            this.renderCurrentPage();
        }
    }

    clearAppliedJobs() {
        if (confirm('Are you sure you want to clear all applied jobs?')) {
            this.appliedJobs = [];
            this.saveAppliedJobs();
            this.renderCurrentPage();
        }
    }

    async handleSearch(e) {
        e.preventDefault();

        const formData = {
            search_term: document.getElementById('searchTerm').value.trim(),
            location: document.getElementById('location').value.trim(),
            job_type: document.getElementById('jobType').value,
            is_remote: document.getElementById('isRemote').value,
            results_wanted: parseInt(document.getElementById('resultsWanted').value),
            hours_old: parseInt(document.getElementById('hoursOld').value)
        };

        this.debug.log(`Starting search: ${formData.search_term} in ${formData.location || 'any location'}`, 'info');

        if (!formData.search_term) {
            this.showError('Please enter a job title or keywords');
            this.debug.error('Search term is required');
            return;
        }

        this.showLoading();
        this.hideError();
        this.hideResults();

        try {
            const apiUrl = '/.netlify/functions/search_jobs';
            this.debug.log(`Fetching from: ${apiUrl}`, 'info');
            this.debug.log(`Request body: ${JSON.stringify(formData)}`, 'info');

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            this.debug.log(`Response status: ${response.status} ${response.statusText}`, 'info');
            this.debug.log(`Response headers: ${JSON.stringify([...response.headers.entries()])}`, 'info');

            // Get response text first to see what we're getting
            const responseText = await response.text();
            this.debug.log(`Response body length: ${responseText.length} chars`, 'info');
            this.debug.log(`Response body preview: ${responseText.substring(0, 200)}...`, 'info');

            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
                this.debug.log('Successfully parsed JSON response', 'success');
            } catch (parseError) {
                this.debug.error('Failed to parse JSON', parseError);
                this.debug.log(`Full response: ${responseText}`, 'error');
                throw new Error(`Invalid JSON response: ${parseError.message}`);
            }

            if (!response.ok) {
                this.debug.error(`API error: ${data.error || 'Unknown error'}`);
                throw new Error(data.error || 'Failed to fetch jobs');
            }

            this.debug.log(`Received ${data.jobs?.length || 0} jobs`, 'success');
            this.allJobs = data.jobs || [];
            this.currentPage = 1;
            this.filterJobs();
            this.hideLoading();
            this.showResults();
            this.renderCurrentPage();

        } catch (error) {
            this.debug.error('Search failed', error);
            this.hideLoading();
            this.showError(`Error: ${error.message}. Please try again.`);
        }
    }

    filterJobs() {
        // Filter out applied jobs
        this.filteredJobs = this.allJobs.filter(job => !this.appliedJobs.includes(job.id));
    }

    renderCurrentPage() {
        this.filterJobs();
        const start = (this.currentPage - 1) * this.jobsPerPage;
        const end = start + this.jobsPerPage;
        const jobsToShow = this.filteredJobs.slice(start, end);

        const tbody = document.getElementById('jobsTableBody');
        tbody.innerHTML = '';

        if (jobsToShow.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                        No jobs found. Try adjusting your search criteria.
                    </td>
                </tr>
            `;
        } else {
            jobsToShow.forEach(job => {
                const row = this.createJobRow(job);
                tbody.appendChild(row);
            });
        }

        this.updatePagination();
        this.updateResultsCount();
    }

    createJobRow(job) {
        const row = document.createElement('tr');

        const jobType = job.job_type && job.job_type !== 'N/A'
            ? `<span class="job-type ${job.job_type.toLowerCase().replace('-', '')}">${job.job_type}</span>`
            : '<span style="color: #999;">Not specified</span>';

        const remoteBadge = job.is_remote
            ? '<span class="remote-badge">REMOTE</span>'
            : '';

        row.innerHTML = `
            <td>
                <a href="${job.job_url}" target="_blank" class="job-title">${this.escapeHtml(job.title)}</a>
            </td>
            <td class="job-company">${this.escapeHtml(job.company)}</td>
            <td class="job-location">${this.escapeHtml(job.location)}${remoteBadge}</td>
            <td>${jobType}</td>
            <td style="white-space: nowrap;">${this.formatDate(job.date_posted)}</td>
            <td><span class="job-site">${this.escapeHtml(job.site)}</span></td>
            <td>
                <div class="actions-cell">
                    <a href="${job.job_url}" target="_blank" class="btn-view">View Job</a>
                    <button class="btn-applied" onclick="app.markAsApplied('${job.id}')">Applied</button>
                </div>
            </td>
        `;

        return row;
    }

    formatDate(dateString) {
        if (!dateString || dateString === 'N/A') return 'Recently';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

            return date.toLocaleDateString();
        } catch (e) {
            return 'Recently';
        }
    }

    escapeHtml(text) {
        if (!text || text === 'N/A') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.filteredJobs.length / this.jobsPerPage);
        const newPage = this.currentPage + direction;

        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.renderCurrentPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredJobs.length / this.jobsPerPage);

        document.getElementById('prevBtn').disabled = this.currentPage === 1;
        document.getElementById('nextBtn').disabled = this.currentPage === totalPages || totalPages === 0;
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages || 1}`;
    }

    updateResultsCount() {
        const totalJobs = this.filteredJobs.length;
        const appliedCount = this.appliedJobs.length;

        let countText = `${totalJobs} job${totalJobs !== 1 ? 's' : ''} found`;
        if (appliedCount > 0) {
            countText += ` (${appliedCount} hidden as applied)`;
        }

        document.getElementById('resultsCount').textContent = countText;
    }

    showLoading() {
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('searchBtn').disabled = true;
        document.getElementById('btnText').style.display = 'none';
        document.getElementById('btnLoader').style.display = 'inline-block';
    }

    hideLoading() {
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('searchBtn').disabled = false;
        document.getElementById('btnText').style.display = 'inline';
        document.getElementById('btnLoader').style.display = 'none';
    }

    showResults() {
        document.getElementById('resultsSection').style.display = 'block';
    }

    hideResults() {
        document.getElementById('resultsSection').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorSection').style.display = 'block';
    }

    hideError() {
        document.getElementById('errorSection').style.display = 'none';
    }
}

// Initialize the app
const app = new JobSearchApp();

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Silent fail - service worker is optional
        });
    });
}
