package com.vizor.backend.dto;

public class SurveyDto {

    private Long id;
    private String source;
    private String entity;
    private String surveyType;
    private String surveyName;
    private String period;
    private String periodNumber;
    private Integer year;
    private String startDate;
    private String endDate;
    private String firstAlertDate;
    private String reminderDate;
    private Boolean isInteractiveReports;
    private Boolean isActive;
    private Integer lastStep;
    private String status;
    private Object questionSections;
    private Object participantSelections;

    public SurveyDto() {
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

    public Object getQuestionSections() {
        return questionSections;
    }

    public void setQuestionSections(Object questionSections) {
        this.questionSections = questionSections;
    }

    public Object getParticipantSelections() {
        return participantSelections;
    }

    public void setParticipantSelections(Object participantSelections) {
        this.participantSelections = participantSelections;
    }
}
