package com.vizor.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_requests")
public class UserRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String role;

    @Column(columnDefinition = "TEXT")
    private String roundtables;

    @Column(name = "client_name")
    private String clientName;

    @Column(name = "requested_by")
    private String requestedBy;

    @Column(name = "request_status")
    private String requestStatus;

    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public UserRequest() {}

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getRole() { return role; }
    public String getRoundtables() { return roundtables; }
    public String getClientName() { return clientName; }
    public String getRequestedBy() { return requestedBy; }
    public String getRequestStatus() { return requestStatus; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setRole(String role) { this.role = role; }
    public void setRoundtables(String roundtables) { this.roundtables = roundtables; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    public void setRequestStatus(String requestStatus) { this.requestStatus = requestStatus; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
