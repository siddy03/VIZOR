package com.vizor.backend.dto;

public class ProjectDto {

    private Long id;
    private String name;
    private String abbreviation;
    private String clientsWithAccess;
    private String directors;
    private String associates;
    private String projectType;
    private String description;
    private String status;
    private Object clientIds;
    private Object directorIds;
    private Object associateIds;
    private Object primaryDirector;
    private Object primaryAssociate;
    private Object selectedProjectType;

    public ProjectDto() {}

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
    public Object getClientIds() { return clientIds; }
    public Object getDirectorIds() { return directorIds; }
    public Object getAssociateIds() { return associateIds; }
    public Object getPrimaryDirector() { return primaryDirector; }
    public Object getPrimaryAssociate() { return primaryAssociate; }
    public Object getSelectedProjectType() { return selectedProjectType; }

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
    public void setClientIds(Object clientIds) { this.clientIds = clientIds; }
    public void setDirectorIds(Object directorIds) { this.directorIds = directorIds; }
    public void setAssociateIds(Object associateIds) { this.associateIds = associateIds; }
    public void setPrimaryDirector(Object primaryDirector) { this.primaryDirector = primaryDirector; }
    public void setPrimaryAssociate(Object primaryAssociate) { this.primaryAssociate = primaryAssociate; }
    public void setSelectedProjectType(Object selectedProjectType) { this.selectedProjectType = selectedProjectType; }

    // Builder
    public static ProjectDtoBuilder builder() { return new ProjectDtoBuilder(); }

    public static class ProjectDtoBuilder {
        private final ProjectDto dto = new ProjectDto();

        public ProjectDtoBuilder id(Long id) { dto.id = id; return this; }
        public ProjectDtoBuilder name(String name) { dto.name = name; return this; }
        public ProjectDtoBuilder abbreviation(String abbreviation) { dto.abbreviation = abbreviation; return this; }
        public ProjectDtoBuilder clientsWithAccess(String clientsWithAccess) { dto.clientsWithAccess = clientsWithAccess; return this; }
        public ProjectDtoBuilder directors(String directors) { dto.directors = directors; return this; }
        public ProjectDtoBuilder associates(String associates) { dto.associates = associates; return this; }
        public ProjectDtoBuilder projectType(String projectType) { dto.projectType = projectType; return this; }
        public ProjectDtoBuilder description(String description) { dto.description = description; return this; }
        public ProjectDtoBuilder status(String status) { dto.status = status; return this; }
        public ProjectDtoBuilder clientIds(Object clientIds) { dto.clientIds = clientIds; return this; }
        public ProjectDtoBuilder directorIds(Object directorIds) { dto.directorIds = directorIds; return this; }
        public ProjectDtoBuilder associateIds(Object associateIds) { dto.associateIds = associateIds; return this; }
        public ProjectDtoBuilder primaryDirector(Object primaryDirector) { dto.primaryDirector = primaryDirector; return this; }
        public ProjectDtoBuilder primaryAssociate(Object primaryAssociate) { dto.primaryAssociate = primaryAssociate; return this; }
        public ProjectDtoBuilder selectedProjectType(Object selectedProjectType) { dto.selectedProjectType = selectedProjectType; return this; }

        public ProjectDto build() { return dto; }
    }
}
