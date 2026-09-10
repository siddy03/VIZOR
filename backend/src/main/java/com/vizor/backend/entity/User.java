package com.vizor.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String name;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String title;

    @Column(name = "country_code")
    private String countryCode;

    private String phone;

    @Column(name = "salesforce_code")
    private String salesforceCode;

    @Column(name = "primary_contact")
    private Boolean primaryContact;

    @Column(name = "client_name")
    private String clientName;

    @Column(columnDefinition = "TEXT")
    private String roundtables;

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "is_locked")
    private Boolean locked;

    @Column(name = "is_suspended")
    private Boolean suspended;

    @Column(name = "enable_notifications")
    private Boolean enableNotifications;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "last_logged_in")
    private LocalDateTime lastLoggedIn;

    public User() {}

    public User(Long id, String email, String password, String role, String name) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.name = name;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
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

    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
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

    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private final User u = new User();

        public UserBuilder id(Long id) { u.id = id; return this; }
        public UserBuilder email(String email) { u.email = email; return this; }
        public UserBuilder password(String password) { u.password = password; return this; }
        public UserBuilder role(String role) { u.role = role; return this; }
        public UserBuilder name(String name) { u.name = name; return this; }
        public UserBuilder firstName(String firstName) { u.firstName = firstName; return this; }
        public UserBuilder lastName(String lastName) { u.lastName = lastName; return this; }
        public UserBuilder title(String title) { u.title = title; return this; }
        public UserBuilder countryCode(String countryCode) { u.countryCode = countryCode; return this; }
        public UserBuilder phone(String phone) { u.phone = phone; return this; }
        public UserBuilder salesforceCode(String salesforceCode) { u.salesforceCode = salesforceCode; return this; }
        public UserBuilder primaryContact(Boolean primaryContact) { u.primaryContact = primaryContact; return this; }
        public UserBuilder clientName(String clientName) { u.clientName = clientName; return this; }
        public UserBuilder roundtables(String roundtables) { u.roundtables = roundtables; return this; }
        public UserBuilder active(Boolean active) { u.active = active; return this; }
        public UserBuilder locked(Boolean locked) { u.locked = locked; return this; }
        public UserBuilder suspended(Boolean suspended) { u.suspended = suspended; return this; }
        public UserBuilder enableNotifications(Boolean enableNotifications) { u.enableNotifications = enableNotifications; return this; }
        public UserBuilder expiryDate(LocalDateTime expiryDate) { u.expiryDate = expiryDate; return this; }
        public UserBuilder lastLoggedIn(LocalDateTime lastLoggedIn) { u.lastLoggedIn = lastLoggedIn; return this; }

        public User build() { return u; }
    }
}
