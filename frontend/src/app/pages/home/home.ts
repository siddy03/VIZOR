import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { concatMap, from, delay, of, catchError, EMPTY } from 'rxjs';

interface Post {
  id: number;
  title: string;
  body: string;
}

interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  logs: LogEntry[] = [];
  posts: Post[] = [];
  isFetching = false;

  startSequentialFetch() {
    this.isFetching = true;
    this.logs = [];
    this.posts = [];

    this.addLog('Starting fetch for posts by specific IDs...', 'info');

    const targetIds = [1, 2, 3, 4, 5];
    
    // Create the exact parameter string: id=1,2,3,4,5
    const params = new HttpParams().set('id', targetIds.join(','));

    // Make ONE HTTP request to get specific posts using that parameter
    this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts', { params }).pipe(
      catchError(error => {
        // If the single fetch fails, interceptor handles it, but we log and stop
        this.addLog('Failed to fetch posts. Interceptor handled Toast.', 'error');
        this.isFetching = false;
        this.cdr.detectChanges();
        return EMPTY;
      }),
      concatMap(posts => {
        this.addLog(`Successfully received ${posts.length} posts. Processing sequentially...`, 'success');
        // Convert the array of posts into an observable stream that emits one by one
        return from(posts);
      }),
      // Process each emitted post sequentially with a delay
      concatMap((post, index) => {
        // No delay for the very first post, 1 second delay for subsequent onesS
        const delayTime = index === 0 ? 0 : 1000;

        return of(post).pipe(
          delay(delayTime),
          concatMap(currentPost => {
            this.addLog(`Displaying post ID ${currentPost.id}...`, 'info');
            this.posts.push(currentPost);
            this.cdr.detectChanges();
            return of(currentPost);
          })
        );
      })
    ).subscribe({
      complete: () => {
        this.addLog('Sequential display complete!', 'success');
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  private addLog(message: string, type: 'info' | 'success' | 'error') {
    this.logs.push({
      timestamp: new Date(),
      message,
      type
    });
    // Force UI update immediately for every single log message
    this.cdr.detectChanges();
  }
}
