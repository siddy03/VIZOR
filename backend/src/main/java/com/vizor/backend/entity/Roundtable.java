package com.vizor.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roundtables")
public class Roundtable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String abbreviation;

    @Column(name = "clients_with_access")
    private Integer clientsWithAccess;

    private String directors;

    private String associates;

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

    public Roundtable() {}

    public Roundtable(Long id, String name, String abbreviation, Integer clientsWithAccess,
                      String directors, String associates, String description, String status,
                      String clientIds, String directorIds, String associateIds,
                      String primaryDirector, String primaryAssociate) {
        this.id = id;
        this.name = name;
        this.abbreviation = abbreviation;
        this.clientsWithAccess = clientsWithAccess;
        this.directors = directors;
        this.associates = associates;
        this.description = description;
        this.status = status;
        this.clientIds = clientIds;
        this.directorIds = directorIds;
        this.associateIds = associateIds;
        this.primaryDirector = primaryDirector;
        this.primaryAssociate = primaryAssociate;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAbbreviation() { return abbreviation; }
    public Integer getClientsWithAccess() { return clientsWithAccess; }
    public String getDirectors() { return directors; }
    public String getAssociates() { return associates; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getClientIds() { return clientIds; }
    public String getDirectorIds() { return directorIds; }
    public String getAssociateIds() { return associateIds; }
    public String getPrimaryDirector() { return primaryDirector; }
    public String getPrimaryAssociate() { return primaryAssociate; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
    public void setClientsWithAccess(Integer clientsWithAccess) { this.clientsWithAccess = clientsWithAccess; }
    public void setDirectors(String directors) { this.directors = directors; }
    public void setAssociates(String associates) { this.associates = associates; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(String status) { this.status = status; }
    public void setClientIds(String clientIds) { this.clientIds = clientIds; }
    public void setDirectorIds(String directorIds) { this.directorIds = directorIds; }
    public void setAssociateIds(String associateIds) { this.associateIds = associateIds; }
    public void setPrimaryDirector(String primaryDirector) { this.primaryDirector = primaryDirector; }
    public void setPrimaryAssociate(String primaryAssociate) { this.primaryAssociate = primaryAssociate; }

    // Builder
    public static RoundtableBuilder builder() { return new RoundtableBuilder(); }

    public static class RoundtableBuilder {
        private Long id;
        private String name;
        private String abbreviation;
        private Integer clientsWithAccess;
        private String directors;
        private String associates;
        private String description;
        private String status;
        private String clientIds;
        private String directorIds;
        private String associateIds;
        private String primaryDirector;
        private String primaryAssociate;

        public RoundtableBuilder id(Long id) { this.id = id; return this; }
        public RoundtableBuilder name(String name) { this.name = name; return this; }
        public RoundtableBuilder abbreviation(String abbreviation) { this.abbreviation = abbreviation; return this; }
        public RoundtableBuilder clientsWithAccess(Integer clientsWithAccess) { this.clientsWithAccess = clientsWithAccess; return this; }
        public RoundtableBuilder directors(String directors) { this.directors = directors; return this; }
        public RoundtableBuilder associates(String associates) { this.associates = associates; return this; }
        public RoundtableBuilder description(String description) { this.description = description; return this; }
        public RoundtableBuilder status(String status) { this.status = status; return this; }
        public RoundtableBuilder clientIds(String clientIds) { this.clientIds = clientIds; return this; }
        public RoundtableBuilder directorIds(String directorIds) { this.directorIds = directorIds; return this; }
        public RoundtableBuilder associateIds(String associateIds) { this.associateIds = associateIds; return this; }
        public RoundtableBuilder primaryDirector(String primaryDirector) { this.primaryDirector = primaryDirector; return this; }
        public RoundtableBuilder primaryAssociate(String primaryAssociate) { this.primaryAssociate = primaryAssociate; return this; }

        public Roundtable build() {
            return new Roundtable(id, name, abbreviation, clientsWithAccess, directors, associates,
                    description, status, clientIds, directorIds, associateIds, primaryDirector, primaryAssociate);
        }
    }
}
