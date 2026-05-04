package com.vizor.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vizor.backend.dto.RoundtableDto;
import com.vizor.backend.entity.Roundtable;
import com.vizor.backend.repository.RoundtableRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoundtableService {

    private final RoundtableRepository repository;
    private final ObjectMapper objectMapper;

    public RoundtableService(RoundtableRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public List<RoundtableDto> getAll() {
        return repository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<RoundtableDto> getById(Long id) {
        return repository.findById(id).map(this::toDto);
    }

    public RoundtableDto create(RoundtableDto dto) {
        Roundtable entity = toEntity(dto);
        entity.setId(null); // ensure new entity
        Roundtable saved = repository.save(entity);
        return toDto(saved);
    }

    public Optional<RoundtableDto> update(Long id, RoundtableDto dto) {
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        Roundtable entity = toEntity(dto);
        entity.setId(id);
        Roundtable saved = repository.save(entity);
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

    private RoundtableDto toDto(Roundtable entity) {
        return RoundtableDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .abbreviation(entity.getAbbreviation())
                .clientsWithAccess(entity.getClientsWithAccess())
                .directors(entity.getDirectors())
                .associates(entity.getAssociates())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .clientIds(parseJson(entity.getClientIds()))
                .directorIds(parseJson(entity.getDirectorIds()))
                .associateIds(parseJson(entity.getAssociateIds()))
                .primaryDirector(parseJson(entity.getPrimaryDirector()))
                .primaryAssociate(parseJson(entity.getPrimaryAssociate()))
                .build();
    }

    private Roundtable toEntity(RoundtableDto dto) {
        return Roundtable.builder()
                .id(dto.getId())
                .name(dto.getName())
                .abbreviation(dto.getAbbreviation())
                .clientsWithAccess(dto.getClientsWithAccess())
                .directors(dto.getDirectors())
                .associates(dto.getAssociates())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .clientIds(toJson(dto.getClientIds()))
                .directorIds(toJson(dto.getDirectorIds()))
                .associateIds(toJson(dto.getAssociateIds()))
                .primaryDirector(toJson(dto.getPrimaryDirector()))
                .primaryAssociate(toJson(dto.getPrimaryAssociate()))
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
