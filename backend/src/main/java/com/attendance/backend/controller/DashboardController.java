package com.attendance.backend.controller;

import com.attendance.backend.model.*;
import com.attendance.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRepository;

    @Autowired
    private ClassSessionRepository sessionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping("/student/{id}")
    public ResponseEntity<?> getStudentDashboard(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent())
            {
                return ResponseEntity.notFound().build();
            }
            User student = userOpt.get();

            List<AttendanceRecord> records = attendanceRepository.findByStudent(student);

            long present = records.stream().filter(r -> r.getStatus().equalsIgnoreCase("Present")).count();
            long absent = records.stream().filter(r -> r.getStatus().equalsIgnoreCase("Absent")).count();
            long late = records.stream().filter(r -> r.getStatus().equalsIgnoreCase("Late")).count();
            long excused = records.stream().filter(r -> r.getStatus().equalsIgnoreCase("Excused")).count();
            long total = present + absent + late + excused;

            double overall = total == 0 ? 0 : (double) present / total * 100;

            List<CourseEnrollment> enrollments = enrollmentRepository.findByStudent(student);
            List<ClassSession> upcoming = new ArrayList<>();
            // mock upcoming classes safely from mock enrollments
            for (CourseEnrollment e : enrollments) {
                List<ClassSession> sessions = sessionRepository.findByCourse(e.getCourse());
                upcoming.addAll(sessions.stream().filter(s -> !s.isMarked()).collect(Collectors.toList()));
            }

            Map<String, Object> data = new HashMap<>();
            data.put("overallAttendance", Math.round(overall));
            data.put("classesAttended", present);
            data.put("totalClasses", total);
            data.put("absentDays", absent);
            data.put("lateArrivals", late);

            // formats for charts
            data.put("statusData", Arrays.asList(
                    Map.of("name", "Present", "value", present, "color", "hsl(142, 71%, 45%)"),
                    Map.of("name", "Absent", "value", absent, "color", "hsl(0, 84%, 60%)"),
                    Map.of("name", "Late", "value", late, "color", "hsl(38, 92%, 50%)"),
                    Map.of("name", "Excused", "value", excused, "color", "hsl(172, 66%, 45%)")));

            // activities mapped
            List<Map<String, Object>> activities = records.stream().map(r -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", r.getId().toString());
                map.put("type", r.getStatus().toLowerCase());
                map.put("subject", r.getSession().getCourse().getName());
                map.put("time", r.getSession().getSessionTime().toString());
                map.put("date", r.getSession().getSessionTime().toLocalDate().toString());
                return map;
            }).collect(Collectors.toList());
            data.put("recentActivities", activities);

            List<Map<String, Object>> upcomingMapped = upcoming.stream().map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId().toString());
                map.put("subject", s.getCourse().getName());
                map.put("time", s.getSessionTime().toString());
                map.put("room", "Room 303"); // mock room
                map.put("instructor", s.getCourse().getFaculty().getName());
                map.put("isNow", false);
                return map;
            }).collect(Collectors.toList());
            data.put("upcomingClasses", upcomingMapped);

            return ResponseEntity.ok(data);
        } catch (Exception ex) {
            logger.error("Failed to load student dashboard for id={}", id, ex);
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to load student dashboard data"));
        }
    }

    @GetMapping("/faculty/{id}")
    public ResponseEntity<?> getFacultyDashboard(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent())
            {
                return ResponseEntity.notFound().build();
            }
            User faculty = userOpt.get();

            List<Course> courses = courseRepository.findByFaculty(faculty);
            List<User> students = new ArrayList<>();
            List<Map<String, Object>> todayClasses = new ArrayList<>();
            List<Map<String, Object>> upcomingPendingClasses = new ArrayList<>();

            for (Course c : courses) {
                List<CourseEnrollment> enrollments = enrollmentRepository.findByCourse(c);
                for (CourseEnrollment e : enrollments) {
                    if (!students.contains(e.getStudent())) {
                        students.add(e.getStudent());
                    }
                }

                List<ClassSession> sessions = sessionRepository.findByCourse(c);
                LocalDate today = LocalDate.now();
                for (ClassSession s : sessions) {
                    // Only show sessions that are still pending (not marked).
                    // The UI calls this "Today's Classes", but if there are no pending sessions today,
                    // we fallback to upcoming pending sessions so faculty can still mark attendance.
                    if (s.isMarked()) continue;

                    LocalDate sessionDate = s.getSessionTime().toLocalDate();
                    Map<String, Object> tc = new HashMap<>();
                    tc.put("id", s.getId().toString());
                    tc.put("name", c.getName() + " - " + c.getCode());
                    tc.put("time", s.getSessionTime().toString());
                    tc.put("students", enrollments.size());
                    tc.put("marked", false);

                    if (sessionDate.equals(today)) {
                        todayClasses.add(tc);
                    } else if (sessionDate.isAfter(today)) {
                        upcomingPendingClasses.add(tc);
                    }
                }
            }

            // If there are no pending sessions today, surface upcoming pending sessions (soonest first).
            if (todayClasses.isEmpty() && !upcomingPendingClasses.isEmpty()) {
                upcomingPendingClasses.sort(Comparator.comparing(m -> m.get("time").toString()));
                todayClasses = upcomingPendingClasses;
            }

            Map<String, Object> data = new HashMap<>();
            data.put("totalStudents", students.size());
            data.put("classesToday", todayClasses.size());
            data.put("avgAttendance", 85); // mock
            data.put("sessionsMarked", 12); // mock
            data.put("todayClasses", todayClasses);
            data.put("students", students);

            return ResponseEntity.ok(data);
        } catch (Exception ex) {
            logger.error("Failed to load faculty dashboard for id={}", id, ex);
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to load faculty dashboard data"));
        }
    }

    @GetMapping("/session/{id}/students")
    public ResponseEntity<?> getSessionStudents(@PathVariable Long id) {
        Optional<ClassSession> sessionOpt = sessionRepository.findById(id);
        if (!sessionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        ClassSession session = sessionOpt.get();
        List<CourseEnrollment> enrollments = enrollmentRepository.findByCourse(session.getCourse());
        List<User> students = enrollments.stream().map(CourseEnrollment::getStudent).collect(Collectors.toList());

        return ResponseEntity.ok(students);
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminDashboard() {
        try {
            List<User> students = userRepository.findByRole("student");
            List<User> faculty = userRepository.findByRole("faculty");
            List<User> admin = userRepository.findByRole("admin");

            Map<String, Object> data = new HashMap<>();
            data.put("students", students);
            data.put("faculty", faculty);
            data.put("admin", admin);
            data.put("totalUsers", students.size() + faculty.size() + admin.size());
            data.put("overallAttendanceRate", 87);
            data.put("activeSessionsToday", 3);
            data.put("pendingApprovals", 2);

            return ResponseEntity.ok(data);
        } catch (Exception ex) {
            logger.error("Failed to load admin dashboard", ex);
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to load admin dashboard data"));
        }
    }
}
