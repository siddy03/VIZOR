package com.vizor.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String abbreviation;

    @Column(name = "clients_with_access")
    private String clientsWithAccess;

    private String directors;

    private String associates;

    @Column(name = "project_type")
    private String projectType;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String clientIds;

    @Column(columnDefinition = "TEXT")
    private String directorIds;

    @Column(columnDefinition = "TEXT")
    private String associateIds;

    @Column(columnDefinition = "TEXT")
    private String primaryDirector;

    @Column(columnDefinition = "TEXT")
    private String primaryAssociate;

    @Column(columnDefinition = "TEXT")
    private String selectedProjectType;

    public Project() {}

    public Project(Long id, String name, String abbreviation, String clientsWithAccess,
                   String directors, String associates, String projectType, String description,
                   String status, String clientIds, String directorIds, String associateIds,
                   String primaryDirector, String primaryAssociate, String selectedProjectType) {
        this.id = id;
        this.name = name;
        this.abbreviation = abbreviation;
        this.clientsWithAccess = clientsWithAccess;
        this.directors = directors;
        this.associates = associates;
        this.projectType = projectType;
        this.description = description;
        this.status = status;
        this.clientIds = clientIds;
        this.directorIds = directorIds;
        this.associateIds = associateIds;
        this.primaryDirector = primaryDirector;
        this.primaryAssociate = primaryAssociate;
        this.selectedProjectType = selectedProjectType;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAbbreviation() { return abbreviation; }
    public String getClientsWithAccess() { return clientsWithAccess; }
    public String getDirectors() { return directors; }
    public String getAssociates() { return associates; }
    public String getProjectType() { return projectType; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getClientIds() { return clientIds; }
    public String getDirectorIds() { return directorIds; }
    public String getAssociateIds() { return associateIds; }
    public String getPrimaryDirector() { return primaryDirector; }
    public String getPrimaryAssociate() { return primaryAssociate; }
    public String getSelectedProjectType() { return selectedProjectType; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
    public void setClientsWithAccess(String clientsWithAccess) { this.clientsWithAccess = clientsWithAccess; }
    public void setDirectors(String directors) { this.directors = directors; }
    public void setAssociates(String associates) { this.associates = associates; }
    public void setProjectType(String projectType) { this.projectType = projectType; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(String status) { this.status = status; }
    public void setClientIds(String clientIds) { this.clientIds = clientIds; }
    public void setDirectorIds(String directorIds) { this.directorIds = directorIds; }
    public void setAssociateIds(String associateIds) { this.associateIds = associateIds; }
    public void setPrimaryDirector(String primaryDirector) { this.primaryDirector = primaryDirector; }
    public void setPrimaryAssociate(String primaryAssociate) { this.primaryAssociate = primaryAssociate; }
    public void setSelectedProjectType(String selectedProjectType) { this.selectedProjectType = selectedProjectType; }

    // Builder
    public static ProjectBuilder builder() { return new ProjectBuilder(); }

    public static class ProjectBuilder {
        private Long id;
        private String name;
        private String abbreviation;
        private String clientsWithAccess;
        private String directors;
        private String associates;
        private String projectType;
        private String description;
        private String status;
        private String clientIds;
        private String directorIds;
        private String associateIds;
        private String primaryDirector;
        private String primaryAssociate;
        private String selectedProjectType;

        public ProjectBuilder id(Long id) { this.id = id; return this; }
        public ProjectBuilder name(String name) { this.name = name; return this; }
        public ProjectBuilder abbreviation(String abbreviation) { this.abbreviation = abbreviation; return this; }
        public ProjectBuilder clientsWithAccess(String clientsWithAccess) { this.clientsWithAccess = clientsWithAccess; return this; }
        public ProjectBuilder directors(String directors) { this.directors = directors; return this; }
        public ProjectBuilder associates(String associates) { this.associates = associates; return this; }
        public ProjectBuilder projectType(String projectType) { this.projectType = projectType; return this; }
        public ProjectBuilder description(String description) { this.description = description; return this; }
        public ProjectBuilder status(String status) { this.status = status; return this; }
        public ProjectBuilder clientIds(String clientIds) { this.clientIds = clientIds; return this; }
        public ProjectBuilder directorIds(String directorIds) { this.directorIds = directorIds; return this; }
        public ProjectBuilder associateIds(String associateIds) { this.associateIds = associateIds; return this; }
        public ProjectBuilder primaryDirector(String primaryDirector) { this.primaryDirector = primaryDirector; return this; }
        public ProjectBuilder primaryAssociate(String primaryAssociate) { this.primaryAssociate = primaryAssociate; return this; }
        public ProjectBuilder selectedProjectType(String selectedProjectType) { this.selectedProjectType = selectedProjectType; return this; }

        public Project build() {
            return new Project(id, name, abbreviation, clientsWithAccess, directors, associates,
                    projectType, description, status, clientIds, directorIds, associateIds,
                    primaryDirector, primaryAssociate, selectedProjectType);
        }
    }
}
