package com.vizor.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String abbreviation;

    @Column(name = "parent_client")
    private String parentClient;

    @Column(name = "peer_groups")
    private String peerGroups;

    private String roundtables;

    private String projects;

    @Column(columnDefinition = "TEXT")
    private String domains;

    @Column(name = "identity_provider")
    private String identityProvider;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "self_database", nullable = false)
    private boolean selfDatabase;

    @Column(nullable = false)
    private String status;

    @Column(name = "peer_group_ids", columnDefinition = "TEXT")
    private String peerGroupIds;

    @Column(name = "roundtable_ids", columnDefinition = "TEXT")
    private String roundtableIds;

    @Column(name = "project_ids", columnDefinition = "TEXT")
    private String projectIds;

    public Client() {}

    public Client(Long id, String name, String abbreviation, String parentClient, String peerGroups,
                  String roundtables, String projects, String domains, String identityProvider,
                  boolean active, boolean selfDatabase, String status,
                  String peerGroupIds, String roundtableIds, String projectIds) {
        this.id = id;
        this.name = name;
        this.abbreviation = abbreviation;
        this.parentClient = parentClient;
        this.peerGroups = peerGroups;
        this.roundtables = roundtables;
        this.projects = projects;
        this.domains = domains;
        this.identityProvider = identityProvider;
        this.active = active;
        this.selfDatabase = selfDatabase;
        this.status = status;
        this.peerGroupIds = peerGroupIds;
        this.roundtableIds = roundtableIds;
        this.projectIds = projectIds;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAbbreviation() { return abbreviation; }
    public String getParentClient() { return parentClient; }
    public String getPeerGroups() { return peerGroups; }
    public String getRoundtables() { return roundtables; }
    public String getProjects() { return projects; }
    public String getDomains() { return domains; }
    public String getIdentityProvider() { return identityProvider; }
    public boolean isActive() { return active; }
    public boolean isSelfDatabase() { return selfDatabase; }
    public String getStatus() { return status; }
    public String getPeerGroupIds() { return peerGroupIds; }
    public String getRoundtableIds() { return roundtableIds; }
    public String getProjectIds() { return projectIds; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
    public void setParentClient(String parentClient) { this.parentClient = parentClient; }
    public void setPeerGroups(String peerGroups) { this.peerGroups = peerGroups; }
    public void setRoundtables(String roundtables) { this.roundtables = roundtables; }
    public void setProjects(String projects) { this.projects = projects; }
    public void setDomains(String domains) { this.domains = domains; }
    public void setIdentityProvider(String identityProvider) { this.identityProvider = identityProvider; }
    public void setActive(boolean active) { this.active = active; }
    public void setSelfDatabase(boolean selfDatabase) { this.selfDatabase = selfDatabase; }
    public void setStatus(String status) { this.status = status; }
    public void setPeerGroupIds(String peerGroupIds) { this.peerGroupIds = peerGroupIds; }
    public void setRoundtableIds(String roundtableIds) { this.roundtableIds = roundtableIds; }
    public void setProjectIds(String projectIds) { this.projectIds = projectIds; }

    public static ClientBuilder builder() { return new ClientBuilder(); }

    public static class ClientBuilder {
        private Long id;
        private String name;
        private String abbreviation;
        private String parentClient;
        private String peerGroups;
        private String roundtables;
        private String projects;
        private String domains;
        private String identityProvider;
        private boolean active;
        private boolean selfDatabase;
        private String status;
        private String peerGroupIds;
        private String roundtableIds;
        private String projectIds;

        public ClientBuilder id(Long id) { this.id = id; return this; }
        public ClientBuilder name(String name) { this.name = name; return this; }
        public ClientBuilder abbreviation(String abbreviation) { this.abbreviation = abbreviation; return this; }
        public ClientBuilder parentClient(String parentClient) { this.parentClient = parentClient; return this; }
        public ClientBuilder peerGroups(String peerGroups) { this.peerGroups = peerGroups; return this; }
        public ClientBuilder roundtables(String roundtables) { this.roundtables = roundtables; return this; }
        public ClientBuilder projects(String projects) { this.projects = projects; return this; }
        public ClientBuilder domains(String domains) { this.domains = domains; return this; }
        public ClientBuilder identityProvider(String identityProvider) { this.identityProvider = identityProvider; return this; }
        public ClientBuilder active(boolean active) { this.active = active; return this; }
        public ClientBuilder selfDatabase(boolean selfDatabase) { this.selfDatabase = selfDatabase; return this; }
        public ClientBuilder status(String status) { this.status = status; return this; }
        public ClientBuilder peerGroupIds(String peerGroupIds) { this.peerGroupIds = peerGroupIds; return this; }
        public ClientBuilder roundtableIds(String roundtableIds) { this.roundtableIds = roundtableIds; return this; }
        public ClientBuilder projectIds(String projectIds) { this.projectIds = projectIds; return this; }

        public Client build() {
            return new Client(id, name, abbreviation, parentClient, peerGroups, roundtables, projects,
                    domains, identityProvider, active, selfDatabase, status,
                    peerGroupIds, roundtableIds, projectIds);
        }
    }
}
