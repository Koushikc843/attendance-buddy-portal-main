package com.attendance.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterStudentRequest {
    private String name;
    private String email;
    private String password;
    private String usn;
    private String department;
    private Integer year;
}
