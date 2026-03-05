package com.attendance.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // "student", "faculty", "admin"

    @Column(nullable = false)
    private String status = "PENDING"; // "PENDING", "ACTIVE", "REJECTED"

    @Column
    private String department;

    @Column(name = "enrollment_year")
    private Integer year; // For students

    @Column(unique = true)
    private String usn; // For students

    @Column(unique = true)
    private String facultyId; // For faculty

    @Column(unique = true)
    private String qrToken; // unique QR token for attendance

    @Column
    private String qrCodePath; // Path or URL to the downloadable QR code image
}
