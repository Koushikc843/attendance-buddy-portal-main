package com.attendance.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private Long id;
    private String name;
    private String email;
    private String currentPassword;
    private String newPassword;
}

