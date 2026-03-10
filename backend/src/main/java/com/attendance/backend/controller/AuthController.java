package com.attendance.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.attendance.backend.model.LoginRequest;
import com.attendance.backend.model.RegisterFacultyRequest;
import com.attendance.backend.model.RegisterStudentRequest;
import com.attendance.backend.model.UpdateProfileRequest;
import com.attendance.backend.model.User;
import com.attendance.backend.service.AuthService;
@CrossOrigin(origins = "https://attendance-buddy-portal-main-frontend.onrender.com")

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;


    @GetMapping("/health")
public String health() {
    return "Server running";
}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = authService.login(loginRequest.getEmail(), loginRequest.getPassword(), loginRequest.getRole());

            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");

                // Avoid sending password back
                User userResponse = new User();
                userResponse.setId(user.getId());
                userResponse.setName(user.getName());
                userResponse.setEmail(user.getEmail());
                userResponse.setRole(user.getRole());
                userResponse.setStatus(user.getStatus());
                userResponse.setQrToken(user.getQrToken());

                response.put("user", userResponse);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid email, password, or role.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@RequestBody RegisterStudentRequest request) {
        try {
            authService.registerStudent(request.getName(), request.getEmail(), request.getPassword(),
                    request.getUsn(), request.getDepartment(), request.getYear(), request.getCourseIds());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful. Please wait for admin approval.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/register/faculty")
    public ResponseEntity<?> registerFaculty(@RequestBody RegisterFacultyRequest request) {
        try {
            authService.registerFaculty(request.getName(), request.getEmail(), request.getPassword(),
                    request.getFacultyId(), request.getDepartment(), request.getCourseName());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful. Please wait for admin approval.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            User updatedUser = authService.updateProfile(
                    request.getId(),
                    request.getName(),
                    request.getEmail(),
                    request.getCurrentPassword(),
                    request.getNewPassword());

            User userResponse = new User();
            userResponse.setId(updatedUser.getId());
            userResponse.setName(updatedUser.getName());
            userResponse.setEmail(updatedUser.getEmail());
            userResponse.setRole(updatedUser.getRole());
            userResponse.setStatus(updatedUser.getStatus());
            userResponse.setQrToken(updatedUser.getQrToken());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", userResponse);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
