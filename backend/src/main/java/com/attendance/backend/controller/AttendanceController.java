package com.attendance.backend.controller;

import com.attendance.backend.model.*;
import com.attendance.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private static final Logger log = LoggerFactory.getLogger(AttendanceController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassSessionRepository sessionRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> payload) {
        if (payload == null) {
            log.info("POST /api/attendance/mark payloadKeys=null");
            log.warn("Attendance mark rejected: missing request body");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing request body"));
        }
        log.info("POST /api/attendance/mark payloadKeys={}", payload.keySet());
        // Support both legacy QR-token based flow and new JSON-based QR with studentId/classId
        String qrToken = payload.get("qrToken") != null ? payload.get("qrToken").toString() : null;
        Long studentId = null;
        try {
            studentId = payload.get("studentId") != null ? Long.valueOf(payload.get("studentId").toString()) : null;
        } catch (Exception ex) {
            log.warn("Attendance mark rejected: invalid studentId");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid student identifier"));
        }
        Long sessionId = null;
        try {
            if (payload.get("sessionId") != null) {
                sessionId = Long.valueOf(payload.get("sessionId").toString());
            } else if (payload.get("classId") != null) {
                sessionId = Long.valueOf(payload.get("classId").toString());
            }
        } catch (Exception ex) {
            log.warn("Attendance mark rejected: invalid sessionId/classId");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid class/session identifier"));
        }

        if (sessionId == null) {
            log.warn("Attendance mark rejected: missing sessionId/classId");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing class/session identifier"));
        }

        Optional<User> studentOpt;
        if (studentId != null) {
            studentOpt = userRepository.findById(studentId);
        } else if (qrToken != null) {
            studentOpt = userRepository.findByQrToken(qrToken);
        } else {
            log.warn("Attendance mark rejected: missing student info");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing student information in QR payload"));
        }

        // 1. Validate Student
        if (!studentOpt.isPresent() || !"student".equalsIgnoreCase(studentOpt.get().getRole())) {
            log.warn("Attendance mark rejected: invalid student");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid or expired QR code"));
        }
        User student = studentOpt.get();

        // 2. Validate Session
        Optional<ClassSession> sessionOpt = sessionRepository.findById(sessionId);
        if (!sessionOpt.isPresent()) {
            log.warn("Attendance mark rejected: invalid session");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid session"));
        }
        ClassSession session = sessionOpt.get();

        // 3. Ensure student is enrolled in the session's course
        List<CourseEnrollment> enrollments = enrollmentRepository.findByStudent(student);
        boolean isEnrolled = enrollments.stream()
                .anyMatch(e -> e.getCourse().getId().equals(session.getCourse().getId()));
        if (!isEnrolled) {
            log.warn("Attendance mark rejected: student not enrolled");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Student is not enrolled in this course"));
        }

        // 4. Check for duplicates
        List<AttendanceRecord> existingRecords = attendanceRepository.findBySession(session);
        boolean alreadyMarked = existingRecords.stream().anyMatch(r -> r.getStudent().getId().equals(student.getId()));
        if (alreadyMarked) {
            log.warn("Attendance mark rejected: duplicate attendance");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Attendance already marked for this student"));
        }

        // 5. Save the attendance record
        AttendanceRecord record = new AttendanceRecord(null, session, student, "Present");
        AttendanceRecord saved = attendanceRepository.save(record);
        log.info("Attendance saved: {}", saved.getId());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Attendance marked successfully",
                "data", Map.of("studentName", student.getName())));
    }

    @PostMapping({"/manual", "/mark-manual"})
    public ResponseEntity<?> markManualAttendance(@RequestBody ManualAttendanceRequest request) {
        Long sessionId = request.getSessionId();
        Optional<ClassSession> sessionOpt = sessionRepository.findById(sessionId);

        if (!sessionOpt.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid session"));
        }

        ClassSession session = sessionOpt.get();
        List<AttendanceRecord> existingRecords = attendanceRepository.findBySession(session);

        // Count updates vs inserts
        int markedCount = 0;

        for (ManualAttendanceRequest.StudentAttendance sa : request.getAttendanceList()) {
            Optional<User> studentOpt = userRepository.findById(sa.getStudentId());
            if (studentOpt.isPresent() && "student".equalsIgnoreCase(studentOpt.get().getRole())) {
                User student = studentOpt.get();

                // Check if existing
                Optional<AttendanceRecord> existing = existingRecords.stream()
                        .filter(r -> r.getStudent().getId().equals(student.getId()))
                        .findFirst();

                if (existing.isPresent()) {
                    AttendanceRecord record = existing.get();
                    record.setStatus(sa.getStatus());
                    attendanceRepository.save(record);
                } else {
                    AttendanceRecord record = new AttendanceRecord(null, session, student, sa.getStatus());
                    attendanceRepository.save(record);
                }
                markedCount++;
            }
        }

        // Mark session as marked if not already
        if (!session.isMarked()) {
            session.setMarked(true);
            sessionRepository.save(session);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Attendance saved successfully for " + markedCount + " students.",
                "data", Map.of("markedCount", markedCount)));
    }
}
