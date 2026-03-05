package com.attendance.backend.service;

import com.attendance.backend.model.User;
import com.attendance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public User login(String email, String password, String role) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword()) && user.getRole().equalsIgnoreCase(role)) {
                if ("PENDING".equalsIgnoreCase(user.getStatus()) || "REJECTED".equalsIgnoreCase(user.getStatus())) {
                    throw new RuntimeException("Account is " + user.getStatus() + ". Please contact admin.");
                }
                // Ensure students always have a permanent QR token
                if ("student".equalsIgnoreCase(user.getRole()) && user.getQrToken() == null) {
                    user.setQrToken(UUID.randomUUID().toString());
                    userRepository.save(user);
                }
                return user;
            }
        }
        return null; // Invalid credentials
    }

    public User registerStudent(String name, String email, String password, String usn, String department,
            Integer year) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("student");
        user.setStatus("PENDING");
        user.setUsn(usn);
        user.setDepartment(department);
        user.setYear(year);
        return userRepository.save(user);
    }

    public User registerFaculty(String name, String email, String password, String facultyId, String department) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("faculty");
        user.setStatus("PENDING");
        user.setFacultyId(facultyId);
        user.setDepartment(department);
        return userRepository.save(user);
    }
}
