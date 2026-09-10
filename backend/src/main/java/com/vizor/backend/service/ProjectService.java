package com.vizor.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vizor.backend.dto.ProjectDto;
import com.vizor.backend.entity.Project;
import com.vizor.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository repository;
    private final ObjectMapper objectMapper;

    public ProjectService(ProjectRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public List<ProjectDto> getAll() {
        return repository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ProjectDto> getById(Long id) {
        return repository.findById(id).map(this::toDto);
    }

    public ProjectDto create(ProjectDto dto) {
        Project entity = toEntity(dto);
        entity.setId(null); // ensure new entity
        Project saved = repository.save(entity);
        return toDto(saved);
    }

    public Optional<ProjectDto> update(Long id, ProjectDto dto) {
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        Project entity = toEntity(dto);
        entity.setId(id);
        Project saved = repository.save(entity);
        return Optional.of(toDto(saved));
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    // ---- Mapping helpers ----

    private ProjectDto toDto(Project entity) {
        return ProjectDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .abbreviation(entity.getAbbreviation())
                .clientsWithAccess(entity.getClientsWithAccess())
                .directors(entity.getDirectors())
                .associates(entity.getAssociates())
                .projectType(entity.getProjectType())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .clientIds(parseJson(entity.getClientIds()))
                .directorIds(parseJson(entity.getDirectorIds()))
                .associateIds(parseJson(entity.getAssociateIds()))
                .primaryDirector(parseJson(entity.getPrimaryDirector()))
                .primaryAssociate(parseJson(entity.getPrimaryAssociate()))
                .selectedProjectType(parseJson(entity.getSelectedProjectType()))
                .build();
    }

    private Project toEntity(ProjectDto dto) {
        return Project.builder()
                .id(dto.getId())
                .name(dto.getName())
                .abbreviation(dto.getAbbreviation())
                .clientsWithAccess(dto.getClientsWithAccess())
                .directors(dto.getDirectors())
                .associates(dto.getAssociates())
                .projectType(dto.getProjectType())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .clientIds(toJson(dto.getClientIds()))
                .directorIds(toJson(dto.getDirectorIds()))
                .associateIds(toJson(dto.getAssociateIds()))
                .primaryDirector(toJson(dto.getPrimaryDirector()))
                .primaryAssociate(toJson(dto.getPrimaryAssociate()))
                .selectedProjectType(toJson(dto.getSelectedProjectType()))
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
}
