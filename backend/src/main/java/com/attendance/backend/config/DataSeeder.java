package com.attendance.backend.config;

import com.attendance.backend.model.*;
import com.attendance.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataSeeder {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private ClassSessionRepository sessionRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Seed Students
            User koushik = createUser("Koushik", "koushik@gmail.com", "student", "dummy-qr-1");
            User shreedevi = createUser("Shreedevi", "shreedevi@gmail.com", "student", "dummy-qr-2");
            User pooja = createUser("Pooja", "pooja@gmail.com", "student", "dummy-qr-3");
            User mahadev = createUser("Mahadev", "mahadev@gmail.com", "student", "dummy-qr-4");
            User sudarshan = createUser("Sudarshan", "sudarshan@gmail.com", "student", "dummy-qr-5");

            // Seed Faculty
            User darshan = createUser("Darshan", "darshan@gmail.com", "faculty", null);
            User vaibhav = createUser("Vaibhav", "vaibhav@gmail.com", "faculty", null);
            User datta = createUser("Datta", "datta@gmail.com", "faculty", null);

            // Seed Admin
            User sneha = createUser("Sneha", "sneha@gmail.com", "admin", null);

            userRepository.saveAll(Arrays.asList(
                    koushik, shreedevi, pooja, mahadev, sudarshan,
                    darshan, vaibhav, datta, sneha));

            // Seed Courses
            Course cs201 = new Course(null, "CS201", "Data Structures", darshan);
            Course cs301 = new Course(null, "CS301", "Computer Networks", vaibhav);
            Course cs401 = new Course(null, "CS401", "Database Systems", datta);
            courseRepository.saveAll(Arrays.asList(cs201, cs301, cs401));

            // Enrollments
            enrollmentRepository.save(new CourseEnrollment(null, koushik, cs201));
            enrollmentRepository.save(new CourseEnrollment(null, koushik, cs301));
            enrollmentRepository.save(new CourseEnrollment(null, koushik, cs401));

            // Seed more enrollments
            for (User student : Arrays.asList(shreedevi, pooja, mahadev, sudarshan)) {
                enrollmentRepository.save(new CourseEnrollment(null, student, cs201));
                enrollmentRepository.save(new CourseEnrollment(null, student, cs301));
            }

            // Class Sessions
            ClassSession s1 = new ClassSession(null, cs201, LocalDateTime.now().minusDays(2), true);
            ClassSession s2 = new ClassSession(null, cs201, LocalDateTime.now().minusDays(1), true);
            ClassSession s3 = new ClassSession(null, cs201, LocalDateTime.now().plusHours(2), false); // upcoming today

            ClassSession s4 = new ClassSession(null, cs301, LocalDateTime.now().minusDays(1), true);
            ClassSession s5 = new ClassSession(null, cs301, LocalDateTime.now().plusHours(4), false); // upcoming today

            sessionRepository.saveAll(Arrays.asList(s1, s2, s3, s4, s5));

            // Attendance
            List<User> cs201Students = Arrays.asList(koushik, shreedevi, pooja, mahadev, sudarshan);
            for (User student : cs201Students) {
                // Session 1: Present, Session 2: random
                attendanceRepository.save(new AttendanceRecord(null, s1, student, "Present"));
                String status2 = Math.random() > 0.3 ? "Present" : "Absent";
                attendanceRepository.save(new AttendanceRecord(null, s2, student, status2));
            }

            for (User student : cs201Students) {
                attendanceRepository.save(new AttendanceRecord(null, s4, student, "Present"));
            }
            System.out.println("Dummy Data Initialized Seeder...");
        };
    }

    private User createUser(String name, String email, String role, String qrToken) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        // Seed users with BCrypt-encoded passwords so authentication remains consistent
        user.setPassword(passwordEncoder.encode(name.toLowerCase() + "@123"));
        user.setRole(role);
        user.setStatus("ACTIVE"); // explicitly make active so auth works out of the box
        user.setQrToken(qrToken);
        return user;
    }
}
