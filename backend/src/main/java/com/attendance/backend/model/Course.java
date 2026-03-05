package com.attendance.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code; // e.g. "CS201"

    @Column(nullable = false)
    private String name; // e.g. "Data Structures"

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    private User faculty;
}
