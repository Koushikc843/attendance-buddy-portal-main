package com.attendance.backend.service;

import com.attendance.backend.model.Course;
import com.attendance.backend.model.CourseEnrollment;
import com.attendance.backend.model.User;
import com.attendance.backend.repository.CourseEnrollmentRepository;
import com.attendance.backend.repository.CourseRepository;
import com.attendance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

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
                                Integer year, List<Long> courseIds) {
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

        User saved = userRepository.save(user);

        if (courseIds != null && !courseIds.isEmpty()) {
            List<Course> courses = courseRepository.findAllById(courseIds);
            for (Course course : courses) {
                enrollmentRepository.save(new CourseEnrollment(null, saved, course));
            }
        }

        return saved;
    }

    public User registerFaculty(String name, String email, String password, String facultyId, String department,
                                String courseName) {
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

        User saved = userRepository.save(user);

        if (courseName != null && !courseName.isBlank()) {
            String generatedCode = courseName
                    .trim()
                    .toUpperCase()
                    .replaceAll("\\s+", "-");
            if (generatedCode.length() > 12) {
                generatedCode = generatedCode.substring(0, 12);
            }
            Course course = new Course(null, generatedCode, courseName, saved);
            courseRepository.save(course);
        }

        return saved;
    }

    public User updateProfile(Long id, String name, String email, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentPassword != null && !currentPassword.isBlank()) {
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
        }

        if (name != null && !name.isBlank()) {
            user.setName(name);
        }

        if (email != null && !email.isBlank()) {
            // If email is changed, ensure it is not already used by another account
            userRepository.findByEmail(email)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new RuntimeException("Email already exists");
                    });
            user.setEmail(email);
        }

        if (newPassword != null && !newPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        return userRepository.save(user);
    }
}
