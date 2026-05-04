import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { authGuard } from './guards/auth.guard';
import { childGuard } from './guards/child.guard';
import { arGuard } from './guards/ar.guard';
import { arMatchGuard } from './guards/ar-match.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';
import { surveyGuard } from './guards/survey.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
    title: 'Login'
  },
  
// ============================================
  // PROTECTED APP SHELL (requires authentication)
  // ============================================
  {
    path: '', // Pathless parent route
    canActivate: [authGuard],
    canActivateChild: [childGuard], // Automatically secures all nested children
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
        data: { title: 'Home' }
      },
      {
        path: 'benchmarks',
        loadComponent: () => import('./pages/benchmarks/benchmarks').then(m => m.BenchmarksComponent),
        data: { title: 'Interactive Benchmarks' }
      },
      {
        path: 'help',
        loadComponent: () => import('./pages/help/help').then(m => m.HelpComponent),
        data: { title: 'Help' }
      },
      
      // ============================================
      // SURVEY ROUTES (Standard access)
      // ============================================
      {
        path: 'surveys',
        children: [
          {
            path: 'add',
            loadComponent: () => import('./pages/surveys/add-survey').then(m => m.AddSurveyComponent),
            canActivate: [surveyGuard],
            canDeactivate: [unsavedChangesGuard], // FORM PAGE -> uses canDeactivate
            data: { title: 'Add Survey' }
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./pages/surveys/add-survey').then(m => m.AddSurveyComponent),
            canActivate: [surveyGuard],
            canDeactivate: [unsavedChangesGuard], // FORM PAGE -> uses canDeactivate
            data: { title: 'Modify Survey' }
          },
          {
            path: 'requests',
            loadComponent: () => import('./pages/surveys/ad-hoc-request/ad-hoc-request').then(m => m.AdHocRequestComponent),
            data: { title: 'All Non-Survey Requests' }
          },
          {
            path: 'view',
            loadComponent: () => import('./pages/surveys/view-survey/view-survey').then(m => m.ViewSurveyComponent),
            data: { title: 'View Survey' }
          },
          {
            path: 'report',
            loadComponent: () => import('./pages/surveys/manage-report/manage-report').then(m => m.ManageReportComponent),
            data: { title: 'Manage Report Builder' }
          },
          {
            path: 'published',
            loadComponent: () => import('./pages/surveys/published-surveys/published-surveys').then(m => m.PublishedSurveysComponent),
            data: { title: 'Published Surveys' }
          },
          {
            path: 'modify',
            loadComponent: () => import('./pages/surveys/modify-response/modify-response').then(m => m.ModifyResponseComponent),
            data: { title: 'Modify Survey Response' }
          }
        ]
      },
      {
        path: 'tools',
        loadComponent: () => import('./pages/tools/tools').then(m => m.ToolsComponent),
        data: { title: 'Tools' }
      },

      // ============================================
      // AR ONLY ROUTES (requires 'ar' role)
      // Uses canMatch (modern canLoad) + arGuard
      // ============================================
      {
        path: 'community',
        canMatch: [arMatchGuard], // Prevents downloading chunk if not an AR user
        canActivate: [arGuard],
        loadComponent: () => import('./pages/community/community').then(m => m.CommunityComponent),
        data: { title: 'Community' }
      },
      {
        path: 'meetings',
        canMatch: [arMatchGuard],
        canActivate: [arGuard],
        loadComponent: () => import('./pages/meetings/meetings').then(m => m.MeetingsComponent),
        data: { title: 'Meetings' }
      },
      {
        path: 'exchange',
        canMatch: [arMatchGuard],
        canActivate: [arGuard],
        loadComponent: () => import('./pages/exchange/exchange').then(m => m.ExchangeComponent),
        data: { title: 'Auriemma Exchange' }
      },
      {
        path: 'admin',
        canMatch: [arMatchGuard],
        canActivate: [arGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/admin').then(m => m.AdminComponent),
            data: { title: 'Admin' }
          },
          {
            path: 'users',
            loadComponent: () => import('./pages/users/users').then(m => m.UsersComponent),
            data: { title: 'Users' }
          },
          {
            path: 'users/add',
            loadComponent: () => import('./pages/users/add-user/add-user').then(m => m.AddUserComponent),
            canDeactivate: [unsavedChangesGuard], // FORM PAGE -> uses canDeactivate
            data: { title: 'Add New User' }
          },
          {
            path: 'projects',
            loadComponent: () => import('./pages/projects/projects').then(m => m.ProjectsComponent),
            data: { title: 'Projects' }
          },
          {
            path: 'projects/add',
            loadComponent: () => import('./pages/add-project/add-project').then(m => m.AddProjectComponent),
            canDeactivate: [unsavedChangesGuard], // FORM PAGE -> uses canDeactivate
            data: { title: 'Add New Project' }
          },
          {
            path: 'projects/edit/:id',
            loadComponent: () => import('./pages/add-project/add-project').then(m => m.AddProjectComponent),
            canDeactivate: [unsavedChangesGuard], // FORM PAGE -> uses canDeactivate
            data: { title: 'Modify Project' }
          },
          {
            path: 'roundtables',
            loadComponent: () => import('./pages/roundtables/roundtables').then(m => m.RoundtablesComponent),
            data: { title: 'Roundtables' }
          },
          {
            path: 'roundtables/add',
            loadComponent: () => import('./pages/add-roundtable/add-roundtable').then(m => m.AddRoundtableComponent),
            canDeactivate: [unsavedChangesGuard], // FORM PAGE -> uses canDeactivate
            data: { title: 'Add New Roundtable' }
          },
          {
            path: 'roundtables/edit/:id',
            loadComponent: () => import('./pages/add-roundtable/add-roundtable').then(m => m.AddRoundtableComponent),
            canDeactivate: [unsavedChangesGuard], // FORM PAGE -> uses canDeactivate
            data: { title: 'Modify Roundtable' }
          },
          {
            path: 'clients',
            loadComponent: () => import('./pages/clients/clients').then(m => m.ClientsComponent),
            data: { title: 'Clients' }
          },
          {
            path: 'clients/add',
            loadComponent: () => import('./pages/add-client/add-client').then(m => m.AddClientComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Add New Client' }
          },
          {
            path: 'clients/edit/:id',
            loadComponent: () => import('./pages/add-client/add-client').then(m => m.AddClientComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Modify Client' }
          }
        ]
      }
    ]
  },
  
  // ============================================
  // WILDCARD ROUTE (404 Page Not Found)
  // ============================================
  {
    path: '**',
    canActivate: [
      () => {
        const messageService = inject(MessageService);
        const router = inject(Router);
        
        // Trigger the PrimeNG Error Toast
        messageService.add({
          severity: 'error',
          summary: 'Page Not Found',
          detail: 'The URL you entered does not exist.',
          life: 5000
        });
        
        // Redirect the user back to the home page securely
        return router.createUrlTree(['/home']);
      }
    ],
    // Dummy component since we redirect immediately anyway
    component: class DummyComponent {} 
  }
];
