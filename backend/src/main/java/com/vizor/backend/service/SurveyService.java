package com.vizor.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vizor.backend.dto.SurveyDto;
import com.vizor.backend.entity.Survey;
import com.vizor.backend.repository.SurveyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SurveyService {

    private final SurveyRepository repository;
    private final ObjectMapper objectMapper;

    public SurveyService(SurveyRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public List<SurveyDto> getAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public Optional<SurveyDto> getById(Long id) {
        return repository.findById(id).map(this::toDto);
    }

    public SurveyDto create(SurveyDto dto) {
        Survey survey = toEntity(dto);
        survey.setId(null);
        Survey saved = repository.save(survey);
        return toDto(saved);
    }

    public Optional<SurveyDto> update(Long id, SurveyDto dto) {
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        Survey survey = toEntity(dto);
        survey.setId(id);
        Survey saved = repository.save(survey);
        return Optional.of(toDto(saved));
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    private SurveyDto toDto(Survey survey) {
        SurveyDto dto = new SurveyDto();
        dto.setId(survey.getId());
        dto.setSource(survey.getSource());
        dto.setEntity(survey.getEntity());
        dto.setSurveyType(survey.getSurveyType());
        dto.setSurveyName(survey.getSurveyName());
        dto.setPeriod(survey.getPeriod());
        dto.setPeriodNumber(survey.getPeriodNumber());
        dto.setYear(survey.getYear());
        dto.setStartDate(survey.getStartDate());
        dto.setEndDate(survey.getEndDate());
        dto.setFirstAlertDate(survey.getFirstAlertDate());
        dto.setReminderDate(survey.getReminderDate());
        dto.setIsInteractiveReports(survey.getIsInteractiveReports());
        dto.setIsActive(survey.getIsActive());
        dto.setLastStep(survey.getLastStep());
        dto.setStatus(survey.getStatus());
        dto.setQuestionSections(parseJson(survey.getQuestionSections()));
        dto.setParticipantSelections(parseJson(survey.getParticipantSelections()));
        return dto;
    }

    private Survey toEntity(SurveyDto dto) {
        Survey survey = new Survey();
        survey.setId(dto.getId());
        survey.setSource(dto.getSource());
        survey.setEntity(dto.getEntity());
        survey.setSurveyType(dto.getSurveyType());
        survey.setSurveyName(dto.getSurveyName());
        survey.setPeriod(dto.getPeriod());
        survey.setPeriodNumber(dto.getPeriodNumber());
        survey.setYear(dto.getYear());
        survey.setStartDate(dto.getStartDate());
        survey.setEndDate(dto.getEndDate());
        survey.setFirstAlertDate(dto.getFirstAlertDate());
        survey.setReminderDate(dto.getReminderDate());
        survey.setIsInteractiveReports(dto.getIsInteractiveReports());
        survey.setIsActive(dto.getIsActive());
        survey.setLastStep(dto.getLastStep());
        survey.setStatus(dto.getStatus());
        survey.setQuestionSections(toJson(dto.getQuestionSections()));
        survey.setParticipantSelections(toJson(dto.getParticipantSelections()));
        return survey;
    }

    private String toJson(Object object) {
        if (object == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private Object parseJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
