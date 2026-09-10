package com.vizor.backend.dto;

import java.util.List;

public class ClientDto {

    private Long id;
    private String name;
    private String abbreviation;
    private String parentClient;
    private String peerGroups;
    private String roundtables;
    private String projects;
    private List<String> domains;
    private String identityProvider;
    private boolean active;
    private boolean selfDatabase;
    private String status;
    private Object peerGroupIds;
    private Object roundtableIds;
    private Object projectIds;

    public ClientDto() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAbbreviation() { return abbreviation; }
    public String getParentClient() { return parentClient; }
    public String getPeerGroups() { return peerGroups; }
    public String getRoundtables() { return roundtables; }
    public String getProjects() { return projects; }
    public List<String> getDomains() { return domains; }
    public String getIdentityProvider() { return identityProvider; }
    public boolean isActive() { return active; }
    public boolean isSelfDatabase() { return selfDatabase; }
    public String getStatus() { return status; }
    public Object getPeerGroupIds() { return peerGroupIds; }
    public Object getRoundtableIds() { return roundtableIds; }
    public Object getProjectIds() { return projectIds; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
    public void setParentClient(String parentClient) { this.parentClient = parentClient; }
    public void setPeerGroups(String peerGroups) { this.peerGroups = peerGroups; }
    public void setRoundtables(String roundtables) { this.roundtables = roundtables; }
    public void setProjects(String projects) { this.projects = projects; }
    public void setDomains(List<String> domains) { this.domains = domains; }
    public void setIdentityProvider(String identityProvider) { this.identityProvider = identityProvider; }
    public void setActive(boolean active) { this.active = active; }
    public void setSelfDatabase(boolean selfDatabase) { this.selfDatabase = selfDatabase; }
    public void setStatus(String status) { this.status = status; }
    public void setPeerGroupIds(Object peerGroupIds) { this.peerGroupIds = peerGroupIds; }
    public void setRoundtableIds(Object roundtableIds) { this.roundtableIds = roundtableIds; }
    public void setProjectIds(Object projectIds) { this.projectIds = projectIds; }

    public static ClientDtoBuilder builder() { return new ClientDtoBuilder(); }

    public static class ClientDtoBuilder {
        private final ClientDto dto = new ClientDto();

        public ClientDtoBuilder id(Long id) { dto.id = id; return this; }
        public ClientDtoBuilder name(String name) { dto.name = name; return this; }
        public ClientDtoBuilder abbreviation(String abbreviation) { dto.abbreviation = abbreviation; return this; }
        public ClientDtoBuilder parentClient(String parentClient) { dto.parentClient = parentClient; return this; }
        public ClientDtoBuilder peerGroups(String peerGroups) { dto.peerGroups = peerGroups; return this; }
        public ClientDtoBuilder roundtables(String roundtables) { dto.roundtables = roundtables; return this; }
        public ClientDtoBuilder projects(String projects) { dto.projects = projects; return this; }
        public ClientDtoBuilder domains(List<String> domains) { dto.domains = domains; return this; }
        public ClientDtoBuilder identityProvider(String identityProvider) { dto.identityProvider = identityProvider; return this; }
        public ClientDtoBuilder active(boolean active) { dto.active = active; return this; }
        public ClientDtoBuilder selfDatabase(boolean selfDatabase) { dto.selfDatabase = selfDatabase; return this; }
        public ClientDtoBuilder status(String status) { dto.status = status; return this; }
        public ClientDtoBuilder peerGroupIds(Object peerGroupIds) { dto.peerGroupIds = peerGroupIds; return this; }
        public ClientDtoBuilder roundtableIds(Object roundtableIds) { dto.roundtableIds = roundtableIds; return this; }
        public ClientDtoBuilder projectIds(Object projectIds) { dto.projectIds = projectIds; return this; }

        public ClientDto build() { return dto; }
    }
}
