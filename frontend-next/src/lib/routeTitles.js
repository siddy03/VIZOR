// Maps pathnames to page titles (mirrors `title` / `data.title` in app.routes.ts).
const TITLES = {
  '/login': 'Login',
  '/home': 'Home',
  '/benchmarks': 'Interactive Benchmarks',
  '/help': 'Help',
  '/surveys/add': 'Add Survey',
  '/surveys/requests': 'All Non-Survey Requests',
  '/surveys/view': 'View Survey',
  '/surveys/report': 'Manage Report Builder',
  '/surveys/published': 'Published Surveys',
  '/surveys/modify': 'Modify Survey Response',
  '/tools': 'Tools',
  '/community': 'Community',
  '/community/discussion': 'Community - Discussion',
  '/community/chat': 'Community - Chat',
  '/community/poll': 'Community - Poll',
  '/meetings': 'Meetings',
  '/exchange': 'Auriemma Exchange',
  '/admin': 'Admin',
  '/admin/users': 'Users',
  '/admin/users/add': 'Add New User',
  '/admin/projects': 'Projects',
  '/admin/projects/add': 'Add New Project',
  '/admin/roundtables': 'Roundtables',
  '/admin/roundtables/add': 'Add New Roundtable',
  '/admin/clients': 'Clients',
  '/admin/clients/add': 'Add New Client',
};

export function resolveRouteTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (/^\/surveys\/edit\//.test(pathname)) return 'Modify Survey';
  if (/^\/admin\/projects\/edit\//.test(pathname)) return 'Modify Project';
  if (/^\/admin\/roundtables\/edit\//.test(pathname)) return 'Modify Roundtable';
  if (/^\/admin\/clients\/edit\//.test(pathname)) return 'Modify Client';
  return 'Home';
}
