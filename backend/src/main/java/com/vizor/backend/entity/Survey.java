package com.vizor.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "surveys")
public class Survey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String entity;

    @Column(name = "survey_type", nullable = false)
    private String surveyType;

    @Column(name = "survey_name")
    private String surveyName;

    private String period;

    @Column(name = "period_number")
    private String periodNumber;

    @Column(name = "survey_year")
    private Integer year;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    @Column(name = "first_alert_date")
    private String firstAlertDate;

    @Column(name = "reminder_date")
    private String reminderDate;

    @Column(name = "is_interactive_reports")
    private Boolean isInteractiveReports;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "last_step")
    private Integer lastStep;

    private String status;

    @Lob
    @Column(name = "question_sections")
    private String questionSections;

    @Lob
    @Column(name = "participant_selections")
    private String participantSelections;

    public Survey() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getEntity() {
        return entity;
    }

    public void setEntity(String entity) {
        this.entity = entity;
    }

    public String getSurveyType() {
        return surveyType;
    }

    public void setSurveyType(String surveyType) {
        this.surveyType = surveyType;
    }

    public String getSurveyName() {
        return surveyName;
    }

    public void setSurveyName(String surveyName) {
        this.surveyName = surveyName;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public String getPeriodNumber() {
        return periodNumber;
    }

    public void setPeriodNumber(String periodNumber) {
        this.periodNumber = periodNumber;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getFirstAlertDate() {
        return firstAlertDate;
    }

    public void setFirstAlertDate(String firstAlertDate) {
        this.firstAlertDate = firstAlertDate;
    }

    public String getReminderDate() {
        return reminderDate;
    }

    public void setReminderDate(String reminderDate) {
        this.reminderDate = reminderDate;
    }

    public Boolean getIsInteractiveReports() {
        return isInteractiveReports;
    }

    public void setIsInteractiveReports(Boolean interactiveReports) {
        isInteractiveReports = interactiveReports;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public Integer getLastStep() {
        return lastStep;
    }

    public void setLastStep(Integer lastStep) {
        this.lastStep = lastStep;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getQuestionSections() {
        return questionSections;
    }

    public void setQuestionSections(String questionSections) {
        this.questionSections = questionSections;
    }

    public String getParticipantSelections() {
        return participantSelections;
    }

    public void setParticipantSelections(String participantSelections) {
        this.participantSelections = participantSelections;
    }
}
