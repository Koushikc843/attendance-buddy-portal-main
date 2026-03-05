package com.attendance.backend.controller;

import com.attendance.backend.model.LoginRequest;
import com.attendance.backend.model.RegisterFacultyRequest;
import com.attendance.backend.model.RegisterStudentRequest;
import com.attendance.backend.model.User;
import com.attendance.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

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
            User user = authService.registerStudent(request.getName(), request.getEmail(), request.getPassword(),
                    request.getUsn(), request.getDepartment(), request.getYear());
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
            User user = authService.registerFaculty(request.getName(), request.getEmail(), request.getPassword(),
                    request.getFacultyId(), request.getDepartment());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful. Please wait for admin approval.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
