import { redirect } from 'next/navigation';

// Root route → login (mirrors Angular: { path: '', redirectTo: 'login' }).
export default function RootPage() {
  redirect('/login');
}
