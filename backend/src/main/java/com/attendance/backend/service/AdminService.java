package com.attendance.backend.service;

import com.attendance.backend.model.AttendanceRecord;
import com.attendance.backend.model.ClassSession;
import com.attendance.backend.model.Course;
import com.attendance.backend.model.User;
import com.attendance.backend.repository.AttendanceRecordRepository;
import com.attendance.backend.repository.ClassSessionRepository;
import com.attendance.backend.repository.CourseEnrollmentRepository;
import com.attendance.backend.repository.CourseRepository;
import com.attendance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ClassSessionRepository sessionRepository;

    @Transactional
    public void deleteUserCascade(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole() == null ? "" : user.getRole().toLowerCase();

        if ("student".equals(role)) {
            // Existing students may have enrollments + attendance records -> delete dependents first.
            List<AttendanceRecord> records = attendanceRecordRepository.findByStudent(user);
            if (!records.isEmpty()) {
                attendanceRecordRepository.deleteAll(records);
            }

            var enrollments = enrollmentRepository.findByStudent(user);
            if (!enrollments.isEmpty()) {
                enrollmentRepository.deleteAll(enrollments);
            }
        } else if ("faculty".equals(role)) {
            // Existing faculty may own courses -> sessions -> attendance records + enrollments.
            List<Course> courses = courseRepository.findByFaculty(user);
            for (Course course : courses) {
                List<ClassSession> sessions = sessionRepository.findByCourse(course);
                for (ClassSession session : sessions) {
                    List<AttendanceRecord> sessionRecords = attendanceRecordRepository.findBySession(session);
                    if (!sessionRecords.isEmpty()) {
                        attendanceRecordRepository.deleteAll(sessionRecords);
                    }
                }

                if (!sessions.isEmpty()) {
                    sessionRepository.deleteAll(sessions);
                }

                var courseEnrollments = enrollmentRepository.findByCourse(course);
                if (!courseEnrollments.isEmpty()) {
                    enrollmentRepository.deleteAll(courseEnrollments);
                }
            }

            if (!courses.isEmpty()) {
                courseRepository.deleteAll(courses);
            }
        }

        userRepository.delete(user);
    }
}

