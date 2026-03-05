package com.attendance.backend.controller;

import com.attendance.backend.model.User;
import com.attendance.backend.model.Role;
import com.attendance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Map<String, Object> buildResponse(boolean success, Object data, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", success);
        if (data != null) {
            body.put("data", data);
        }
        if (message != null) {
            body.put("message", message);
        }
        return body;
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            if (user.getEmail() == null || user.getPassword() == null || user.getName() == null || user.getRole() == null) {
                return ResponseEntity
                        .badRequest()
                        .body(buildResponse(false, null, "Missing required fields: name, email, password, role"));
            }

            // Validate role against enum while still storing lowercase to match existing data
            try {
                Role.valueOf(user.getRole().toUpperCase());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity
                        .badRequest()
                        .body(buildResponse(false, null, "Invalid role. Allowed values: ADMIN, FACULTY, STUDENT"));
            }

            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(buildResponse(false, null, "Email already exists"));
            }

            // Normalize and secure fields
            user.setRole(user.getRole().toLowerCase());
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            if (user.getStatus() == null) {
                user.setStatus("PENDING");
            }

            // Automatically generate a unique QR token for students
            if ("student".equalsIgnoreCase(user.getRole()) && user.getQrToken() == null) {
                user.setQrToken(UUID.randomUUID().toString());
            }

            User saved = userRepository.save(user);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(buildResponse(true, saved, "User created successfully"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(buildResponse(false, null, "Failed to create user. Please check input and try again."));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> existing = userRepository.findById(id);
        if (existing.isPresent()) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(
                    buildResponse(true, null, "User and associated QR token successfully deleted."));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildResponse(false, null, "User not found"));
    }

    @GetMapping("/users/pending/{role}")
    public ResponseEntity<?> getPendingUsers(@PathVariable String role) {
        log.info("GET /api/admin/users/pending/{}", role);
        return ResponseEntity.ok(
                buildResponse(true, userRepository.findByRoleAndStatus(role, "PENDING"), "Pending users loaded"));
    }

    @PatchMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        log.info("PATCH /api/admin/users/{}/approve", id);
        Optional<User> existing = userRepository.findById(id);
        if (existing.isPresent()) {
            User user = existing.get();
            user.setStatus("ACTIVE");
            // Automatically generate a unique QR token for students
            if ("student".equalsIgnoreCase(user.getRole()) && user.getQrToken() == null) {
                user.setQrToken(UUID.randomUUID().toString());
            }
            userRepository.save(user);
            return ResponseEntity.ok(
                    buildResponse(true, user, "User approved successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildResponse(false, null, "User not found"));
    }

    @DeleteMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        log.info("DELETE /api/admin/users/{}/reject", id);
        Optional<User> existing = userRepository.findById(id);
        if (existing.isPresent()) {
            User user = existing.get();
            user.setStatus("REJECTED");
            userRepository.save(user);
            return ResponseEntity.ok(
                    buildResponse(true, user, "User rejected successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildResponse(false, null, "User not found"));
    }
}
