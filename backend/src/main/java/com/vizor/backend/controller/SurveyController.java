package com.vizor.backend.controller;

import com.vizor.backend.dto.SurveyDto;
import com.vizor.backend.service.SurveyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    private final SurveyService surveyService;

    public SurveyController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    @GetMapping
    public ResponseEntity<List<SurveyDto>> getAll() {
        return ResponseEntity.ok(surveyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SurveyDto> getById(@PathVariable Long id) {
        return surveyService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SurveyDto> create(@RequestBody SurveyDto dto) {
        SurveyDto created = surveyService.create(dto);
        return ResponseEntity
                .created(URI.create("/api/surveys/" + created.getId()))
                .body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SurveyDto> update(@PathVariable Long id, @RequestBody SurveyDto dto) {
        return surveyService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (surveyService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
