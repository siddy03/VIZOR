package com.vizor.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vizor.backend.dto.ClientDto;
import com.vizor.backend.entity.Client;
import com.vizor.backend.repository.ClientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClientService {

    private final ClientRepository repository;
    private final ObjectMapper objectMapper;

    public ClientService(ClientRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public List<ClientDto> getAll() {
        return repository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ClientDto> getById(Long id) {
        return repository.findById(id).map(this::toDto);
    }

    public ClientDto create(ClientDto dto) {
        Client entity = toEntity(dto);
        entity.setId(null);
        Client saved = repository.save(entity);
        return toDto(saved);
    }

    public Optional<ClientDto> update(Long id, ClientDto dto) {
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        Client entity = toEntity(dto);
        entity.setId(id);
        Client saved = repository.save(entity);
        return Optional.of(toDto(saved));
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    private ClientDto toDto(Client entity) {
        return ClientDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .abbreviation(entity.getAbbreviation())
                .parentClient(entity.getParentClient())
                .peerGroups(entity.getPeerGroups())
                .roundtables(entity.getRoundtables())
                .projects(entity.getProjects())
                .domains(parseStringList(entity.getDomains()))
                .identityProvider(entity.getIdentityProvider())
                .active(entity.isActive())
                .selfDatabase(entity.isSelfDatabase())
                .status(entity.getStatus())
                .peerGroupIds(parseJson(entity.getPeerGroupIds()))
                .roundtableIds(parseJson(entity.getRoundtableIds()))
                .projectIds(parseJson(entity.getProjectIds()))
                .build();
    }

    private Client toEntity(ClientDto dto) {
        return Client.builder()
                .id(dto.getId())
                .name(dto.getName())
                .abbreviation(dto.getAbbreviation())
                .parentClient(dto.getParentClient())
                .peerGroups(dto.getPeerGroups())
                .roundtables(dto.getRoundtables())
                .projects(dto.getProjects())
                .domains(toJson(dto.getDomains()))
                .identityProvider(dto.getIdentityProvider())
                .active(dto.isActive())
                .selfDatabase(dto.isSelfDatabase())
                .status(dto.getStatus())
                .peerGroupIds(toJson(dto.getPeerGroupIds()))
                .roundtableIds(toJson(dto.getRoundtableIds()))
                .projectIds(toJson(dto.getProjectIds()))
                .build();
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return obj.toString();
        }
    }

    private Object parseJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (JsonProcessingException e) {
            return json;
        }
    }

    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }
}
