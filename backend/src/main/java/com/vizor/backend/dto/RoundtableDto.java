package com.vizor.backend.dto;

public class RoundtableDto {

    private Long id;
    private String name;
    private String abbreviation;
    private Integer clientsWithAccess;
    private String directors;
    private String associates;
    private String description;
    private String status;
    private Object clientIds;
    private Object directorIds;
    private Object associateIds;
    private Object primaryDirector;
    private Object primaryAssociate;

    public RoundtableDto() {}

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAbbreviation() { return abbreviation; }
    public Integer getClientsWithAccess() { return clientsWithAccess; }
    public String getDirectors() { return directors; }
    public String getAssociates() { return associates; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public Object getClientIds() { return clientIds; }
    public Object getDirectorIds() { return directorIds; }
    public Object getAssociateIds() { return associateIds; }
    public Object getPrimaryDirector() { return primaryDirector; }
    public Object getPrimaryAssociate() { return primaryAssociate; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
    public void setClientsWithAccess(Integer clientsWithAccess) { this.clientsWithAccess = clientsWithAccess; }
    public void setDirectors(String directors) { this.directors = directors; }
    public void setAssociates(String associates) { this.associates = associates; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(String status) { this.status = status; }
    public void setClientIds(Object clientIds) { this.clientIds = clientIds; }
    public void setDirectorIds(Object directorIds) { this.directorIds = directorIds; }
    public void setAssociateIds(Object associateIds) { this.associateIds = associateIds; }
    public void setPrimaryDirector(Object primaryDirector) { this.primaryDirector = primaryDirector; }
    public void setPrimaryAssociate(Object primaryAssociate) { this.primaryAssociate = primaryAssociate; }

    // Builder
    public static RoundtableDtoBuilder builder() { return new RoundtableDtoBuilder(); }

    public static class RoundtableDtoBuilder {
        private final RoundtableDto dto = new RoundtableDto();

        public RoundtableDtoBuilder id(Long id) { dto.id = id; return this; }
        public RoundtableDtoBuilder name(String name) { dto.name = name; return this; }
        public RoundtableDtoBuilder abbreviation(String abbreviation) { dto.abbreviation = abbreviation; return this; }
        public RoundtableDtoBuilder clientsWithAccess(Integer clientsWithAccess) { dto.clientsWithAccess = clientsWithAccess; return this; }
        public RoundtableDtoBuilder directors(String directors) { dto.directors = directors; return this; }
        public RoundtableDtoBuilder associates(String associates) { dto.associates = associates; return this; }
        public RoundtableDtoBuilder description(String description) { dto.description = description; return this; }
        public RoundtableDtoBuilder status(String status) { dto.status = status; return this; }
        public RoundtableDtoBuilder clientIds(Object clientIds) { dto.clientIds = clientIds; return this; }
        public RoundtableDtoBuilder directorIds(Object directorIds) { dto.directorIds = directorIds; return this; }
        public RoundtableDtoBuilder associateIds(Object associateIds) { dto.associateIds = associateIds; return this; }
        public RoundtableDtoBuilder primaryDirector(Object primaryDirector) { dto.primaryDirector = primaryDirector; return this; }
        public RoundtableDtoBuilder primaryAssociate(Object primaryAssociate) { dto.primaryAssociate = primaryAssociate; return this; }

        public RoundtableDto build() { return dto; }
    }
}
