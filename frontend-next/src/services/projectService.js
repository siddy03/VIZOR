import { api } from '@/lib/api';
import { store } from '@/store';
import {
  loadProjects as loadProjectsAction,
  addProject as addProjectAction,
  updateProject as updateProjectAction,
  deleteProject as deleteProjectAction,
} from '@/store/projectSlice';

export async function loadProjects() {
  try {
    const { data } = await api.get('/api/projects');
    store.dispatch(loadProjectsAction(data));
  } catch (error) {
    console.error('Failed to load projects from API', error);
  }
}

export function getProjects() {
  return store.getState().project.projects;
}

export async function addProject(project) {
  try {
    const { data } = await api.post('/api/projects', project);
    store.dispatch(addProjectAction(data));
  } catch (error) {
    console.error('Failed to add project', error);
    store.dispatch(addProjectAction(project));
  }
}

export function getProjectById(id) {
  return store.getState().project.projects.find((p) => p.id === id);
}

export async function updateProject(updatedProject) {
  try {
    const { data } = await api.put(`/api/projects/${updatedProject.id}`, updatedProject);
    store.dispatch(updateProjectAction(data));
  } catch (error) {
    console.error('Failed to update project', error);
    store.dispatch(updateProjectAction(updatedProject));
  }
}

export async function deleteProject(id) {
  try {
    await api.delete(`/api/projects/${id}`);
    store.dispatch(deleteProjectAction(id));
    return true;
  } catch (error) {
    console.error(`Failed to delete project ${id}`, error);
    return false;
  }
}
