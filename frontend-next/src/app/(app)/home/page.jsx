'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from 'primereact/button';
import './home.css';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatTime(date) {
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

export default function HomePage() {
  const [logs, setLogs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // Use refs to accumulate during the async sequence (mirrors Angular's push + detectChanges)
  const logsRef = useRef([]);
  const postsRef = useRef([]);

  const addLog = (message, type) => {
    logsRef.current = [...logsRef.current, { timestamp: new Date(), message, type }];
    setLogs(logsRef.current);
  };

  const startSequentialFetch = async () => {
    setIsFetching(true);
    logsRef.current = [];
    postsRef.current = [];
    setLogs([]);
    setPosts([]);

    addLog('Starting fetch for posts by specific IDs...', 'info');

    const targetIds = [1, 2, 3, 4, 5];

    try {
      const { data: fetchedPosts } = await api.get('https://jsonplaceholder.typicode.com/posts', {
        params: { id: targetIds.join(',') },
      });

      addLog(`Successfully received ${fetchedPosts.length} posts. Processing sequentially...`, 'success');

      for (let index = 0; index < fetchedPosts.length; index++) {
        const currentPost = fetchedPosts[index];
        const delayTime = index === 0 ? 0 : 1000;
        if (delayTime) await delay(delayTime);
        addLog(`Displaying post ID ${currentPost.id}...`, 'info');
        postsRef.current = [...postsRef.current, currentPost];
        setPosts(postsRef.current);
      }

      addLog('Sequential display complete!', 'success');
      setIsFetching(false);
    } catch (error) {
      // Interceptor handles the Toast
      addLog('Failed to fetch posts. Interceptor handled Toast.', 'error');
      setIsFetching(false);
    }
  };

  return (
    <div className="page-container" role="region" aria-labelledby="home-page-heading">
      <h2 id="home-page-heading">Home Page</h2>
      <p>Welcome to VIZOR! This is the home page.</p>

      <hr className="divider" aria-hidden="true" />

      <section className="api-demo-section" aria-labelledby="api-demo-heading">
        <div className="demo-header">
          <h3 id="api-demo-heading">API Sequential Fetch Demo</h3>
          <Button
            className="p-button-primary"
            onClick={startSequentialFetch}
            disabled={isFetching}
            aria-busy={isFetching}
            aria-label={isFetching ? 'Fetching data, please wait' : 'Start sequential fetch'}
          >
            {!isFetching && <i className="pi pi-play" aria-hidden="true" style={{ marginRight: '8px' }}></i>}
            {isFetching && <i className="pi pi-spin pi-spinner" aria-hidden="true" style={{ marginRight: '8px' }}></i>}
            {isFetching ? 'Fetching...' : 'Start Sequential Fetch'}
          </Button>
        </div>

        <div className="demo-content">
          {/* Logs Section */}
          <section className="logs-panel" aria-labelledby="logs-heading">
            <h4 id="logs-heading">
              <i className="pi pi-list" aria-hidden="true"></i> Real-Time Logs
            </h4>
            <div
              className="log-container"
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-relevant="additions"
              aria-label="Real-time fetch logs"
            >
              {logs.length === 0 && (
                <div className="empty-state">Click the button above to begin the fetch sequence.</div>
              )}
              {logs.map((log, i) => (
                <div key={i} className={`log-entry ${log.type}`} role="listitem">
                  <span className="log-time" aria-label="Timestamp">
                    [{formatTime(log.timestamp)}]
                  </span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Results Section */}
          <section className="results-panel" aria-labelledby="results-heading">
            <h4 id="results-heading">
              <i className="pi pi-database" aria-hidden="true"></i> Fetched Results
            </h4>
            <div className="results-container" role="region" aria-live="polite" aria-label="Fetched results">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <article key={post.id} className="post-card" aria-labelledby={`post-title-${post.id}`}>
                    <div className="post-id">Post ID: {post.id}</div>
                    <h5 className="post-title" id={`post-title-${post.id}`}>
                      {post.title}
                    </h5>
                    <p className="post-body">{post.body}</p>
                  </article>
                ))
              ) : (
                <div className="empty-state">Fetched posts will appear here.</div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
