package com.vizor.backend.dto;

import java.time.LocalDateTime;

public class UserDto {

    private Long id;
    private String email;
    private String role;
    private String name;
    private String firstName;
    private String lastName;
    private String title;
    private String countryCode;
    private String phone;
    private String salesforceCode;
    private Boolean primaryContact;
    private String clientName;
    private String roundtables;
    private Boolean active;
    private Boolean locked;
    private Boolean suspended;
    private Boolean enableNotifications;
    private LocalDateTime expiryDate;
    private LocalDateTime lastLoggedIn;
    private String password;

    public UserDto() {}

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getName() { return name; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getTitle() { return title; }
    public String getCountryCode() { return countryCode; }
    public String getPhone() { return phone; }
    public String getSalesforceCode() { return salesforceCode; }
    public Boolean getPrimaryContact() { return primaryContact; }
    public String getClientName() { return clientName; }
    public String getRoundtables() { return roundtables; }
    public Boolean getActive() { return active; }
    public Boolean getLocked() { return locked; }
    public Boolean getSuspended() { return suspended; }
    public Boolean getEnableNotifications() { return enableNotifications; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public LocalDateTime getLastLoggedIn() { return lastLoggedIn; }
    public String getPassword() { return password; }

    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(String role) { this.role = role; }
    public void setName(String name) { this.name = name; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setTitle(String title) { this.title = title; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setSalesforceCode(String salesforceCode) { this.salesforceCode = salesforceCode; }
    public void setPrimaryContact(Boolean primaryContact) { this.primaryContact = primaryContact; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public void setRoundtables(String roundtables) { this.roundtables = roundtables; }
    public void setActive(Boolean active) { this.active = active; }
    public void setLocked(Boolean locked) { this.locked = locked; }
    public void setSuspended(Boolean suspended) { this.suspended = suspended; }
    public void setEnableNotifications(Boolean enableNotifications) { this.enableNotifications = enableNotifications; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public void setLastLoggedIn(LocalDateTime lastLoggedIn) { this.lastLoggedIn = lastLoggedIn; }
    public void setPassword(String password) { this.password = password; }
}
